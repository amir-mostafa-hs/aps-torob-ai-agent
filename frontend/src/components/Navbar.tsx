'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, RotateCcw, Moon, Sun, Sparkles } from 'lucide-react';
import { COPY_FA } from '@/copy/fa';

interface NavbarProps {
  currentArea: string;
  isChatActive: boolean;
  onOpenLocation: () => void;
  onNewChat: () => void;
}

export function Navbar({ currentArea, isChatActive, onOpenLocation, onNewChat }: NavbarProps) {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const isDarkMode =
      document.documentElement.classList.contains('dark') ||
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
    <header className="sticky top-0 z-30 bg-[#f8f7f4]/85 dark:bg-[#0f141c]/85 backdrop-blur-md border-b border-[#e8e6df] dark:border-[#263346]">
      <div className="max-w-4xl mx-auto px-4 h-15 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onNewChat}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          role="button"
          tabIndex={0}
        >
          <div className="w-8 h-8 rounded-xl bg-[#d9383a] text-white flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
            ت
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-[#f0f6fc]">
                {COPY_FA.appName}
              </span>
              <span className="text-[10px] bg-slate-200/60 text-slate-700 dark:bg-[#212c3d] dark:text-slate-300 font-bold px-1.5 py-0.5 rounded-md">
                {COPY_FA.cityBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Location button */}
          <button
            type="button"
            onClick={onOpenLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-[#18202c] hover:bg-slate-50 dark:hover:bg-[#212c3d] text-slate-700 dark:text-slate-200 transition-colors border border-[#e8e6df] dark:border-[#263346] shadow-xs cursor-pointer"
            title={COPY_FA.home.locationChange}
          >
            <MapPin className="w-3.5 h-3.5 text-[#d9383a]" />
            <span className="max-w-[110px] truncate">{currentArea}</span>
          </button>

          {/* New Chat Button (visible when chat active) */}
          {isChatActive && (
            <button
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-[#18202c] hover:bg-slate-50 dark:hover:bg-[#212c3d] text-slate-700 dark:text-slate-200 transition-colors border border-[#e8e6df] dark:border-[#263346] shadow-xs cursor-pointer active:scale-95"
              title="شروع گفت‌وگوی جدید"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">گفت‌وگوی تازه</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-[#18202c] hover:bg-slate-50 dark:hover:bg-[#212c3d] text-slate-600 dark:text-slate-300 transition-colors border border-[#e8e6df] dark:border-[#263346] shadow-xs cursor-pointer"
            title={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
            aria-label="تغییر تم"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
