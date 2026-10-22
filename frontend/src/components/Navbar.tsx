'use client';

import React from 'react';
import { MapPin, Sparkles, ShoppingBag } from 'lucide-react';
import { COPY_FA } from '@/copy/fa';

interface NavbarProps {
  currentArea: string;
  onOpenLocation: () => void;
  onToggleChat: () => void;
}

export function Navbar({ currentArea, onOpenLocation, onToggleChat }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-500/20">
            ت
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-base md:text-lg">
                {COPY_FA.appName}
              </span>
              <span className="text-xs bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                {COPY_FA.cityBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              خرید حضوری مطمئن از فروشگاه‌های فیزیکی تهران
            </p>
          </div>
        </div>

        {/* Actions: Location Selector & Chat Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
            title={COPY_FA.home.locationChange}
          >
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="max-w-[100px] truncate">{currentArea}</span>
          </button>

          <button
            onClick={onToggleChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm shadow-red-600/30 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">دستیار هوشمند</span>
          </button>
        </div>
      </div>
    </header>
  );
}
