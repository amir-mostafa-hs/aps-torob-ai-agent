'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Sparkles, Moon, Sun } from 'lucide-react';
import { COPY_FA } from '@/copy/fa';

interface NavbarProps {
  currentArea: string;
  onOpenLocation: () => void;
  onToggleChat: () => void;
}

export function Navbar({ currentArea, onOpenLocation, onToggleChat }: NavbarProps) {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Detect initial theme from DOM or system
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#111620]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-[#232d3d]/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d9383a] dark:bg-[#e05a5a] flex items-center justify-center text-white font-black text-lg shadow-sm">
            ت
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-[#f0f6fc] text-base md:text-lg">
                {COPY_FA.appName}
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-600 dark:bg-[#1a2230] dark:text-slate-300 font-medium px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-[#2a3547]">
                {COPY_FA.cityBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              خرید حضوری مطمئن از فروشگاه‌های فیزیکی تهران
            </p>
          </div>
        </div>

        {/* Actions: Location Selector, Theme Toggle & Chat Button */}
        <div className="flex items-center gap-2">
          {/* Location button */}
          <button
            onClick={onOpenLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100/80 hover:bg-slate-200/70 dark:bg-[#1a2230] dark:hover:bg-[#232d3d] text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/70 dark:border-[#2a3547]"
            title={COPY_FA.home.locationChange}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="max-w-[100px] truncate">{currentArea}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 dark:bg-[#1a2230] dark:hover:bg-[#232d3d] text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/70 dark:border-[#2a3547]"
            title={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
            aria-label="تغییر تم"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Assistant Chat Button */}
          <button
            onClick={onToggleChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-700 dark:bg-rose-600/85 dark:hover:bg-rose-500 text-white transition-all shadow-none active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">دستیار هوشمند</span>
          </button>
        </div>
      </div>
    </header>
  );
}
