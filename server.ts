/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_VILLAS, INITIAL_REVIEWS } from './src/data.ts';
import { Villa, Review, Booking, NotificationLog } from './src/types.ts';

// Ensure proper initial database files in standard temporary or local files
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const VILLAS_FILE = path.join(DATA_DIR, 'villas.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const NOTIFICATION_LOGS_FILE = path.join(DATA_DIR, 'notification_logs.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Helper to load or initialize files
function loadData<T>(filePath: string, initialData: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const dataString = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(dataString) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}, re-initializing:`, err);
  }
  fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

function saveData<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error saving to ${filePath}:`, err);
  }
}

// Initial storage configurations
let villas: Villa[] = loadData(VILLAS_FILE, INITIAL_VILLAS);
let reviews: Review[] = loadData(REVIEWS_FILE, INITIAL_REVIEWS);
let bookings: Booking[] = loadData(BOOKINGS_FILE, []);
let notificationLogs: NotificationLog[] = loadData(NOTIFICATION_LOGS_FILE, []);
let settings: { whatsappNumber: string; slides?: string[] } = loadData(SETTINGS_FILE, { whatsappNumber: '628123456789' });

// Initialize server-side Gemini AI
let geminiClient: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;

if (api_key && api_key !== 'MY_GEMINI_API_KEY') {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: api_key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini client initialized successfully.');
  } catch (e) {
    console.error('Failed to initialize Gemini Client:', e);
  }
} else {
  console.log('No GEMINI_API_KEY supplied, AI features will run in elegant rule-based fallback.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -----------------------------------------------------------------
  // API Endpoints
  // -----------------------------------------------------------------

  // 1. Villa list
  app.get('/api/villas', (req, res) => {
    // Dynamically calculate average rating and review counts on target villas
    const enrichedVillas = villas.map((v) => {
      const villaReviews = reviews.filter((r) => r.villaId === v.id);
      if (villaReviews.length === 0) {
        return { ...v, rating: 4.5, reviewCount: 0 };
      }
      const sum = villaReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = parseFloat((sum / villaReviews.length).toFixed(1));
      return { ...v, rating: avg, reviewCount: villaReviews.length };
    });
    res.json(enrichedVillas);
  });

  // 2. Reviews for a villa
  app.get('/api/villas/:villaId/reviews', (req, res) => {
    const { villaId } = req.params;
    const villaReviews = reviews.filter((r) => r.villaId === villaId);
    // Sort from newest review
    villaReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(villaReviews);
  });

  // 3. Post layout review
  app.post('/api/villas/:villaId/reviews', (req, res) => {
    const { villaId } = req.params;
    const { guestName, rating, comment } = req.body;

    if (!guestName || !rating || !comment) {
      return res.status(400).json({ error: 'Nama, rating, dan komentar wajib diisi' });
    }

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      villaId,
      guestName,
      rating: Number(rating),
      comment,
      date: new Date().toISOString().split('T')[0],
    };

    reviews.push(newReview);
    saveData(REVIEWS_FILE, reviews);

    // Filter updated ratings
    const villaReviews = reviews.filter((r) => r.villaId === villaId);
    const sum = villaReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / villaReviews.length).toFixed(1));

    // Update rating in matching static villa list
    const villaIndex = villas.findIndex((v) => v.id === villaId);
    if (villaIndex !== -1) {
      villas[villaIndex].rating = avg;
      saveData(VILLAS_FILE, villas);
    }

    res.json({ success: true, review: newReview, updatedRating: avg });
  });

  // 4. Booking calendar and submit
  app.get('/api/villas/:villaId/unavailable-dates', (req, res) => {
    const { villaId } = req.params;
    const activeBookings = bookings.filter((b) => b.villaId === villaId && b.status !== 'cancelled');
    
    // Accumulate all unavailable dates in a list
    const dates: string[] = [];
    activeBookings.forEach((b) => {
      let current = new Date(b.startDate);
      const end = new Date(b.endDate);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    res.json(dates);
  });

  app.post('/api/bookings', (req, res) => {
    const { villaId, guestName, guestEmail, guestPhone, startDate, endDate, paymentMethod } = req.body;

    if (!villaId || !guestName || !guestEmail || !guestPhone || !startDate || !endDate || !paymentMethod) {
      return res.status(400).json({ error: 'Data pemesanan tidak lengkap.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ error: 'Tanggal check-out harus lebih lambat dari tanggal check-in.' });
    }

    // Double check availability (real-time booking guarantee)
    const activeBookings = bookings.filter((b) => b.villaId === villaId && b.status !== 'cancelled');
    const hasConflict = activeBookings.some((b) => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return (start <= bEnd && end >= bStart);
    });

    if (hasConflict) {
      return res.status(400).json({ error: 'Maaf, villa sudah dipesan untuk tanggal yang Anda ajukan.' });
    }

    const matchedVilla = villas.find((v) => v.id === villaId);
    if (!matchedVilla) {
      return res.status(404).json({ error: 'Villa tidak ditemukan.' });
    }

    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = matchedVilla.pricePerNight * nights;

    const newBooking: Booking = {
      id: `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      villaId,
      guestName,
      guestEmail,
      guestPhone,
      startDate,
      endDate,
      totalNights: nights,
      totalPrice,
      paymentMethod,
      status: paymentMethod === 'wa_admin' ? 'pending' : 'paid', // 'wa_admin' needs manual verification
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    saveData(BOOKINGS_FILE, bookings);

    // -------------------------------------------------------------
    // AUTOMATIC NOTIFICATION EMAIL TO WHATSAPP INTEGRATION SIMULATION
    // As per user instructions: "sistem notifikasi email otomatis ke wa yang dikirim client/pemesan kamar villa untuk setiap konfirmasi pesanan masuk"
    // When a booking comes in:
    // 1. We simulate sending an Email Confirmation to the Guest (client)
    // 2. We convert or forward this Email Notification automatically into an Admin / Client WA template!
    // We log these in notification logs for visual transparent tracing in the frontend.
    // -------------------------------------------------------------

    // A. Guest Email Confirmation Simulation Log
    const emailSubject = `Konfirmasi Booking: ${matchedVilla.name}`;
    const emailBody = `Halo ${guestName},\n\nTerima kasih telah memesan ${matchedVilla.name} di Sewa Villa Batu.\n\nDetail Pesanan:\n- ID Booking: ${newBooking.id}\n- Check-in: ${startDate}\n- Check-out: ${endDate}\n- Durasi: ${nights} Malam\n- Total Biaya: Rp ${totalPrice.toLocaleString('id-ID')}\n- Metode Pembayaran: ${paymentMethod.toUpperCase()}\n\nHarap simpan email ini sebagai tanda bukti pemesanan Anda.`;
    
    const emailLog: NotificationLog = {
      id: `notif-email-${Date.now()}-1`,
      bookingId: newBooking.id,
      type: 'email',
      recipient: guestEmail,
      subjectOrHeader: emailSubject,
      body: emailBody,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };

    // B. Direct forwarding of this email notification to WhatsApp.
    // Realized as: Simulated Automatic Email-to-WA Gateway logs + instant WhatsApp redirect configuration URL template
    const waHeader = `📢 [EMAIL DISALURKAN KE WA] NOTIFIKASI BOOKING MASUK`;
    const waBody = `Halo Admin Sewa Villa Batu!\n\nPemesanan Villa selesai diproses & dikonfirmasi!\n\n📋 DETAIL BOOKING:\n• No. Booking: ${newBooking.id}\n• Nama Tamu: ${guestName}\n• Email: ${guestEmail}\n• No. Telp: ${guestPhone}\n• Villa: ${matchedVilla.name}\n• Jadwal: ${startDate} s/d ${endDate} (${nights} Malam)\n• Total Tarif: Rp ${totalPrice.toLocaleString('id-ID')}\n• Pembayaran: ${paymentMethod === 'wa_admin' ? 'WhatsApp Admin (Menunggu Konformasi)' : 'Online Lunas (Simulasi)'}\n\nSistem telah otomatis mengirim email konfirmasi ke *${guestEmail}* dan meneruskannya ke WhatsApp ini.`;

    const waLog: NotificationLog = {
      id: `notif-wa-${Date.now()}-2`,
      bookingId: newBooking.id,
      type: 'wa',
      recipient: guestPhone,
      subjectOrHeader: waHeader,
      body: waBody,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };

    notificationLogs.push(emailLog, waLog);
    saveData(NOTIFICATION_LOGS_FILE, notificationLogs);

    res.json({
      success: true,
      booking: newBooking,
      villaName: matchedVilla.name,
      notificationLogs: [emailLog, waLog],
    });
  });

  // 5. Get list of bookings
  app.get('/api/bookings', (req, res) => {
    res.json(bookings);
  });

  // 6. Get notification logs
  app.get('/api/notifications', (req, res) => {
    res.json(notificationLogs);
  });

  // 7. Get single booking with details
  app.get('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const booking = bookings.find((b) => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Reservasi tidak ditemukan.' });
    }
    const villa = villas.find((v) => v.id === booking.villaId);
    res.json({ booking, villa });
  });

  // 7a. Get Settings
  app.get('/api/settings', (req, res) => {
    const defaultSlides = [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85'
    ];
    if (!settings.slides || !Array.isArray(settings.slides) || settings.slides.length === 0) {
      settings.slides = defaultSlides;
    }
    res.json(settings);
  });

  // 7b. Update Settings
  app.post('/api/settings', (req, res) => {
    const { whatsappNumber, slides } = req.body;
    if (!whatsappNumber) {
      return res.status(400).json({ error: 'Nomer WhatsApp wajib diisi.' });
    }
    settings.whatsappNumber = whatsappNumber;
    if (Array.isArray(slides)) {
      settings.slides = slides.map(s => s.trim()).filter(s => s.length > 0);
    }
    saveData(SETTINGS_FILE, settings);
    res.json({ success: true, settings });
  });

  // 7c. Create Villa (Product CRUD - Create)
  app.post('/api/villas', (req, res) => {
    const { name, description, location, address, pricePerNight, bedrooms, bathrooms, maxGuests, amenities, images, lat, lng, seoTitle, seoDescription } = req.body;
    if (!name || !pricePerNight) {
      return res.status(400).json({ error: 'Nama villa dan tarif wajib diisi.' });
    }
    const newVilla: Villa = {
      id: `villa-${Date.now()}`,
      name,
      description: description || 'Tidak ada deskripsi.',
      location: location || 'Batu',
      address: address || 'Batu, Jawa Timur',
      pricePerNight: Number(pricePerNight),
      bedrooms: Number(bedrooms || 1),
      bathrooms: Number(bathrooms || 1),
      maxGuests: Number(maxGuests || 2),
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
      lat: Number(lat || -7.8712),
      lng: Number(lng || 112.5268),
      rating: 4.5,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || ''
    };
    villas.push(newVilla);
    saveData(VILLAS_FILE, villas);
    res.json({ success: true, villa: newVilla });
  });

  // 7d. Update Villa (Product CRUD - Update)
  app.put('/api/villas/:id', (req, res) => {
    const { id } = req.params;
    const villaIndex = villas.findIndex(v => v.id === id);
    if (villaIndex === -1) {
      return res.status(404).json({ error: 'Villa tidak ditemukan.' });
    }
    const { name, description, location, address, pricePerNight, bedrooms, bathrooms, maxGuests, amenities, images, lat, lng, seoTitle, seoDescription } = req.body;
    
    villas[villaIndex] = {
      ...villas[villaIndex],
      name: name || villas[villaIndex].name,
      description: description !== undefined ? description : villas[villaIndex].description,
      location: location || villas[villaIndex].location,
      address: address || villas[villaIndex].address,
      pricePerNight: pricePerNight !== undefined ? Number(pricePerNight) : villas[villaIndex].pricePerNight,
      bedrooms: bedrooms !== undefined ? Number(bedrooms) : villas[villaIndex].bedrooms,
      bathrooms: bathrooms !== undefined ? Number(bathrooms) : villas[villaIndex].bathrooms,
      maxGuests: maxGuests !== undefined ? Number(maxGuests) : villas[villaIndex].maxGuests,
      amenities: Array.isArray(amenities) ? amenities : villas[villaIndex].amenities,
      images: Array.isArray(images) ? images : villas[villaIndex].images,
      lat: lat !== undefined ? Number(lat) : villas[villaIndex].lat,
      lng: lng !== undefined ? Number(lng) : villas[villaIndex].lng,
      seoTitle: seoTitle !== undefined ? seoTitle : villas[villaIndex].seoTitle,
      seoDescription: seoDescription !== undefined ? seoDescription : villas[villaIndex].seoDescription,
    };
    
    saveData(VILLAS_FILE, villas);
    res.json({ success: true, villa: villas[villaIndex] });
  });

  // 7e. Delete Villa (Product CRUD - Delete)
  app.delete('/api/villas/:id', (req, res) => {
    const { id } = req.params;
    const initialCount = villas.length;
    villas = villas.filter(v => v.id !== id);
    if (villas.length === initialCount) {
      return res.status(404).json({ error: 'Villa tidak ditemukan.' });
    }
    saveData(VILLAS_FILE, villas);
    res.json({ success: true, message: 'Villa berhasil dihapus.' });
  });

  // 7f. Update Booking Status / Cancel booking (Availability CRUD - Update)
  app.put('/api/bookings/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid.' });
    }
    
    const bookingIndex = bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Reservasi tidak ditemukan.' });
    }
    
    bookings[bookingIndex].status = status;
    saveData(BOOKINGS_FILE, bookings);
    res.json({ success: true, booking: bookings[bookingIndex] });
  });

  // 8. AI Consultant Chat integration using `@google/genai` sdk
  app.post('/api/gemini/consultant', async (req, res) => {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt wajib diisi.' });
    }

    if (!geminiClient) {
      // Elegant rule-based fallback when Gemini API limit or Key is missing
      const lowerPrompt = prompt.toLowerCase();
      let reply = '';
      if (lowerPrompt.includes('rekomendasi') || lowerPrompt.includes('recom') || lowerPrompt.includes('saran')) {
        reply = `Halo! Saya adalah Asisten Sewa Villa Batu. Berhubung API key sedang tidak aktif atau belum diatur oleh admin, saya memberikan rekomendasi otomatis:\n\n1. **Untuk Keluarga Besar (10-15 orang)**: **Villa Kusuma Hills Sunrise** (Infinity pool, 5 kamar) atau **Villa Pine Forest Batu** (Hutan pinus sejuk, kolam air hangat, 4 kamar).\n2. **Dekat Wisata Jatim Park / BNS**: **Villa Sky Garden Oro-Oro Ombo** (Dekat banget Jatim Park 2 & BNS, ada Rooftop Sky Garden, koki dapur, hemat).\n3. **Ketenangan / Pegunungan Tradisional**: **Villa Heritage Songgoriti Warmth** (Pemandian/suasana klasik, air hangat alam, gazebo, romantis).\n\nMau saya bantu hitungkan perkiraan harganya? Silakan sebutkan nama villa dan berapa malam yang ingin Anda pesan!`;
      } else if (lowerPrompt.includes('harga') || lowerPrompt.includes('tarif') || lowerPrompt.includes('murah')) {
        reply = `Harga villa kami bervariasi sesuai fasilitas:\n- **Villa Sky Garden Oro-Oro Ombo**: Rp 1.450.000/malam (Hemat & Dekat Jatim Park 2)\n- **Villa Heritage Songgoriti**: Rp 1.600.000/malam (Arsitektur Klasik & Sauna)\n- **Villa Pine Forest Batu**: Rp 1.850.000/malam (Kolam Air Hangat & Hutan Pinus/Arjuno View)\n- **Villa Kusuma Hills Sunrise**: Rp 2.750.000/malam (Infinity Pool & Sunset Rooftop Mewah)\n\nSemua villa dilengkapi kolam renang pribadi, WIFI kencang, karaoke, dan peralatan BBQ lengkap. Silakan lakukan booking instan secara real-time di website kami!`;
      } else if (lowerPrompt.includes('faq') || lowerPrompt.includes('bagaimana') || lowerPrompt.includes('bayar') || lowerPrompt.includes('pesan')) {
        reply = `Proses pemesanan sangat mudah:\n1. Pilih Villa favorit Anda di halaman beranda.\n2. Klik **Pesan Sekarang**, lalu masukkan Tanggal Check-in & Check-out serta data diri Anda.\n3. Pilih metode pembayaran: **Transfer Bank/QRIS (Simulasi Instan)** atau **WhatsApp Admin**.\n4. Sistem akan mengirim email konfirmasi otomatis dan meneruskannya langsung ke nomor WhatsApp Admin dalam detik itu juga untuk divalidasi!\n\nJika ada pertanyaan mengenai lokasi, Anda juga bisa langsung berinteraksi dengan peta interaktif kami di bawah halaman utama.`;
      } else {
        reply = `Halo! Saya Asisten Virtual Sewa Villa Batu. Saya siap mendampingi perjalanan wisata Anda di Kota Batu. Anda bisa bertanya tentang rekomendasi villa terbaik, fasilitas lengkap, tarif menginap, lokasi objek wisata populer di Batu, ataupun cara pembayaran. Apa yang ingin Anda ketahui hari ini? 😊`;
      }
      return res.json({ reply });
    }

    try {
      // Build systemic list of villas to feed as pristine context so Gemini has absolute accurate knowledge
      const villasContext = INITIAL_VILLAS.map((v) => (
        `- ${v.name}: Lokasi ${v.location}, Tarif Rp ${v.pricePerNight.toLocaleString('id-ID')}/malam, Kamar tidur: ${v.bedrooms}, Kapasitas maks: ${v.maxGuests} orang, Keunggulan: ${v.description}. Fasilitas utama: ${v.amenities.join(', ')}.`
      )).join('\n');

      const systemInstruction = `Anda adalah "BatuVilla AI Assistant", pemandu lokal pariwisata Batu dan konsultan sewa villa khusus di website "Sewa Villa Batu".
Tugas Anda mendampingi calon penyewa dengan ramah, informatif, profesional, dan menggunakan bahasa Indonesia yang santun serta hangat.
Gunakan detail villa berikut ini untuk memberikan rekomendasi aktual yang akurat (jangan membuat nama villa palsu):
${villasContext}

Aturan interaksi:
- Berikan saran yang objektif berdasarkan preferensi kelompok, budget, atau lokasi wisata terdekat.
- Jelaskan metode pembayaran di website kami: Online Payment (Virtual Account/QRIS instan) atau Chat ke WhatsApp Admin manual.
- Informasikan bahwa sistem kami langsung memproses email konfirmasi otomatis dan mengoperasikannya langsung ke WA admin secara instan untuk melayani tamu.
- Selalu ajak pengguna untuk mencoba booking langsung secara real-time pada interface yang disediakan dikanan screen.`;

      // Build contents using Gemini API guidelines
      // Combining the history and the new request. Let's make it standard
      // Structure: history can be passed inside contents or we can format everything in a conversational structure for robustness
      const apiHistory = (history || []).map((h: { sender: 'user' | 'bot'; text: string }) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));

      // Append new user message
      const contents = [...apiHistory, { role: 'user', parts: [{ text: prompt }] }];

      const response = await geminiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text });
    } catch (apiError) {
      console.error('Gemini API call failed, reporting error:', apiError);
      res.status(500).json({ error: 'Gagal menghubungi asisten AI.' });
    }
  });

  // Vite development integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is booted at http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
