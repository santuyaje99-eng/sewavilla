/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bed, Bath, Users, Star, MapPin, Sparkles } from 'lucide-react';
import { Villa } from '../types.ts';

interface VillaCardProps {
  key?: React.Key;
  villa: Villa;
  onBook: (villa: Villa) => void;
  onSelectMap: (villa: Villa) => void;
}

export default function VillaCard({ villa, onBook, onSelectMap }: VillaCardProps) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === villa.images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === 0 ? villa.images.length - 1 : prev - 1));
  };

  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-[#e5e5dd] card-natural soft-shadow hover:scale-[1.01] transition-all duration-300 flex flex-col group h-full">
      {/* Photo Gallery Carousel */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-900">
        <img
          src={villa.images[currentImgIdx]}
          alt={`${villa.name} - ${currentImgIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

        {/* Floating Badger */}
        <div className="absolute top-4 left-4 bg-[#5A5A40]/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          <span>REAL-TIME BOOKING</span>
        </div>

        {/* Next/Prev Nav Arrows (shown on hover on desktop, or always) */}
        <button
          onClick={handlePrevImg}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNextImg}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Micro Carousel Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5">
          {villa.images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImgIdx(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentImgIdx ? 'w-4 bg-[#5A5A40]' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Villa Meta Details */}
      <div className="p-6 flex-1 flex flex-col bg-white">
        {/* Title & Ratings */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="serif-font text-2xl font-bold text-slate-900 tracking-tight leading-snug hover:text-[#5A5A40] transition-colors">
            {villa.name}
          </h3>
          <div className="flex items-center space-x-1 bg-[#5A5A40]/10 text-[#5A5A40] px-2.5 py-1 rounded-lg shrink-0 font-semibold text-xs border border-[#5A5A40]/20">
            <Star className="w-3.5 h-3.5 fill-current text-yellow-600" />
            <span>{villa.rating || 4.5}</span>
          </div>
        </div>

        {/* Location clickable badge */}
        <button
          onClick={() => onSelectMap(villa)}
          className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-[#5A5A40] font-medium mb-4 self-start cursor-pointer transition-colors"
          title="Klik untuk tampilkan di Peta"
        >
          <MapPin className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
          <span className="underline underline-offset-2 decoration-dashed text-left">{villa.address}</span>
        </button>

        {/* Description brief */}
        <p className="text-sm text-slate-600 leading-relaxed mb-5 line-clamp-3">
          {villa.description}
        </p>

        {/* Sizing badges */}
        <div className="grid grid-cols-3 gap-3 border-y border-dashed border-[#e5e5dd] py-3.5 mb-5 text-slate-700 text-xs font-semibold">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50">
            <Bed className="w-4 h-4 text-[#5A5A40] mb-1" />
            <span>{villa.bedrooms} Kamar tidur</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50">
            <Bath className="w-4 h-4 text-[#5A5A40] mb-1" />
            <span>{villa.bathrooms} Kamar mandi</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50">
            <Users className="w-4 h-4 text-[#5A5A40] mb-1" />
            <span>Maks {villa.maxGuests} Tamu</span>
          </div>
        </div>

        {/* Amenities Highlights (limit 3 tags) */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {villa.amenities.slice(0, 4).map((amenity, idx) => (
            <span
              key={idx}
              className="text-[10px] sm:text-xs font-medium text-slate-600 bg-[#f5f5f0] hover:bg-[#e4e4db] px-2.5 py-1 rounded-lg transition-colors border border-slate-100"
            >
              {amenity}
            </span>
          ))}
          {villa.amenities.length > 4 && (
            <span className="text-[10px] sm:text-xs font-bold text-[#5A5A40] bg-[#5A5A40]/10 px-2.5 py-1 rounded-lg border border-[#5A5A40]/20">
              +{villa.amenities.length - 4} Lainnya
            </span>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium tracking-wide block uppercase">
              Mulai Dari
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-slate-900 serif-font">
                Rp {villa.pricePerNight.toLocaleString('id-ID')}
              </span>
              <span className="text-slate-500 text-xs font-medium">/ malam</span>
            </div>
          </div>

          <button
            onClick={() => onBook(villa)}
            className="px-5 py-3.5 bg-[#5A5A40] hover:bg-[#4d4d36] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg hover:scale-101 active:scale-98 cursor-pointer transition-all duration-200"
          >
            Pesan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
