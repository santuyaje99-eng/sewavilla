/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Villa {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  rating: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Review {
  id: string;
  villaId: string;
  guestName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Booking {
  id: string;
  villaId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  startDate: string;
  endDate: string;
  totalNights: number;
  totalPrice: number;
  paymentMethod: 'qris' | 'transfer' | 'wa_admin';
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  bookingId: string;
  type: 'email' | 'wa';
  recipient: string;
  subjectOrHeader: string;
  body: string;
  status: 'sent' | 'failed';
  timestamp: string;
}
