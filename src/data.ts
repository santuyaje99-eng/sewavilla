/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Villa, Review } from './types.ts';

export const INITIAL_VILLAS: Villa[] = [
  {
    id: 'villa-1',
    name: 'Villa Pine Forest Batu',
    description: 'Rasakan kesegaran menginap di dalam area hutan pinus Bumiaji yang sejuk dan asri. Villa semi-modern ini memiliki arsitektur kayu hangat dengan dinding kaca besar yang menghadap langsung ke panorama Gunung Arjuno. Dilengkapi dengan fasilitas perapian outdoor, area barbekyu yang luas, dan kolam renang air hangat mini yang sangat cocok untuk bersantai bersama keluarga di malam hari yang dingin.',
    location: 'Bumiaji, Batu',
    address: 'Jl. Pinus Bumiaji No. 89, Bumiaji, Kota Batu, Jawa Timur',
    lat: -7.8345,
    lng: 112.5321,
    pricePerNight: 1850000,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 12,
    amenities: [
      'Kolam Renang Air Hangat',
      'Wifi Kecepatan Tinggi (100Mbps)',
      'Smart TV & Karaoke Room',
      'Fire Pit & Alat BBQ lengkap',
      'Pemandangan Gunung Arjuno',
      'Dapur Lengkap & Microwave',
      'Area Parkir 3 Mobil'
    ],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8
  },
  {
    id: 'villa-2',
    name: 'Villa Kusuma Hills Sunrise',
    description: 'Terletak di salah satu puncak bukit tertinggi di kawasan Kusuma Agrowisata. Villa mewah bergaya minimalis tropis ini menawarkan pemandangan sunset dan sunrise 360 derajat yang menakjubkan di atas Kota Batu. Memiliki infinity pool pribadi yang menghadap ke lembah, meja billiard premium, dan karaoke room kedap suara. Sangat pas untuk merayakan momen spesial atau gathering komunitas.',
    location: 'Kusuma Hills, Batu',
    address: 'Kawasan Kusuma Agrowisata Blok C-12, Sisir, Kota Batu, Jawa Timur',
    lat: -7.8762,
    lng: 112.5115,
    pricePerNight: 2750000,
    bedrooms: 5,
    bathrooms: 4,
    maxGuests: 15,
    amenities: [
      'Infinity Pool Menghadap Lembah',
      'Meja Billiard Mezzanine',
      'Karaoke Sound System Premium',
      'Roofdeck 360 View',
      'Akses Kursi Roda',
      'Smart Lock System',
      'Garasi Luas'
    ],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9
  },
  {
    id: 'villa-3',
    name: 'Villa Sky Garden Oro-Oro Ombo',
    description: 'Villa modern estetik dengan konsep taman gantung (Sky Garden) di atas atap, terletak strategis hanya 3 menit dari Jatim Park 2 dan Batu Night Spectacular (BNS). Desain interior yang instagramable mendominasi setiap sudut ruangan dengan pencahayaan alami yang cerah. Dilengkapi area bermain anak, proyektor bioskop mini pribadi (home theater), serta dapur modern koki lengkap.',
    location: 'Oro-Oro Ombo, Batu',
    address: 'Jl. Oro-orombo No. 45, Komplek Jatim Raya, Kota Batu, Jawa Timur',
    lat: -7.8921,
    lng: 112.5284,
    pricePerNight: 1450000,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 8,
    amenities: [
      'Sky Garden & Rooftop Cafe Area',
      'Home Theater & Netflix Play',
      'Kolam Renang Anak (Kids Pool)',
      'Alat BBQ & Suki Pan Elektrik',
      'Dekat Jatim Park 2 & BNS',
      'Mainan Anak / Playground',
      'Amenities Kamar Mandi Lengkap'
    ],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.6
  },
  {
    id: 'villa-4',
    name: 'Villa Heritage Songgoriti Warmth',
    description: 'Nikmati suasana nostalgia di villa berdesain heritage klasik Jawa-kolonial yang berdiri kokoh di kaki bukit Songgoriti. Dikelilingi taman bunga mawar yang rimbun dan asri, villa ini menawarkan pemandangan klasik perkampungan Batu dan pegunungan berkabut. Fasilitas spa/sauna privat, gazebo kayu jati, kolam renang bernuansa alam batu kali, dan staf pembuat sarapan tradisional lokal.',
    location: 'Songgokerto, Batu',
    address: 'Jl. Arumdalu No. 12, Songgokerto (Kawasan Songgoriti), Kota Batu, Jawa Timur',
    lat: -7.8598,
    lng: 112.5029,
    pricePerNight: 1600000,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 10,
    amenities: [
      'Kolam Renang Batu Alam',
      'Sauna & Gazebo Tradisional',
      'Staf Butler & Free Breakfast Lokal',
      'Taman Bunga Sangat Luas',
      'Perapian Kayu Alami Klasik',
      'Alat Barbekyu Arang Tradisional',
      'Water Heater Alami'
    ],
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    villaId: 'villa-1',
    guestName: 'Budi Santoso',
    rating: 5,
    comment: 'Luar biasa bersih dan sejuk! Menginap di sini bersama keluarga besar saat liburan sekolah sangat memuaskan. Air hangat di kolam renangnya pas banget buat malam hari di Batu yang dingin sekali.',
    date: '2026-05-15'
  },
  {
    id: 'rev-2',
    villaId: 'villa-1',
    guestName: 'Adinda Putri',
    rating: 4,
    comment: 'Pemandangan pagi hari menghadap Gunung Arjuno sangat spektakuler. Fasilitas BBQ-nya lengkap sekali, tinggal beli bahan di pasar seberang. Sedikit dingin di malam hari tapi ada perapian outdoor yang membantu banget.',
    date: '2026-05-28'
  },
  {
    id: 'rev-3',
    villaId: 'villa-2',
    guestName: 'Rian Hidayat',
    rating: 5,
    comment: 'Sangat mewah! Infinity pool-nya adalah spot foto terbaik yang pernah saya kunjungi di villa-villa Batu. Sound system karaoke kedap suaranya sangat berkualitas, billiard mezzanine nambah betah stay di sini.',
    date: '2026-06-01'
  },
  {
    id: 'rev-4',
    villaId: 'villa-3',
    guestName: 'Hendra Wijaya',
    rating: 5,
    comment: 'Tempat favorit anak-anak! Sangat dekat dari Jatim Park 2 jadi nggak habis waktu di jalan kena macet. Rooftopnya asik buat nongkrong sore-sore lihat sunset Kota Batu. Bersih dan dapet layanan Netflix gratis.',
    date: '2026-05-20'
  },
  {
    id: 'rev-5',
    villaId: 'villa-4',
    guestName: 'Siti Rahma',
    rating: 4,
    comment: 'Arsitektur heritagenya sangat tenang dan menenangkan jiwa. Sarapan tradisional yang dimasak langsung oleh stafnya enak sekali (nasi pecel lokal). Kolam renang bernuansa alam batu kalinya sangat segar.',
    date: '2026-06-04'
  }
];
