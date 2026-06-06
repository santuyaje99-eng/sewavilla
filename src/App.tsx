/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  CheckCircle,
  Phone,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  CreditCard,
  QrCode,
  Send,
  Bot,
  Tv,
  Wifi,
  Utensils,
  Maximize2,
  ThumbsUp,
  Inbox,
  Clock,
  Car,
  Plus,
  Edit,
  Trash2,
  Settings,
  Shield,
  Layers,
  Lock
} from 'lucide-react';
import Header from './components/Header.tsx';
import VillaCard from './components/VillaCard.tsx';
import { Villa, Review, Booking, NotificationLog } from './types.ts';

// Main Tourist Landmarks in Batu for driving distance and route simulator
const BATU_LANDMARKS = [
  { name: 'Alun-Alun Kota Batu', lat: -7.8712, lng: 112.5268, desc: 'Pusat kuliner ketan & bianglala' },
  { name: 'Jatim Park 2 (Secret Zoo)', lat: -7.8894, lng: 112.5291, desc: 'Sangat populer untuk keluarga' },
  { name: 'Jatim Park 3 (Dino Park)', lat: -7.8997, lng: 112.5539, desc: 'Taman dino & wahana modern' },
  { name: 'Songgoriti Hot Spring', lat: -7.8580, lng: 112.5035, desc: 'Pemandian air panas belerang alami' },
  { name: 'Museum Angkut', lat: -7.8791, lng: 112.5204, desc: 'Koleksi mobil klasik terbesar' }
];

export default function App() {
  // State variables
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loadingVillas, setLoadingVillas] = useState(true);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(3000000);
  const [minBedrooms, setMinBedrooms] = useState(0);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    startDate: '',
    endDate: '',
    paymentMethod: 'qris' as 'qris' | 'transfer' | 'wa_admin',
    guestsNumber: 2
  });

  // Booking result/simulated payment screens
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    booking?: Booking;
    villaName?: string;
    notificationLogs?: NotificationLog[];
  } | null>(null);
  
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);

  // Interactive Live Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({
    guestName: '',
    rating: 5,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  
  // Interactive Custom Map View State (Simulated GIS Engine)
  const [hoveredVilla, setHoveredVilla] = useState<Villa | null>(null);
  const [selectedMapVilla, setSelectedMapVilla] = useState<Villa | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<typeof BATU_LANDMARKS[0]>(BATU_LANDMARKS[0]);

  // AI virtual assistant state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessageInput, setAiMessageInput] = useState('');
  const [aiHistory, setAiHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Halo! Selamat datang di BatuStay. Saya adalah Asisten AI BatuStay. Saya bisa membantu merekomendasikan villa terbaik sesuai budget, dekat tempat wisata favorit Anda, atau membantu merencanakan liburan asik Anda di Batu. Ada yang bisa saya bantu hari ini? 😊' }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // System logs window for transparent email-to-wa forwarding visual trace
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  // Refs for auto-scroll navs
  const villasSectionRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Admin & Settings States
  const [whatsappNumber, setWhatsappNumber] = useState('628123456789');
  const [adminOpen, setAdminOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const ADMIN_PIN = '2026'; // Simple customizable local passcode

  const [adminTab, setAdminTab] = useState<'settings' | 'villas' | 'bookings'>('villas');
  const [adminBookings, setAdminBookings] = useState<Booking[]>([]);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [sliderImages, setSliderImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85'
  ]);
  const [slidesInput, setSlidesInput] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingVillaId, setEditingVillaId] = useState<string | null>(null);
  const [showVillaFormModal, setShowVillaFormModal] = useState(false);
  const [isSubmittingVilla, setIsSubmittingVilla] = useState(false);
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setPinError('');
      setPinInput('');
      setShowPinModal(false);
      setAdminOpen(true);
    } else {
      setPinError('PIN Akses Salah. Silahkan coba lagi.');
    }
  };
  
  const [villaForm, setVillaForm] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    pricePerNight: 1500000,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 8,
    amenitiesInput: '',
    imagesInput: '',
    lat: -7.8712,
    lng: 112.5268,
    seoTitle: '',
    seoDescription: ''
  });

  const [dateBlockForm, setDateBlockForm] = useState({
    villaId: '',
    startDate: '',
    endDate: ''
  });

  // Fetch villas & notification logs on startup
  useEffect(() => {
    fetchVillas();
    fetchNotificationLogs();
    fetchSettings();
    fetchBookings();

    // Check URL parameters for premium secret access
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('manage') === 'true') {
      setShowPinModal(true);
    }
  }, []);

  // Slide Rotation Effect
  useEffect(() => {
    if (sliderImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Dynamic SEO metadata & title updater
  useEffect(() => {
    if (selectedVilla) {
      const targetTitle = selectedVilla.seoTitle 
        ? selectedVilla.seoTitle 
        : `${selectedVilla.name} — Sewa Villa Batu Terbaik`;
      const targetDesc = selectedVilla.seoDescription 
        ? selectedVilla.seoDescription 
        : `Sewa ${selectedVilla.name} di Kota Batu. Fasilitas Lengkap: ${selectedVilla.amenities.slice(0, 4).join(', ')}. Booking online instan aman via WhatsApp!`;
      
      document.title = targetTitle;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', targetDesc);
    } else {
      document.title = "BatuStay - Sewa Villa Wisata Batu Terbaik";
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', "Platform sewa villa di Kota Wisata Batu terlengkap, aman, terpercaya dengan sistem direct WhatsApp.");
      }
    }
  }, [selectedVilla]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber);
        }
        if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
          setSliderImages(data.slides);
          setSlidesInput(data.slides.join(', '));
        } else {
          setSlidesInput(sliderImages.join(', '));
        }
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setAdminBookings(data);
      }
    } catch (e) {
      console.error('Error fetching bookings:', e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setAdminError(null);
    setAdminSuccess(null);
    try {
      const slidesArray = slidesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber, slides: slidesArray })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings && data.settings.slides) {
          setSliderImages(data.settings.slides);
          setSlidesInput(data.settings.slides.join(', '));
        }
        setAdminSuccess('Nomer WhatsApp & Slide Foto Header berhasil disimpan!');
      } else {
        const data = await res.json();
        setAdminError(data.error || 'Gagal menyimpan pengaturan WhatsApp.');
      }
    } catch (err) {
      setAdminError('Gangguan jaringan. Gagal menghubungi server.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleOpenNewVilla = () => {
    setEditingVillaId(null);
    setVillaForm({
      name: '',
      description: '',
      location: 'Bumiaji, Batu',
      address: 'Jl. Raya Batu No. 10, Batu, Jawa Timur',
      pricePerNight: 1500000,
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 8,
      amenitiesInput: 'Private Pool, Wifi Kecepatan Tinggi (100Mbps), Smart TV, Alat BBQ lengkap, Pemandangan Gunung, Dapur Lengkap',
      imagesInput: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80, https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      lat: -7.8712,
      lng: 112.5268,
      seoTitle: '',
      seoDescription: ''
    });
    setAdminError(null);
    setAdminSuccess(null);
    setShowVillaFormModal(true);
  };

  const handleOpenEditVilla = (villa: Villa) => {
    setEditingVillaId(villa.id);
    setVillaForm({
      name: villa.name,
      description: villa.description,
      location: villa.location,
      address: villa.address,
      pricePerNight: villa.pricePerNight,
      bedrooms: villa.bedrooms,
      bathrooms: villa.bathrooms,
      maxGuests: villa.maxGuests,
      amenitiesInput: villa.amenities.join(', '),
      imagesInput: villa.images.join(', '),
      lat: villa.lat,
      lng: villa.lng,
      seoTitle: villa.seoTitle || '',
      seoDescription: villa.seoDescription || ''
    });
    setAdminError(null);
    setAdminSuccess(null);
    setShowVillaFormModal(true);
  };

  const handleSaveVilla = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVilla(true);
    setAdminError(null);
    setAdminSuccess(null);

    const amenities = villaForm.amenitiesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const images = villaForm.imagesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const payload = {
      name: villaForm.name,
      description: villaForm.description,
      location: villaForm.location,
      address: villaForm.address,
      pricePerNight: Number(villaForm.pricePerNight),
      bedrooms: Number(villaForm.bedrooms),
      bathrooms: Number(villaForm.bathrooms),
      maxGuests: Number(villaForm.maxGuests),
      amenities,
      images,
      lat: Number(villaForm.lat),
      lng: Number(villaForm.lng),
      seoTitle: villaForm.seoTitle,
      seoDescription: villaForm.seoDescription
    };

    try {
      const url = editingVillaId ? `/api/villas/${editingVillaId}` : '/api/villas';
      const method = editingVillaId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAdminSuccess(editingVillaId ? 'Villa berhasil diperbarui!' : 'Villa baru sukses diterbitkan!');
        setShowVillaFormModal(false);
        fetchVillas();
      } else {
        const data = await res.json();
        setAdminError(data.error || 'Gagal menyimpan perubahan villa.');
      }
    } catch (err) {
      setAdminError('Koneksi terganggu. Gagal menghubungi server.');
    } finally {
      setIsSubmittingVilla(false);
    }
  };

  const handleDeleteVilla = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk villa ini selamanya dari katalog?')) return;
    setAdminError(null);
    setAdminSuccess(null);
    try {
      const res = await fetch(`/api/villas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAdminSuccess('Villa berhasil didelete dari katalog!');
        fetchVillas();
      } else {
        const data = await res.json();
        setAdminError(data.error || 'Gagal menghapus villa.');
      }
    } catch (err) {
      setAdminError('Gagal memproses penghapusan villa.');
    }
  };

  const handleCreateBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateBlockForm.villaId || !dateBlockForm.startDate || !dateBlockForm.endDate) {
      alert('Harap lengkapi semua kolom pemblokiran.');
      return;
    }
    const start = new Date(dateBlockForm.startDate);
    const end = new Date(dateBlockForm.endDate);
    if (start >= end) {
      alert('Tanggal check-out blokir wajib lebih lambat dari check-in.');
      return;
    }

    setIsSubmittingBlock(true);
    setAdminError(null);
    setAdminSuccess(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: dateBlockForm.villaId,
          guestName: 'BLOCKED (Perawatan Villa)',
          guestEmail: 'admin@batustay.id',
          guestPhone: '628123456789',
          startDate: dateBlockForm.startDate,
          endDate: dateBlockForm.endDate,
          paymentMethod: 'wa_admin'
        })
      });

      if (res.ok) {
        setAdminSuccess('Slot tanggal ketersediaan berhasil diblokir (Kalender Terupdate)!');
        setDateBlockForm({ villaId: '', startDate: '', endDate: '' });
        fetchBookings();
      } else {
        const data = await res.json();
        setAdminError(data.error || 'Gagal melalukan pemblokiran tanggal.');
      }
    } catch (err) {
      setAdminError('Gangguan jaringan. Gagal memblokir tanggal.');
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  const handleChangeBookingStatus = async (bookingId: string, status: 'pending' | 'paid' | 'cancelled') => {
    setAdminError(null);
    setAdminSuccess(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAdminSuccess(`Reservasi atau status ketersediaan berhasil diupdate ke: ${status.toUpperCase()}`);
        fetchBookings();
      } else {
        const data = await res.json();
        setAdminError(data.error || 'Gagal mengubah status reservasi.');
      }
    } catch (err) {
      setAdminError('Kesalahan saat memproses status reservasi.');
    }
  };

  const fetchVillas = async () => {
    try {
      setLoadingVillas(true);
      const res = await fetch('/api/villas');
      if (res.ok) {
        const data = await res.json();
        setVillas(data);
        if (data.length > 0) {
          setSelectedMapVilla(data[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching villas:', e);
    } finally {
      setLoadingVillas(false);
    }
  };

  const fetchNotificationLogs = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotificationLogs(data);
      }
    } catch (e) {
      console.error('Error fetching notification logs:', e);
    }
  };

  const fetchVillaReviews = async (villaId: string) => {
    try {
      const res = await fetch(`/api/villas/${villaId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
  };

  const fetchUnavailableDates = async (villaId: string) => {
    try {
      const res = await fetch(`/api/villas/${villaId}/unavailable-dates`);
      if (res.ok) {
        const data = await res.json();
        setUnavailableDates(data);
      }
    } catch (e) {
      console.error('Error fetching blocked dates:', e);
    }
  };

  // Triggered when clicking a specific villa card
  const handleOpenBookingModal = (villa: Villa) => {
    setSelectedVilla(villa);
    fetchVillaReviews(villa.id);
    fetchUnavailableDates(villa.id);
    setBookingForm({
      ...bookingForm,
      startDate: new Date().toISOString().split('T')[0],
      // Checkout defaults to tomorrow
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });
    setBookingResult(null);
    setBookingError(null);
    setBookingModalOpen(true);
  };

  // Submit modern reservation
  const handleSubmittingBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVilla) return;

    if (!bookingForm.guestName || !bookingForm.guestEmail || !bookingForm.guestPhone || !bookingForm.startDate || !bookingForm.endDate) {
      setBookingError('Harap lengkapi semua kolom pendaftaran.');
      return;
    }

    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    if (start >= end) {
      setBookingError('Tanggal Check-out wajib lebih lambat dari tanggal Check-in.');
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: selectedVilla.id,
          guestName: bookingForm.guestName,
          guestEmail: bookingForm.guestEmail,
          guestPhone: bookingForm.guestPhone,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate,
          paymentMethod: bookingForm.paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error || 'Terjadi kesalahan saat memproses booking.');
      } else {
        setBookingResult(data);
        // Refresh unavailable dates in modal and notification log stack
        fetchUnavailableDates(selectedVilla.id);
        fetchNotificationLogs();
        // Update notification count badge in header instantly
        setNotifPanelOpen(true);
      }
    } catch (err) {
      setBookingError('Koneksi server gagal. Coba lagi dalam beberapa saat.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Submit direct guest review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVilla) return;

    if (!reviewForm.guestName || !reviewForm.comment) {
      setReviewMessage('Harap sertakan nama Anda dan isi ulasan.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage(null);

    try {
      const res = await fetch(`/api/villas/${selectedVilla.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      const data = await res.json();

      if (res.ok) {
        setReviews((prev) => [data.review, ...prev]);
        setReviewForm({ guestName: '', rating: 5, comment: '' });
        setReviewMessage('Ulasan Anda sukses diterbitkan! Terima kasih atas kepercayaannya.');
        // Refresh total parent villas rating state
        fetchVillas();
      } else {
        setReviewMessage(data.error || 'Gagal mengirimkan ulasan.');
      }
    } catch (err) {
      setReviewMessage('Gagal menghubungi server untuk ulasan.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // AI chat client implementation using modern standard parameters
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessageInput.trim()) return;

    const userText = aiMessageInput;
    setAiHistory((prev) => [...prev, { sender: 'user', text: userText }]);
    setAiMessageInput('');
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/gemini/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          history: aiHistory
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAiHistory((prev) => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        setAiHistory((prev) => [...prev, { sender: 'bot', text: 'Maaf, saya tidak dapat menjawab pesan Anda sekarang karena gangguan jaringan.' }]);
      }
    } catch (err) {
      setAiHistory((prev) => [...prev, { sender: 'bot', text: 'Koneksi error. Silakan coba sesaat lagi.' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Layout scrolling utils
  const scrollToVillas = () => {
    villasSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAssistant = () => {
    setAiOpen(true);
    setTimeout(() => {
      chatbotRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Calculates simulated dynamic driving distance and time from selected landmark to selected map villa
  const calculateDistanceAndMinutes = (vLat: number, vLng: number, lLat: number, lLng: number) => {
    // Formula approximation for pleasant user feel (Batu mountainous geographic factors)
    const latDiff = Math.abs(vLat - lLat);
    const lngDiff = Math.abs(vLng - lLng);
    const distDelta = (latDiff + lngDiff) * 85; // rough scale to KM
    const distanceKm = parseFloat(Math.max(1.2, distDelta).toFixed(1));
    const drivingMinutes = Math.round(distanceKm * 2.8 + 2); // account for Batu mountain hilly traffic
    return { km: distanceKm, mins: drivingMinutes };
  };

  // Category filter classifications
  const filteredVillas = villas.filter((villa) => {
    // Search query matching
    const matchesSearch = villa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          villa.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          villa.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          villa.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category tabs
    let matchesCategory = true;
    if (categoryFilter === 'pool') {
      matchesCategory = villa.amenities.some(a => a.toLowerCase().includes('kolam') || a.toLowerCase().includes('pool'));
    } else if (categoryFilter === 'view') {
      matchesCategory = villa.amenities.some(a => a.toLowerCase().includes('pemandangan') || a.toLowerCase().includes('view'));
    } else if (categoryFilter === 'luxury') {
      matchesCategory = villa.pricePerNight > 1700000;
    }

    // Secondary filters
    const matchesPrice = villa.pricePerNight <= maxPrice;
    const matchesBedrooms = minBedrooms === 0 || villa.bedrooms >= minBedrooms;

    return matchesSearch && matchesCategory && matchesPrice && matchesBedrooms;
  });

  return (
    <div className="min-h-screen flex flex-col font-sans" ref={topRef}>
      {/* Visual background pattern decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[800px] left-0 w-80 h-80 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Modern High-Trust Traveloka-Inspired Brand Header */}
      <Header
        onScrollToVillas={scrollToVillas}
        onScrollToMap={scrollToMap}
        onScrollToAssistant={scrollToAssistant}
        notificationCount={notificationLogs.filter(l => l.type === 'wa').length}
        onOpenNotifications={() => setNotifPanelOpen(!notifPanelOpen)}
        onOpenAdmin={() => setShowPinModal(true)}
        whatsappNumber={whatsappNumber}
      />

      {/* Floating System Logs: Instant WA forwarded simulation dashboard */}
      {notifPanelOpen && (
        <div className="fixed right-4 top-24 z-50 w-full max-w-sm bg-white rounded-2xl border border-sky-100 shadow-2xl p-5 overflow-hidden animate-in slide-in-from-right duration-200">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-sm font-bold text-slate-800 font-display">WA / Email Gateway Logs</h4>
            </div>
            <button
              onClick={() => setNotifPanelOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal mb-3">
            Konfirmasi pesanan klien Anda otomatis didistribusikan dari sistem *email konfirmasi otomatis* langsung di-forward ke nomor WhatsApp Client / Admin secara instan.
          </p>

          <div className="max-h-80 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin">
            {notificationLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                <Inbox className="w-8 h-8 text-slate-300 mb-2" />
                <span>Belum ada notifikasi pesanan masuk.</span>
                <span className="text-[10px] mt-1 text-slate-400">Silakan lakukan Pemesanan Villa untuk memicu pengiriman simulasi WA.</span>
              </div>
            ) : (
              notificationLogs.map((log) => (
                <div key={log.id} className={`p-3 rounded-xl border text-xs leading-relaxed transition-all duration-200 ${
                  log.type === 'wa' ? 'bg-emerald-50/50 border-emerald-100/80 text-emerald-900' : 'bg-sky-50/50 border-sky-100/80 text-sky-950'
                }`}>
                  <div className="flex justify-between items-center mb-1.5 font-bold">
                    <span className="flex items-center gap-1">
                      {log.type === 'wa' ? '🟢 WhatsApp Menerima' : '🔵 Email Konfirmasi'}
                    </span>
                    <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-600 mb-1 text-[10px]">
                    Ke: {log.recipient}
                  </div>
                  <div className="text-[10px] font-bold text-slate-700 bg-white/40 px-1.5 py-0.5 rounded mb-1">
                    {log.subjectOrHeader}
                  </div>
                  <pre className="font-mono text-[9px] whitespace-pre-wrap bg-white/60 p-2 rounded border border-slate-100 leading-snug">
                    {log.body}
                  </pre>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
            <span>Server: Active</span>
            <span className="text-emerald-600 font-bold">WA Gateway Terkoneksi</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow z-10">
        {/* HERO SECTION - Rotating Photo Gallery of Featured Villas */}
        <div className="relative w-full h-[58vh] min-h-[460px] max-h-[620px] overflow-hidden bg-slate-950 rounded-b-[48px] shadow-lg text-white">
          {/* Slides */}
          {sliderImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Backlight overlay scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/30" />
            </div>
          ))}

          {/* Sparkles, Headings & Info Overlays */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center z-20 pb-12">
            <div className="inline-flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-5 border border-white/20 animate-in fade-in duration-500">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="text-white/95 text-[10px] sm:text-xs">Sewa Villa Batu — Jaminan Layanan Terbaik & Real-Time Booking</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display mb-4 leading-tight drop-shadow-xl">
              Temukan Ketenangan di <br className="hidden sm:inline" />
              <span className="text-[#0194f3]">Puncak Wisata Batu.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-slate-200 text-xs sm:text-sm md:text-base mb-8 leading-relaxed font-semibold drop-shadow-md">
              Koleksi villa premium dengan private pool, panorama gunung asri, ulasan terpercaya & direct-WhatsApp konfirmasi instan. <br />
              <span className="text-[#0194f3] bg-white/95 px-3 py-1.5 rounded-lg inline-block mt-2 font-black shadow-sm font-sans">
                ⛰️ ke Batu sewa villa hanya disini !
              </span>
            </p>

            {/* Slide Navigation Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)}
                className="p-2 rounded-full bg-black/40 hover:bg-[#0194f3] border border-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Sewa Sebelumnya"
              >
                ◀
              </button>

              {/* Dots indicator */}
              <div className="flex space-x-1.5">
                {sliderImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlide ? 'bg-[#0194f3] w-6' : 'bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % sliderImages.length)}
                className="p-2 rounded-full bg-black/40 hover:bg-[#0194f3] border border-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Sewa Berikutnya"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* FLOATING FILTER SEARCH WIDGET COUPLING WITH ZERO GAP */}
        <div className="relative z-30 max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20">
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-sky-100 text-slate-800 text-left">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#0194f3] mb-4 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#0194f3]" />
              <span>Cari & Filter Sesuai Liburan Impianmu</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search query input */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cari Nama / Fasilitas</label>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-[#0194f3] shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari kolam renang, BBQ, Songgoriti..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs w-full focus:outline-none placeholder-slate-400 font-semibold"
                  />
                </div>
              </div>

              {/* Pricing filter */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tarif Malam Maksimal</label>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-[#0194f3]">
                    Rp {maxPrice.toLocaleString('id-ID')}
                  </span>
                  <input
                    type="range"
                    min="1000000"
                    max="4000000"
                    step="100000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full mt-1 accent-[#0194f3] h-1 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Min Bedroom filter */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Jumlah Kamar Tidur</label>
                <select
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(Number(e.target.value))}
                  className="bg-transparent text-xs font-extrabold text-slate-700 focus:outline-none w-full"
                >
                  <option value="0">Berapa saja</option>
                  <option value="3">Minimal 3 Kamar</option>
                  <option value="4">Minimal 4 Kamar</option>
                  <option value="5">Minimal 5 Kamar</option>
                </select>
              </div>

              {/* Search trigger button */}
              <button
                onClick={scrollToVillas}
                className="bg-[#0194f3] hover:bg-[#007cd0] text-white rounded-2xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer h-12 md:h-full py-3"
              >
                <Search className="w-4 h-4" />
                <span>Temukan Villa</span>
              </button>
            </div>
          </div>
        </div>

        {/* SPACING PAD AFTER FLOATING SEARCH BAR */}
        <div className="h-16 md:h-24" />

        {/* TRUST BADGES FOR TARGET MARKET CLOSING EFFECT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-xs">
            <div className="flex items-center space-x-3 p-1">
              <div className="p-3 bg-blue-100 rounded-2xl text-[#0194f3] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800 font-display">100% Terpercaya</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">Bebas penipuan, villa terverifikasi lapangan.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-1">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800 font-display">Garansi Terbaik</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">Harga jujur langsung pemilik tanpa markup.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-1">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800 font-display">Respon Cepat Staf</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">Hubungi Admin WA kapan saja, siap 24 jam.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-1">
              <div className="p-3 bg-purple-100 rounded-2xl text-purple-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800 font-display">Real-Time Booking</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">Sistem kalender teratur, bebas bentrok jadwal.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CORE PRODUCT CATALOGUE SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={villasSectionRef}>
          {/* Section heading & categories selection */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#0194f3] mb-1.5 font-bold text-xs tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0194f3]"></span>
                <span>Katalog Pilihan Villa Terbaik</span>
              </div>
              <h2 className="text-2xl sm:text-3.5xl font-extrabold text-slate-900 font-display tracking-tight leading-none">
                Jelajahi Villa Istimewa Batu
              </h2>
            </div>

            {/* Quick Categories Filter Buttons (Traveloka Styled) */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2.5 rounded-full transition-all duration-200 cursor-pointer border ${
                  categoryFilter === 'all'
                    ? 'bg-[#0194f3] text-white border-[#0194f3] shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                Semua Villa
              </button>
              <button
                onClick={() => setCategoryFilter('pool')}
                className={`px-4 py-2.5 rounded-full transition-all duration-200 cursor-pointer border ${
                  categoryFilter === 'pool'
                    ? 'bg-[#0194f3] text-white border-[#0194f3] shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                Kolam Air Hangat / Private Pool
              </button>
              <button
                onClick={() => setCategoryFilter('view')}
                className={`px-4 py-2.5 rounded-full transition-all duration-200 cursor-pointer border ${
                  categoryFilter === 'view'
                    ? 'bg-[#0194f3] text-white border-[#0194f3] shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                Pemandangan Alam / Gunung
              </button>
              <button
                onClick={() => setCategoryFilter('luxury')}
                className={`px-4 py-2.5 rounded-full transition-all duration-200 cursor-pointer border ${
                  categoryFilter === 'luxury'
                    ? 'bg-[#0194f3] text-white border-[#0194f3] shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                Mewah (Premium)
              </button>
            </div>
          </div>

          {/* Fallback empty view */}
          {loadingVillas ? (
            <div className="py-24 text-center">
              <div className="inline-block w-10 h-10 border-4 border-[#0194f3] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-medium text-sm">Menghubungkan ke basis data BatuStay...</p>
            </div>
          ) : filteredVillas.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto shadow-sm">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 font-display">Villa Tidak Ditemukan</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Maaf, pencarian villa dengan kriteria Anda tidak tersedia saat ini. Coba perkecualikan filter rentang harga atau kurangi kata kunci.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setMaxPrice(3000000);
                  setMinBedrooms(0);
                }}
                className="mt-5 px-5 py-2.5 bg-[#0194f3] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-sky-600 transition-colors"
              >
                Reset Semua Filter Pencarian
              </button>
            </div>
          ) : (
            /* Premium Villa Responsive Layout Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
              {filteredVillas.map((villa) => (
                <VillaCard
                  key={villa.id}
                  villa={villa}
                  onBook={handleOpenBookingModal}
                  onSelectMap={(v) => {
                    setSelectedMapVilla(v);
                    scrollToMap();
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* HIGH-TRUST INTERACTIVE SVG BANTU MAPS INTEGRATION SECTION */}
        <div className="bg-white border-y border-dashed border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8 mt-12" ref={mapSectionRef}>
          <div className="max-w-7xl mx-auto">
            {/* Map Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-1.5 bg-[#0194f3]/10 text-[#0194f3] px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 border border-[#0194f3]/25">
                <MapPin className="w-3.5 h-3.5" />
                <span>INTEGRASI GPS MAPS SISTEM</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 font-display tracking-tight mb-2">
                Peta Pariwisata Interaktif Kota Batu
              </h2>
              <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
                Koordinat asli setiap villa terintegrasi dengan data objek wisata populer di Batu. Klik penanda pin villa atau tempat pariwisata untuk simulasi rute instan.
              </p>
            </div>

            {/* Simulated Geographic layout dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Interactive GIS Map Canvas */}
              <div className="lg:col-span-8 bg-sky-50 rounded-[32px] p-4 sm:p-6 border border-sky-100 flex flex-col relative overflow-hidden min-h-[400px] sm:min-h-[500px]">
                {/* Simulated topographical aesthetic contour circles */}
                <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full border border-sky-100/50 pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full border border-sky-100/50 pointer-events-none" />
                <div className="absolute top-10 right-10 flex flex-col space-y-1 text-right bg-white/70 backdrop-blur-md p-2.5 rounded-xl border border-sky-100/40 text-[9px] font-semibold text-sky-900 pointer-events-none">
                  <span>🗺️ BATUSTAY MAP 2.1</span>
                  <span>E: 112.5291° • S: -7.8894°</span>
                  <span>Skala: 1:12,000</span>
                </div>

                {/* Interactive SVG Canvas representation of Batu City Area */}
                <div className="flex-grow w-full relative z-10 flex items-center justify-center">
                  <svg
                    viewBox="0 0 800 500"
                    className="w-full h-full max-h-[420px] filter drop-shadow-md select-none"
                    style={{ background: 'transparent' }}
                  >
                    {/* Hilly and green forests patterns representation */}
                    <path d="M 50,450 Q 150,380 300,430 T 600,410 T 750,420 L 750,500 L 50,500 Z" fill="#ebf6eb" opacity="0.6" />
                    <path d="M 0,250 Q 200,180 400,240 T 800,220 L 800,500 L 0,500 Z" fill="#ebf6eb" opacity="0.6" />
                    
                    {/* Big Mount Panderman silhouette outline on background */}
                    <path d="M 500,280 L 620,100 L 750,280 Z" fill="#e2f0d9" stroke="#c5e1a5" strokeWidth="2" opacity="0.5" />
                    <text x="620" y="220" className="text-[12px] font-extrabold fill-slate-400 font-display text-center" textAnchor="middle">
                      Gunung Panderman (2,045m)
                    </text>

                    {/* Primary Highway lines connecting landmarks */}
                    <path d="M 100,50 Q 200,120 400,190 T 700,420" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 100,50 Q 200,120 400,190 T 700,420" fill="none" stroke="#0194f3" strokeWidth="2" strokeDasharray="6,6" strokeLinecap="round" />

                    {/* Secondary songgoriti access highway */}
                    <path d="M 50,300 Q 180,320 300,185 T 600,120" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" opacity="0.7" />

                    {/* Tourist Landmarks Markers */}
                    {BATU_LANDMARKS.map((landmark, idx) => {
                      // Project coordinates onto mock layout coordinates
                      // Batu Latitude spans roughly from -7.8345 to -7.9000
                      // Batu Longitude spans from 112.5000 to 112.5600
                      const x = 50 + ((landmark.lng - 112.5000) / 0.06) * 700;
                      const y = 30 + (Math.abs(landmark.lat + 7.8300) / 0.07) * 440;

                      const isSelected = selectedLandmark.name === landmark.name;

                      return (
                        <g
                          key={landmark.name}
                          transform={`translate(${x}, ${y})`}
                          className="cursor-pointer"
                          onClick={() => setSelectedLandmark(landmark)}
                        >
                          <circle r={isSelected ? '14' : '10'} fill="#4f46e5" opacity={isSelected ? '0.25' : '0.15'} className="animate-ping" />
                          <circle r="7" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                          <circle r="2" fill="#ffffff" />
                        </g>
                      );
                    })}

                    {/* Tourist Location Label tags overlay to make map vibrant */}
                    {BATU_LANDMARKS.map((landmark) => {
                      const x = 50 + ((landmark.lng - 112.5000) / 0.06) * 700;
                      const y = 30 + (Math.abs(landmark.lat + 7.8300) / 0.07) * 440;
                      const isSelected = selectedLandmark.name === landmark.name;

                      return (
                        <foreignObject key={landmark.name + '-lbl'} x={x - 60} y={y - 32} width="120" height="24">
                          <div className={`text-center py-0.5 px-1.5 rounded-md text-[8px] font-bold tracking-tight shadow-md select-none border whitespace-nowrap overflow-hidden transition-all duration-300 ${
                            isSelected ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-700 border-slate-100'
                          }`}>
                            📍 {landmark.name.split(' ')[0]} {landmark.name.split(' ')[1] || ''}
                          </div>
                        </foreignObject>
                      );
                    })}

                    {/* Active Booking Villa Markers */}
                    {villas.map((v) => {
                      const x = 50 + ((v.lng - 112.5000) / 0.06) * 700;
                      const y = 30 + (Math.abs(v.lat + 7.8300) / 0.07) * 440;

                      const isSelected = selectedMapVilla?.id === v.id;
                      const isHovered = hoveredVilla?.id === v.id;

                      return (
                        <g
                          key={v.id}
                          transform={`translate(${x}, ${y})`}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedMapVilla(v);
                            // Highlight on list too
                          }}
                          onMouseEnter={() => setHoveredVilla(v)}
                          onMouseLeave={() => setHoveredVilla(null)}
                        >
                          <circle r={isSelected ? '24' : '16'} fill="#0194f3" opacity={isSelected || isHovered ? '0.3' : '0.15'} className={isSelected ? 'animate-pulse' : ''} />
                          <circle r="11" fill="#0194f3" stroke="#ffffff" strokeWidth="2" className="shadow-lg" />
                          <path
                            d="M-5,-5 L5,5 M5,-5 L-5,5" // Home pin visual inner icon
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })}

                    {/* Interactive price callouts for villas on map view */}
                    {villas.map((v) => {
                      const x = 50 + ((v.lng - 112.5000) / 0.06) * 700;
                      const y = 30 + (Math.abs(v.lat + 7.8300) / 0.07) * 440;
                      const isSelected = selectedMapVilla?.id === v.id;

                      return (
                        <foreignObject key={v.id + '-badge'} x={x - 45} y={y + 14} width="95" height="25">
                          <div
                            onClick={() => setSelectedMapVilla(v)}
                            className={`text-center py-0.5 px-1 rounded-full text-[8.5px] font-extrabold shadow-sm border transition-all cursor-pointer whitespace-nowrap ${
                              isSelected
                                ? 'bg-amber-400 text-slate-900 border-amber-500 scale-105'
                                : 'bg-[#0194f3] text-white border-sky-400'
                            }`}
                          >
                            Rp {(v.pricePerNight / 1000).toFixed(0)}k/malam
                          </div>
                        </foreignObject>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Right Column: GIS Landmark Location Distance Calculator */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-6">
                
                {/* Active Selected Villa Details */}
                {selectedMapVilla && (
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-[24px] flex-grow flex flex-col justify-between shadow-xs">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">VILLA DI PETA</h3>
                      <h4 className="serif-font text-2xl font-bold text-slate-900 mb-1 leading-snug">
                        {selectedMapVilla.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center mb-4">
                        <MapPin className="w-3.5 h-3.5 text-[#0194f3] mr-1 inline" />
                        {selectedMapVilla.address}
                      </p>

                      <div className="h-28 rounded-xl overflow-hidden mb-4 bg-slate-200">
                        <img
                          src={selectedMapVilla.images[0]}
                          alt={selectedMapVilla.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-slate-100 text-xs mb-4">
                        <span className="font-semibold text-slate-500">Harga per malam:</span>
                        <span className="font-extrabold text-[#0194f3]">
                          Rp {selectedMapVilla.pricePerNight.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBookingModal(selectedMapVilla)}
                      className="w-full py-3 bg-[#0194f3] hover:bg-[#007cd0] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Pesan Sekarang
                    </button>
                  </div>
                )}

                {/* Simulated Real-Time Distance GPS Matrix Engine */}
                <div className="bg-sky-900 text-white rounded-[24px] p-6 shadow-md">
                  <h3 className="text-[10px] font-bold text-sky-200 uppercase tracking-widest mb-4 flex items-center gap-1">
                    <Car className="w-4 h-4 text-amber-300 shrink-0" />
                    Kalkulator Jarak Wisata Edukasi
                  </h3>

                  <div className="mb-4">
                    <label className="text-[9px] font-bold text-sky-300 uppercase tracking-wider block mb-1">Objek Wisata Batu</label>
                    <select
                      value={selectedLandmark.name}
                      onChange={(e) => {
                        const matched = BATU_LANDMARKS.find(l => l.name === e.target.value);
                        if (matched) setSelectedLandmark(matched);
                      }}
                      className="w-full bg-sky-800 text-white text-xs border border-sky-700 p-2.5 rounded-xl font-bold focus:outline-none"
                    >
                      {BATU_LANDMARKS.map(l => (
                        <option key={l.name} value={l.name} className="text-slate-800 font-normal">
                          📍 {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedMapVilla && (
                    <div className="bg-sky-950/60 p-4 rounded-xl border border-sky-800/80">
                      <div className="flex justify-between text-xs text-sky-200 mb-2 font-medium">
                        <span>Dari:</span>
                        <span className="font-bold text-white text-right">{selectedLandmark.name}</span>
                      </div>
                      <div className="flex justify-between text-xs text-sky-200 mb-4 font-medium">
                        <span>Menuju:</span>
                        <span className="font-bold text-white text-right">{selectedMapVilla.name}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-sky-800 text-center">
                        <div className="bg-sky-900/60 p-2 rounded-lg">
                          <span className="text-[9px] text-sky-300 block font-medium">ESTIMASI JARAK</span>
                          <span className="text-xl font-black text-amber-300 font-display">
                            {calculateDistanceAndMinutes(selectedMapVilla.lat, selectedMapVilla.lng, selectedLandmark.lat, selectedLandmark.lng).km} KM
                          </span>
                        </div>
                        <div className="bg-sky-900/60 p-2 rounded-lg">
                          <span className="text-[9px] text-sky-300 block font-medium">WAKTU TEMPUH</span>
                          <span className="text-xl font-black text-amber-300 font-display">
                            {calculateDistanceAndMinutes(selectedMapVilla.lat, selectedMapVilla.lng, selectedLandmark.lat, selectedLandmark.lng).mins} menit
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[9px] text-sky-300/80 leading-relaxed mt-4 italic text-center">
                    *(Waktu tempuh dipengaruhi cuaca berkabut & kondisi kelancaran lalu lintas Kota Batu)
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* FLOATING BOT TOUR CHATBOT DOCK (Batu Villa Assistant) */}
        <div id="ai-chat" className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-12" ref={chatbotRef}>
          <div className="bg-[#f2f9ff] rounded-[36px] border border-sky-200/80 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Visual background badges */}
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-gradient-to-tr from-sky-400 to-[#0194f3] rounded-full opacity-10 pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-sky-200 mb-6 gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-[#0194f3] rounded-2xl text-white shadow-md animate-bounce" style={{ animationDuration: '3s' }}>
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="serif-font text-2xl font-bold text-slate-800">Tanya BatuStay Assistant AI</h3>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Merespon Instan dengan Rekomendasi Akurat
                  </p>
                </div>
              </div>

              {/* Reset session link */}
              <button
                onClick={() => setAiHistory([
                  { sender: 'bot', text: 'Halo! Sesi baru telah dimulai. Beritahu saya rencana wisata Anda di Kota Batu!' }
                ])}
                className="text-xs text-[#0194f3] hover:underline font-bold"
              >
                Atur Ulang Obrolan
              </button>
            </div>

            {/* Chat Box Conversation Log Wrapper */}
            <div className="bg-white rounded-2xl border border-sky-100 p-4 h-72 overflow-y-auto mb-4 space-y-4">
              {aiHistory.map((item, idx) => (
                <div key={idx} className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                    item.sender === 'user'
                      ? 'bg-[#0194f3] text-white rounded-br-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}>
                    {/* Speaker Header */}
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 opacity-60 ${
                      item.sender === 'user' ? 'text-sky-100 text-right' : 'text-slate-500'
                    }`}>
                      {item.sender === 'user' ? 'Anda (Client)' : 'BatuStay AI Consultant'}
                    </p>
                    <p className="whitespace-pre-line leading-relaxed font-semibold">{item.text}</p>
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 text-slate-500 rounded-2xl p-4 text-xs flex items-center space-x-2 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#0194f3]">Asisten sedang meraba data...</span>
                    <span className="flex space-x-1.5 justify-center">
                      <span className="h-1.5 w-1.5 bg-[#0194f3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 bg-[#0194f3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 bg-[#0194f3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions Quick Buttons */}
            <div className="flex flex-wrap gap-2 mb-4 text-[11px] font-bold">
              <span className="text-[10px] text-slate-400 self-center uppercase tracking-wider">Cepat: </span>
              <button
                onClick={() => {
                  setAiMessageInput('Rekomendasikan villa dengan kolam air hangat untuk 10 orang');
                }}
                className="bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                🏨 Kolam Air Hangat (10 org)
              </button>
              <button
                onClick={() => {
                  setAiMessageInput('Villa mana yang paling dekat dengan Jatim Park 2?');
                }}
                className="bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                🎡 Dekat Jatim Park / BNS
              </button>
              <button
                onClick={() => {
                  setAiMessageInput('Bagaimana mekanisme pembayaran online dan konfirmasi WhatsApp?');
                }}
                className="bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                💳 Cara Bayar & Konfirmasi WA
              </button>
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSendAiMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik rincian liburan, jumlah tamu, atau info tempat di Batu yang Anda inginkan..."
                value={aiMessageInput}
                onChange={(e) => setAiMessageInput(e.target.value)}
                className="flex-grow bg-white border border-sky-200 text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0194f3] text-slate-800 font-semibold"
              />
              <button
                type="submit"
                className="bg-[#0194f3] hover:bg-[#007cd0] text-white px-5 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* CORE BOOKING & DETAILED REVIEW SYSTEM MODAL POPUP */}
      {bookingModalOpen && selectedVilla && (
        <div className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 relative animate-in zoom-in-95 duration-200 scrollbar-thin">
            
            {/* Modal Exit Cross */}
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Outer Modal Main Frame Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
              
              {/* Left Column: Property presentation, carousel, ratings, reviews lists */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Visual Title Header */}
                <div>
                  <h3 className="serif-font text-3xl font-extrabold text-slate-900 leading-tight">
                    {selectedVilla.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#0194f3] mr-1" />
                    {selectedVilla.address}
                  </p>
                </div>

                {/* Big detailed villa picture with scroll instructions */}
                <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 group">
                  <img
                    src={selectedVilla.images[0]}
                    alt={selectedVilla.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white text-xs font-bold bg-[#0194f3]/90 backdrop-blur-md px-3 py-1 rounded-md">
                    Foto Utama Villa
                  </div>
                </div>

                {/* Facilities List Details */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Fasilitas Utama Tergantung di Kamar</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVilla.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="text-xs text-slate-700 bg-slate-100 border border-slate-200/50 px-3 h-8 flex items-center justify-center rounded-lg font-medium"
                      >
                        ✅ {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Extended Descriptions */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gambaran Lengkap Villa</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedVilla.description}
                  </p>
                </div>

                {/* TRUSTPILOT RESIDENT REVIEWS MODULE */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Ulasan Tamu Terpercaya ({reviews.length})</h4>

                  {/* Rating score breakdown widget */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl items-center mb-6 border border-slate-100">
                    <div className="sm:col-span-4 text-center sm:border-r sm:border-slate-200/90 py-2">
                      <div className="text-4xl font-extrabold text-[#0194f3] font-display">
                        {selectedVilla.rating || 4.5}
                      </div>
                      <div className="flex justify-center my-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= Math.floor(selectedVilla.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold tracking-wide block">RATA-RATA SKOR</span>
                    </div>

                    <div className="sm:col-span-8 text-[11px] text-slate-600 space-y-1.5">
                      <div className="flex items-center">
                        <span className="w-12 font-medium">5 Bintang</span>
                        <div className="flex-grow bg-slate-200 h-2 rounded overflow-hidden mx-2">
                          <div className="bg-[#0194f3] h-full rounded" style={{ width: '85%' }}></div>
                        </div>
                        <span className="w-8 text-right font-bold text-slate-500">85%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-12 font-medium">4 Bintang</span>
                        <div className="flex-grow bg-slate-200 h-2 rounded overflow-hidden mx-2">
                          <div className="bg-[#0194f3] h-full rounded" style={{ width: '15%' }}></div>
                        </div>
                        <span className="w-8 text-right font-bold text-slate-500">15%</span>
                      </div>
                      <div className="flex items-center opacity-40">
                        <span className="w-12 font-medium">3 Bintang</span>
                        <div className="flex-grow bg-slate-200 h-2 rounded overflow-hidden mx-2">
                          <div className="bg-[#0194f3] h-full rounded" style={{ width: '0%' }}></div>
                        </div>
                        <span className="w-8 text-right font-bold text-slate-500">0%</span>
                      </div>
                    </div>
                  </div>

                  {/* Submitting New Review Form */}
                  <form onSubmit={handleSubmitReview} className="bg-sky-50 border border-sky-100 p-4 rounded-xl mb-6 space-y-3">
                    <h5 className="text-xs font-bold text-sky-950">Beri Ulasan Menginap Anda</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Pengunjung</label>
                        <input
                          type="text"
                          placeholder="Contoh: Budi Susanto"
                          value={reviewForm.guestName}
                          onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
                          className="w-full bg-white border border-sky-100 text-xs px-3 py-2 rounded-lg text-slate-800 font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skor Bintang (1 - 5)</label>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="w-full bg-white border border-sky-100 text-xs px-3 py-1.5 rounded-lg text-slate-800 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ 5 (Sangat Puas)</option>
                          <option value="4">⭐⭐⭐⭐ 4 (Puas / Nyaman)</option>
                          <option value="3">⭐⭐⭐ 3 (Cukup / Standar)</option>
                          <option value="2">⭐⭐ 2 (Perlu Perbaikan)</option>
                          <option value="1">⭐ 1 (Sangat Kurang)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Isi komentar Anda</label>
                      <textarea
                        rows={2}
                        placeholder="Rincikan suasana, kebersihan kolam, kehangatan air malam hari, kenyamanan dapur..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full bg-white border border-sky-100 text-xs p-3 rounded-lg text-slate-800 font-medium focus:outline-none"
                      />
                    </div>
                    {reviewMessage && (
                      <p className="text-xs text-sky-900 bg-sky-100/50 p-2 rounded-lg font-bold">
                        {reviewMessage}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-4 py-2 bg-[#0194f3] hover:bg-sky-600 font-bold text-xs text-white rounded-lg cursor-pointer flex items-center space-x-1 transition-colors"
                    >
                      <span>Kirim Ulasan</span>
                    </button>
                  </form>

                  {/* Reviews lists feed */}
                  <div className="space-y-4 max-h-56 overflow-y-auto pr-2 scrollbar-thin">
                    {reviews.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl">Belum ada ulasan untuk villa ini. Jadilah tamu pertama yang memberi penilaian!</p>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-700">{rev.guestName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-500">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          <p className="text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                        </div>
                      ))
                    )}
                  </div>

                </div>

              </div>
              
              {/* Right Column: Real-Time Calendar block checking & Booking Form */}
              <div className="lg:col-span-5 bg-slate-50 rounded-[28px] border border-slate-200/60 p-5 sm:p-6 shadow-xs">
                
                {/* Visual booking step title */}
                <div className="flex items-center gap-1.5 mb-4 bg-[#0194f3]/10 text-[#0194f3] p-3 rounded-xl border border-[#0194f3]/15">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shrink-0"></span>
                  <div className="text-[10px] font-bold uppercase tracking-wider leading-none">
                    PENYEDIA BOOKING REAL-TIME VERIFIED
                  </div>
                </div>

                {/* Simulated payment detail is already submitted */}
                {bookingResult ? (
                  <div className="space-y-6">
                    <div className="text-center py-6">
                      <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="serif-font text-2xl font-bold text-slate-900">Pemesanan Selesai Diproses!</h4>
                      <p className="text-slate-500 text-xs mt-1.5">
                        Pemesanan untuk *{bookingResult.booking?.guestName}* berhasil masuk ke dalam kalender kami.
                      </p>
                    </div>

                    {/* Booking Details Invoice */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 text-xs tracking-wide space-y-2.5 shadow-sm">
                      <div className="flex justify-between border-b pb-2 mb-2 font-bold text-slate-700">
                        <span>🏷️ INVOICE CODE</span>
                        <span className="font-mono text-slate-900">{bookingResult.booking?.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tanggal Check-In:</span>
                        <span className="font-bold text-slate-800">{bookingResult.booking?.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tanggal Check-Out:</span>
                        <span className="font-bold text-slate-800">{bookingResult.booking?.endDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Jumlah Malam:</span>
                        <span className="font-bold text-slate-800">{bookingResult.booking?.totalNights} Malam</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Metode Bayar:</span>
                        <span className="font-bold bg-sky-100 text-[#0194f3] px-2 py-0.5 rounded uppercase">
                          {bookingResult.booking?.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2 font-extrabold text-sm text-slate-900">
                        <span>Total Biaya</span>
                        <span className="text-[#0194f3]">Rp {bookingResult.booking?.totalPrice.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Integrated online simulator payments representation */}
                    {bookingResult.booking?.paymentMethod === 'wa_admin' ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs font-semibold space-y-3 text-emerald-950">
                        <p className="leading-relaxed">
                          ⚠️ *Pemesanan Admin WhatsApp:* Rincian tagihan menginap Anda di atas wajib diterbangkan secara manual ke staf kami melalui tautan WA chat berikut ini:
                        </p>
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=Halo%20Admin%20BatuStay!%20Saya%20ingin%20mengonfirmasi%20pemesanan%20villa.%0A%0ANo%20Invoice:%20${bookingResult.booking?.id}%0ANama%20Tamu:%20${bookingResult.booking?.guestName}%0AVilla:%20${bookingResult.villaName}%0AJadwal:%20${bookingResult.booking?.startDate}%20s/d%20${bookingResult.booking?.endDate}%20(${bookingResult.booking?.totalNights}%20malam)%0ATotal%20Tarif:%20Rp%20${bookingResult.booking?.totalPrice.toLocaleString('id-ID')}%0AMetode%20Pembayaran:%20WhatsApp%20Admin`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 rounded-xl transition-all shadow-md cursor-pointer text-center"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Kirim Rincian Ke Admin WA</span>
                        </a>
                      </div>
                    ) : (
                      /* Online simulated payment code */
                      <div className="bg-[#f0f9ff] border border-sky-100 rounded-xl p-4 text-xs font-semibold space-y-4 text-sky-950 text-center">
                        <p className="leading-relaxed text-slate-600 text-left">
                          Silakan selesaikan pembayaran simulator Anda dengan memindai kode QRIS Instan di bawah ini. Ulangi atau tunggu hingga 10 detik sistem auto-verifikasi.
                        </p>
                        
                        <div className="p-3 bg-white border border-slate-100 rounded-xl inline-block shadow-sm">
                          {/* Simulated elegant QRIS code visually generated in canvas style */}
                          <div className="w-44 h-44 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center relative mx-auto">
                            <QrCode className="w-36 h-36 text-slate-800" />
                            <span className="absolute bottom-1 bg-amber-400 text-slate-900 font-black text-[9px] px-2 py-0.5 rounded tracking-widest leading-none">
                              QRIS BATUSTAY LUNAS
                            </span>
                          </div>
                        </div>

                        <div className="text-slate-500 flex items-center justify-center gap-1 text-[11px] font-bold">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                          <span>Menunggu transfer simulasi bank...</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-100/80 p-3 rounded-lg text-[10px] text-slate-500 leading-normal border border-slate-200/50">
                      🔔 <strong>Notifikasi Gateway:</strong> Konformasi booking otomatis dikirim ke email <strong>{bookingResult.booking?.guestEmail}</strong> dan secara real-time diteruskan ke sistem log WhatsApp Anda di pojok kanan atas!
                    </div>

                    <button
                      onClick={() => {
                        setBookingResult(null);
                        setBookingModalOpen(false);
                      }}
                      className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Kembali ke Beranda
                    </button>
                  </div>
                ) : (
                  /* Live Form Booking Date Validation & Checker */
                  <form onSubmit={handleSubmittingBooking} className="space-y-4">
                    <h4 className="serif-font text-2xl font-bold text-slate-900">Isi Formulir Booking</h4>
                    <p className="text-xs text-slate-500 leading-snug">
                      Data di bawah ini digunakan untuk penerbitan konfirmasi email e-voucher sewa villa resmi.
                    </p>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap Anda</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Andi Wijaya"
                        value={bookingForm.guestName}
                        onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                        className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0194f3]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Aktif</label>
                        <input
                          type="email"
                          required
                          placeholder="namamu@email.com"
                          value={bookingForm.guestEmail}
                          onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0194f3]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nomor WhatsApp</label>
                        <input
                          type="tel"
                          required
                          placeholder="08123456xxxx"
                          value={bookingForm.guestPhone}
                          onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0194f3]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Tanggal Check-In
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingForm.startDate}
                          onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Tanggal Check-Out
                        </label>
                        <input
                          type="date"
                          required
                          min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                          value={bookingForm.endDate}
                          onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Blocked Date Calendar Warning Details */}
                    {unavailableDates.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-lg">
                        <label className="text-[9px] font-extrabold text-amber-800 uppercase tracking-wider block mb-1">
                          ⚠️ Tanggal Sudah Dipesan / Penuh (Real-time Blocked):
                        </label>
                        <div className="flex flex-wrap gap-1 leading-none text-[8.5px]">
                          {unavailableDates.map((date) => (
                            <span key={date} className="bg-amber-200/60 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                              {date}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment methods choice */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Metode Pembayaran</label>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                        <label className={`border p-2.5 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                          bookingForm.paymentMethod === 'qris' ? 'border-[#0194f3] bg-sky-50 text-[#0194f3]' : 'border-slate-200 bg-white text-slate-600'
                        }`}>
                          <input
                            type="radio"
                            name="payment"
                            value="qris"
                            checked={bookingForm.paymentMethod === 'qris'}
                            onChange={() => setBookingForm({ ...bookingForm, paymentMethod: 'qris' })}
                            className="hidden"
                          />
                          <QrCode className="w-5 h-5" />
                          <span className="text-[9px] tracking-tight">QRIS Instan</span>
                        </label>

                        <label className={`border p-2.5 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                          bookingForm.paymentMethod === 'transfer' ? 'border-[#0194f3] bg-sky-50 text-[#0194f3]' : 'border-slate-200 bg-white text-slate-600'
                        }`}>
                          <input
                            type="radio"
                            name="payment"
                            value="transfer"
                            checked={bookingForm.paymentMethod === 'transfer'}
                            onChange={() => setBookingForm({ ...bookingForm, paymentMethod: 'transfer' })}
                            className="hidden"
                          />
                          <CreditCard className="w-5 h-5" />
                          <span className="text-[9px] tracking-tight">Transfer Bank</span>
                        </label>

                        <label className={`border p-2.5 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                          bookingForm.paymentMethod === 'wa_admin' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'
                        }`}>
                          <input
                            type="radio"
                            name="payment"
                            value="wa_admin"
                            checked={bookingForm.paymentMethod === 'wa_admin'}
                            onChange={() => setBookingForm({ ...bookingForm, paymentMethod: 'wa_admin' })}
                            className="hidden"
                          />
                          <Phone className="w-5 h-5 text-emerald-600" />
                          <span className="text-[9px] tracking-tight text-emerald-800">Admin WA</span>
                        </label>
                      </div>
                    </div>

                    {/* Pricing estimations block summary */}
                    {bookingForm.startDate && bookingForm.endDate && (
                      <div className="bg-slate-100 p-3.5 rounded-xl font-medium text-xs text-slate-700 leading-normal">
                        <div className="flex justify-between mb-1 text-[10px]">
                          <span>Tarif Villa ({selectedVilla.name}):</span>
                          <span className="font-bold">Rp {selectedVilla.pricePerNight.toLocaleString('id-ID')} / malam</span>
                        </div>
                        <div className="flex justify-between mb-2 text-[10px] border-b pb-1.5">
                          <span>Durasi Menginap:</span>
                          <span className="font-bold">
                            {Math.max(1, Math.round((new Date(bookingForm.endDate).getTime() - new Date(bookingForm.startDate).getTime()) / 86400000))} Malam
                          </span>
                        </div>
                        <div className="flex justify-between font-extrabold text-slate-900 mt-1">
                          <span>Estimasi Total Biaya:</span>
                          <span className="text-[#0194f3]">
                            Rp {(selectedVilla.pricePerNight * Math.max(1, Math.round((new Date(bookingForm.endDate).getTime() - new Date(bookingForm.startDate).getTime()) / 86400000))).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}

                    {bookingError && (
                      <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-bold border border-red-100">
                        {bookingError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="w-full py-4 bg-[#0194f3] hover:bg-[#007cd0] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingBooking ? 'Memproses Reservasi Aman...' : 'Pesan & Bayar Sewa Villa'}
                    </button>
                    <p className="text-[9.5px] text-center text-slate-500 leading-none">
                      🔒 Jaminan Enkripsi Aman SST BatuStay.id
                    </p>
                  </form>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-12 pb-6 px-4 sm:px-6 lg:px-8 mt-24 border-t-8 border-[#0194f3]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Logo Brand information */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-3xl font-extrabold font-display tracking-tight text-white inline-block">
              BatuStay<span className="text-[#0194f3]">.id</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Sistem platform persewaan villa Kota Wisata Batu terdepan, lengkap dengan integrasi peta lokasi objek pariwisata populer, pembayaran online QRIS instan, ulasan tamu kredibel, serta otomasi WhatsApp Gateway.
            </p>
            <div className="flex items-center space-x-3 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> WA Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> Email Active</span>
            </div>
          </div>

          {/* Quick Tourist points links */}
          <div>
            <h4 className="text-sky-300 font-bold text-sm tracking-wide mb-4 uppercase">Destinasi Populer Batu</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              <li>📍 Alun-alun Kota Batu</li>
              <li>📍 Jatim Park 1 & 2</li>
              <li>📍 Batu Secret Zoo</li>
              <li>📍 Wisata Songgoriti</li>
              <li>📍 Taman Rekreasi Selecta</li>
            </ul>
          </div>

          {/* Legal / safety trust */}
          <div>
            <h4 className="text-sky-300 font-bold text-sm tracking-wide mb-4 uppercase">Jaminan Keamanan</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              <li>🔒 Secure Payment Simulator</li>
              <li>📅 Kalender Real-time Block</li>
              <li>💬 Respons Cepat WA Admin</li>
              <li>🌟 Ulasan Riil Terverifikasi</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-medium gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span>BatuStay.id © 2026. Hak Cipta Dilindungi Undang-Undang.</span>
            <button
              type="button"
              onClick={() => {
                setPinInput('');
                setPinError('');
                setShowPinModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-[#0194f3] text-slate-300 hover:text-white rounded-xl text-[10px] font-black tracking-wide transition-all uppercase cursor-pointer shadow-xs border border-slate-700/60"
              title="Akses Staf Kelola BatuStay"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>🔑 Login Dasbor Admin</span>
            </button>
          </div>
          <span className="mt-2 sm:mt-0 font-bold hover:text-[#0194f3] transition-colors cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Kembali Ke Atas ▲
          </span>
        </div>
      </footer>

      {/* FOOTER FIXED FLOATING BOT BALLOON ACCELERATION */}
      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 bg-[#0194f3] hover:bg-sky-600 text-white p-4.5 rounded-full shadow-2xl z-40 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer border-4 border-white animate-bounce"
          title="Tanya Asisten AI Wisata Batu"
        >
          <Bot className="w-6 h-6 shrink-0" />
          <span className="text-xs font-bold font-display hidden md:inline">Konsultan AI BatuStay</span>
        </button>
      )}

      {/* SLIDEOUT SIDE CHATBOT ASSISTANT IF EXPANDED */}
      {aiOpen && (
        <div className="fixed bottom-6 right-6 w-[92%] sm:w-[420px] bg-white rounded-[28px] border border-sky-100 shadow-2xl z-50 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom duration-300">
          <div className="bg-[#0194f3] p-4 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-xl">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-normal font-display">Asisten Virtual BatuStay AI</h4>
                <p className="text-[10px] text-sky-100 flex items-center gap-1 font-semibold leading-none mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Online & Siap Membantu
                </p>
              </div>
            </div>
            <button onClick={() => setAiOpen(false)} className="text-white hover:bg-white/10 p-1 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 h-80 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {aiHistory.slice(1).length === 0 && (
              <p className="text-slate-500 text-[11px] leading-relaxed text-center py-6">
                Saya direkomendasikan khusus untuk menjawab perihal sewa kamar, rincian landmark, atau info villa Kota Batu. Silakan ketik pertanyaan di bawah ini!
              </p>
            )}
            
            {aiHistory.map((item, index) => (
              <div key={index} className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] text-xs p-3.5 rounded-xl border ${
                  item.sender === 'user'
                    ? 'bg-[#0194f3] text-white border-[#0194f3] rounded-br-none'
                    : 'bg-white text-slate-800 border-slate-100 rounded-bl-none shadow-xs'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed font-semibold">{item.text}</p>
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-white border text-slate-500 text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-xs">
                  <span className="text-[10px] font-bold">Sedang memikirkan rute terbaik...</span>
                  <span className="flex space-x-1 justify-center">
                    <span className="h-1.5 w-1.5 bg-[#0194f3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-[#0194f3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendAiMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Tanyakan rekomendasi villa..."
              value={aiMessageInput}
              onChange={(e) => setAiMessageInput(e.target.value)}
              className="flex-grow bg-slate-50 text-xs px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#0194f3] text-slate-800 font-bold"
            />
            <button type="submit" className="bg-[#0194f3] text-white p-2.5 rounded-lg hover:bg-sky-600 transition-colors cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* SECURITY SYSTEM PIN VERIFICATION MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-55 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto p-4 bg-[#5A5A40]/10 text-[#5A5A40] w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-[#5A5A40]/20">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold font-display text-slate-900 mb-1">Akses Terbatas Staf</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Silahkan masukkan PIN Keamanan Staf Kelola Villa BatuStay Anda untuk membuktikan hak otoritas Anda.
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="PIN Otoritas Staf"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-center tracking-widest text-lg py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-slate-800 font-extrabold"
                  autoFocus
                />
                
                {pinError && (
                  <p className="text-xs text-red-600 font-bold mt-2 animate-pulse">
                    ⚠️ {pinError}
                  </p>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput('');
                    setPinError('');
                  }}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-[#5A5A40] hover:bg-[#4a4a33] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Verifikasi & Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN CONTROL CENTER OVERLAY MODAL */}
      {adminOpen && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] max-w-6xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative animate-in zoom-in-95 duration-200">
            
            {/* Admin Header */}
            <div className="bg-slate-950 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-slate-800 rounded-xl">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display leading-tight">Admin BatuStay Control Center</h3>
                  <p className="text-xs text-slate-400">Sistem Pengaturan WhatsApp, Produk Katalog Villa & Pemblokiran Tanggal Ketersediaan</p>
                </div>
              </div>
              <button 
                onClick={() => setAdminOpen(false)} 
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Admin Layout Body */}
            <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
              
              {/* Admin Sidebar Controls */}
              <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-5 flex flex-col gap-2 shrink-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Modul Kelola</p>
                
                <button
                  type="button"
                  onClick={() => { setAdminTab('villas'); setAdminError(null); setAdminSuccess(null); }}
                  className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    adminTab === 'villas' ? 'bg-[#5A5A40] text-white shadow-md' : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>🏡 Produk Villa (CRUD)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAdminTab('bookings'); setAdminError(null); setAdminSuccess(null); }}
                  className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    adminTab === 'bookings' ? 'bg-[#5A5A40] text-white shadow-md' : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>📅 Slot Ketersediaan & Booking</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAdminTab('settings'); setAdminError(null); setAdminSuccess(null); }}
                  className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    adminTab === 'settings' ? 'bg-[#5A5A40] text-white shadow-md' : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>⚙️ Atur No. WhatsApp Admin</span>
                </button>

                <div className="mt-auto pt-6 border-t border-slate-200/60 hidden md:block">
                  <div className="bg-[#5A5A40]/10 p-3.5 rounded-xl text-[11px] leading-relaxed text-[#5A5A40]">
                    💡 <strong>Tips Admin:</strong> Untuk memblokir tanggal secara manual, Anda bisa menggunakan modul <strong>Atur Ketersediaan</strong> untuk mengunci kalender dari pesanan ganda (Double Booking).
                  </div>
                </div>
              </div>

              {/* Admin Panel Details Viewport */}
              <div className="flex-grow p-6 sm:p-8 overflow-y-auto bg-white flex flex-col scrollbar-thin">
                
                {/* Alert Notification Display */}
                {adminSuccess && (
                  <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-xl flex items-center space-x-2 animate-in fade-in duration-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{adminSuccess}</span>
                  </div>
                )}
                {adminError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold p-3.5 rounded-xl flex items-center space-x-2 animate-in fade-in duration-200">
                    <span className="shrink-0">⚠️</span>
                    <span>{adminError}</span>
                  </div>
                )}

                {/* MODUL 1: MANAJEMEN VILLA (CRUD) */}
                {adminTab === 'villas' && (
                  <div className="space-y-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 font-display">Produk Villa Aktif</h4>
                        <p className="text-xs text-slate-500">Tambah baru, edit rincian, tarif sewa, panorama gambar, dan hapus vila dari katalog</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenNewVilla}
                        className="flex items-center space-x-1.5 bg-[#5A5A40] hover:bg-[#4a4a35] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Terbit Villa Baru</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-xl flex-grow">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                            <th className="p-4">Villa</th>
                            <th className="p-4">Wilayah / Lokasi</th>
                            <th className="p-4 text-right">Tarif per Malam</th>
                            <th className="p-4 text-center">Spesifikasi</th>
                            <th className="p-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {villas.map((villa) => (
                            <tr key={villa.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center space-x-3.5">
                                  <img 
                                    src={villa.images[0]} 
                                    alt={villa.name} 
                                    className="w-12 h-12 object-cover rounded-lg border shadow-xs shrink-0" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <span className="font-bold text-slate-900 text-sm leading-normal">{villa.name}</span>
                                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{villa.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1 text-slate-600 font-semibold">
                                  <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                                  <span>{villa.location}</span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <span className="font-extrabold text-slate-900 text-sm">Rp {villa.pricePerNight.toLocaleString('id-ID')}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="inline-block bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded text-[10px]">
                                  🛌 {villa.bedrooms} KT / 🚿 {villa.bathrooms} KM / 👥 {villa.maxGuests} Tamu
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditVilla(villa)}
                                    className="px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer border border-slate-200/60"
                                    title="Edit Rincian Villa"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVilla(villa.id)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer border border-red-200"
                                    title="Hapus Villa dari Katalog"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* MODUL 2: KETERSEDIAAN & BOOKING (AVAILABILITY BLOCK) */}
                {adminTab === 'bookings' && (
                  <div className="space-y-6">
                    <div className="pb-4 border-b">
                      <h4 className="text-base font-bold text-slate-900 font-display">Manajemen Ketersediaan Layanan</h4>
                      <p className="text-xs text-slate-500">Blokir tanggal pemeliharaan villa atau kelola ulasan reservasi tamu masuk</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Pemblokir Tanggal Manual Form */}
                      <div className="lg:col-span-1 bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                        <div className="flex items-center space-x-2">
                          <span className="p-1 bg-amber-100 text-amber-800 rounded font-bold text-xs font-mono">LOCK</span>
                          <h5 className="text-xs font-extrabold text-slate-950 uppercase tracking-wide">Blokir Manual Tanggal Kalender</h5>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Gunakan form ini untuk langsung memblokir tanggal villa tertentu sehingga tamu di website tidak bisa memesan (misal untuk pemeliharaan fisik villa).
                        </p>

                        <form onSubmit={handleCreateBlockSlot} className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Pilih Villa Terkait</label>
                            <select
                              required
                              value={dateBlockForm.villaId}
                              onChange={(e) => setDateBlockForm({ ...dateBlockForm, villaId: e.target.value })}
                              className="w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg text-slate-700 font-semibold"
                            >
                              <option value="">-- Pilih Villa --</option>
                              {villas.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Mulai Blokir</label>
                              <input
                                type="date"
                                required
                                value={dateBlockForm.startDate}
                                onChange={(e) => setDateBlockForm({ ...dateBlockForm, startDate: e.target.value })}
                                className="w-full bg-white border border-slate-200 text-xs px-2.5 py-2.5 rounded-lg font-bold text-slate-700"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Selesai Blokir</label>
                              <input
                                type="date"
                                required
                                value={dateBlockForm.endDate}
                                onChange={(e) => setDateBlockForm({ ...dateBlockForm, endDate: e.target.value })}
                                className="w-full bg-white border border-slate-200 text-xs px-2.5 py-2.5 rounded-lg font-bold text-slate-700"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingBlock}
                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            {isSubmittingBlock ? 'Sedang Memblokir...' : 'Kunci / Blokir Tanggal'}
                          </button>
                        </form>
                      </div>

                      {/* Tabel Reservasi & Blockage Slot */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Rincian Riwayat & Pemblokiran Aktif</h5>
                        </div>

                        <div className="border border-slate-100 rounded-xl overflow-hidden overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                                <th className="p-3">Nama Penyewa / Block</th>
                                <th className="p-3">Villa</th>
                                <th className="p-3">Periode Tanggal</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Aksi Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {adminBookings.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-slate-400">
                                    Belum ada transaksi sewa.
                                  </td>
                                </tr>
                              ) : (
                                adminBookings.map((booking) => {
                                  const targetVillaName = villas.find(v => v.id === booking.villaId)?.name || 'Produk Dihapus';
                                  
                                  return (
                                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-all">
                                      <td className="p-3">
                                        <div className="font-bold text-slate-900">{booking.guestName}</div>
                                        <div className="text-[10px] text-slate-400 font-semibold">{booking.guestPhone}</div>
                                      </td>
                                      <td className="p-3">
                                        <span className="text-slate-700 font-semibold">{targetVillaName}</span>
                                      </td>
                                      <td className="p-3">
                                        <span className="font-mono text-slate-800 text-[11px] block">{booking.startDate} s/d</span>
                                        <span className="font-mono text-slate-800 text-[11px] font-bold">{booking.endDate}</span>
                                      </td>
                                      <td className="p-3">
                                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                                          booking.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                          booking.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {booking.status.toUpperCase()}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          {booking.status !== 'paid' && (
                                            <button
                                              type="button"
                                              onClick={() => handleChangeBookingStatus(booking.id, 'paid')}
                                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                                              title="Tandai Bayar Lunas"
                                            >
                                              Lunas
                                            </button>
                                          )}
                                          {booking.status !== 'cancelled' && (
                                            <button
                                              type="button"
                                              onClick={() => handleChangeBookingStatus(booking.id, 'cancelled')}
                                              className="bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded text-[10px] font-bold cursor-pointer font-mono"
                                              title="Unblock / Batalkan Pesanan ini"
                                            >
                                              Batal
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODUL 3: CONFIG WHATSAPP NUMBER SETTINGS */}
                {adminTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="pb-4 border-b">
                      <h4 className="text-base font-bold text-slate-900 font-display">Konfigurasi Pengaturan & Header</h4>
                      <p className="text-xs text-slate-500">Edit nomer WhatsApp staf penerima order dan gambar sirkulasi carousel slide atas.</p>
                    </div>

                    <form onSubmit={handleSaveSettings} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
                      <div>
                        <label className="text-[10px] font-extrabold text-[#0194f3] uppercase tracking-widest block mb-2">No WhatsApp Admin Utama</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: 628123456789"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0194f3] text-slate-800 font-bold"
                        />
                        <p className="text-[10.5px] text-slate-400 mt-2 leading-relaxed">
                          ⚠️ <strong>Sangat Penting:</strong> Gunakan kode negara Indonesia tanpa spasi atau lambang tambah. Contoh: <code>628123456789</code> (bukan 0812 atau +62812).
                        </p>
                      </div>

                      <div className="border-t border-slate-200/50 pt-4">
                        <label className="text-[10px] font-extrabold text-[#0194f3] uppercase tracking-widest block mb-1">Daftar Gambar Slide Banner (Pisahkan dengan Tanda Koma)</label>
                        <span className="text-[10px] text-slate-400 block mb-2">Masukkan URL gambar resolusi tinggi (misal: Unsplash) untuk dipasang di slider landing page depan.</span>
                        <textarea
                          rows={4}
                          placeholder="Contoh: https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600, https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600"
                          value={slidesInput}
                          onChange={(e) => setSlidesInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0194f3] text-slate-700 font-mono font-semibold"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingSettings}
                        className="w-full py-3.5 bg-[#0194f3] hover:bg-[#007cd0] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>💾</span>
                        <span>{isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan No. WhatsApp & Slide'}
                        </span>
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* VILLA REGISTER & CHANGE (ADD/EDIT PRODUCTS CRUD SUB-MODAL) */}
      {showVillaFormModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-55 p-4 overflow-y-auto">
          <div className="bg-white rounded-[26px] max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-thin">
            
            <button 
              type="button"
              onClick={() => setShowVillaFormModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Rincian Informasi</span>
              <h4 className="text-lg font-bold text-slate-900 font-display">
                {editingVillaId ? 'Ubah Informasi Villa' : 'Terbitkan Villa Baru'}
              </h4>
              <p className="text-xs text-slate-500">Formulir lengkap meng-input data properti terdaftar</p>
            </div>

            <form onSubmit={handleSaveVilla} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Nama Villa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Villa Batu Modern View & Pool"
                    value={villaForm.name}
                    onChange={(e) => setVillaForm({ ...villaForm, name: e.target.value })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Tarif Sewa per Malam (IDR) *</label>
                  <input
                    type="number"
                    required
                    min={100000}
                    placeholder="Contoh: 1500000"
                    value={villaForm.pricePerNight}
                    onChange={(e) => setVillaForm({ ...villaForm, pricePerNight: Number(e.target.value) })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Kecamatan / Wilayah *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Oro-Oro Ombo, Batu"
                    value={villaForm.location}
                    onChange={(e) => setVillaForm({ ...villaForm, location: e.target.value })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Alamat Lengkap Properti</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Terusan Sultan Agung No. 5, Batu"
                    value={villaForm.address}
                    onChange={(e) => setVillaForm({ ...villaForm, address: e.target.value })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Deskripsi Utama Villa</label>
                  <textarea
                    rows={3}
                    placeholder="Tulis kenyamanan yang ditandai, misalnya jarak dari Jatim Park, perabotan, panorama alam, dsb."
                    value={villaForm.description}
                    onChange={(e) => setVillaForm({ ...villaForm, description: e.target.value })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Jumlah Kamar Tidur</label>
                  <input
                    type="number"
                    min={1}
                    value={villaForm.bedrooms}
                    onChange={(e) => setVillaForm({ ...villaForm, bedrooms: Number(e.target.value) })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Jumlah Kamar Mandi</label>
                  <input
                    type="number"
                    min={1}
                    value={villaForm.bathrooms}
                    onChange={(e) => setVillaForm({ ...villaForm, bathrooms: Number(e.target.value) })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Kapasitas Maksimal Tamu</label>
                  <input
                    type="number"
                    min={1}
                    value={villaForm.maxGuests}
                    onChange={(e) => setVillaForm({ ...villaForm, maxGuests: Number(e.target.value) })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Garis Lintang (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={villaForm.lat}
                    onChange={(e) => setVillaForm({ ...villaForm, lat: Number(e.target.value) })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-800 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Fasilitas (Pisahkan dengan tanda koma)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kolam Renang, Wifi Premium, Karaoke, Billiard, Water Heater"
                    value={villaForm.amenitiesInput}
                    onChange={(e) => setVillaForm({ ...villaForm, amenitiesInput: e.target.value })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Latar Foto Galeri (Pisahkan dengan koma jika multi gambar)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800, https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"
                    value={villaForm.imagesInput}
                    onChange={(e) => setVillaForm({ ...villaForm, imagesInput: e.target.value })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 text-[11px]"
                  />
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-black uppercase text-[#0194f3] tracking-widest block mb-2">🎯 OPTIMISASI SEO VILLA</span>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Custom Meta Title (Halaman Google)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sewa Villa Batu Murah Private Pool - Pemandangan Indah"
                    value={villaForm.seoTitle}
                    onChange={(e) => setVillaForm({ ...villaForm, seoTitle: e.target.value })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Custom Meta Description (Google Snippet)</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Nikmati menginap mengasyikkan di Batu dengan sewa villa murah modern berpemandangan alam spektakuler."
                    value={villaForm.seoDescription}
                    onChange={(e) => setVillaForm({ ...villaForm, seoDescription: e.target.value })}
                    className="w-full bg-white border text-xs px-3.5 py-2.5 rounded-xl font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowVillaFormModal(false)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVilla}
                  className="flex-grow py-3 bg-[#0194f3] hover:bg-[#007cd0] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer text-center"
                >
                  {isSubmittingVilla ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
