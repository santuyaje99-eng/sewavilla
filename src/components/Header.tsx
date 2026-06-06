/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Calendar, PhoneCall, Bot, Flame, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onScrollToVillas: () => void;
  onScrollToMap: () => void;
  onScrollToAssistant: () => void;
  notificationCount: number;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  whatsappNumber: string;
}

export default function Header({
  onScrollToVillas,
  onScrollToMap,
  onScrollToAssistant,
  notificationCount,
  onOpenNotifications,
  onOpenAdmin,
  whatsappNumber
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#e5e5dd] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="p-2.5 bg-[#0194f3] rounded-xl text-white shadow-md">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-[#0194f3] tracking-tight font-display">
                BatuStay<span className="text-[#007cd0]">.</span>
              </span>
              <div className="flex items-center space-x-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0194f3] animate-pulse"></span>
                <span className="text-[10px] text-slate-500 font-bold">ke Batu sewa villa hanya disini</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={onScrollToVillas}
              className="text-slate-600 hover:text-[#5A5A40] font-medium text-sm transition-colors cursor-pointer"
            >
              Katalog Villa
            </button>
            <button
              onClick={onScrollToMap}
              className="text-slate-600 hover:text-[#5A5A40] font-medium text-sm transition-colors cursor-pointer"
            >
              Peta Lokasi
            </button>
            <button
              onClick={onScrollToAssistant}
              className="flex items-center space-x-1.5 text-slate-600 hover:text-[#5A5A40] font-medium text-sm transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#5A5A40]" />
              <span>Rekomendasi AI</span>
            </button>
          </nav>

          {/* Call to Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-200"
              title="Notifikasi Masuk (Auto Email to WA Gateway)"
            >
              <Calendar className="w-5 h-5 text-slate-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#5A5A40] text-[10px] font-bold text-white leading-none">
                  {notificationCount}
                </span>
              )}
            </button>

            <a
              href={`https://wa.me/${whatsappNumber}?text=Halo%20Admin%20Sewa%20Villa%20Batu,%20saya%20tertarik%20bertanya%20sewa%20villa.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-[#5A5A40]/10 text-[#5A5A40] hover:bg-[#5A5A40]/20 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp Admin</span>
              <span className="sm:hidden">Admin WA</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
