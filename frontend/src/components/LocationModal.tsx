'use client';

import React, { useState } from 'react';
import { X, MapPin, Navigation, Check } from 'lucide-react';
import { COPY_FA } from '@/copy/fa';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArea: string;
  currentRadius: number;
  onSelectLocation: (area: string, lat: number, lon: number, radiusMeters: number) => void;
}

export function LocationModal({
  isOpen,
  onClose,
  currentArea,
  currentRadius,
  onSelectLocation,
}: LocationModalProps) {
  const [selectedArea, setSelectedArea] = useState(currentArea);
  const [radius, setRadius] = useState(currentRadius / 1000); // in km
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);

  if (!isOpen) return null;

  const handleUseGPS = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند.');
      return;
    }
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingGps(false);
        onSelectLocation('موقعیت من (GPS)', pos.coords.latitude, pos.coords.longitude, radius * 1000);
        onClose();
      },
      (err) => {
        setLoadingGps(false);
        setGpsError(COPY_FA.locationSheet.gpsDeniedWarning);
      },
      { timeout: 8000 }
    );
  };

  const handleSelectDistrict = (district: { name: string; lat: number; lon: number }) => {
    setSelectedArea(district.name);
    onSelectLocation(district.name, district.lat, district.lon, radius * 1000);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {COPY_FA.locationSheet.title}
              </h3>
              <p className="text-xs text-slate-500">
                {COPY_FA.locationSheet.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button */}
        <button
          onClick={handleUseGPS}
          disabled={loadingGps}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all border border-slate-200 dark:border-slate-700"
        >
          <Navigation className={`w-4 h-4 text-red-600 ${loadingGps ? 'animate-spin' : ''}`} />
          {loadingGps ? 'در حال دریافت موقعیت...' : COPY_FA.locationSheet.useMyLocation}
        </button>

        {gpsError && (
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {gpsError}
          </div>
        )}

        {/* Popular Districts */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 block">
            یا انتخاب از محله‌های پرتردد تهران:
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {COPY_FA.locationSheet.popularDistricts.map((d) => (
              <button
                key={d.name}
                onClick={() => handleSelectDistrict(d)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border text-right transition-all ${
                  selectedArea === d.name
                    ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 dark:border-red-700'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{d.name}</span>
                {selectedArea === d.name && <Check className="w-3.5 h-3.5 text-red-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Radius Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {COPY_FA.locationSheet.radiusLabel}:
            </span>
            <span className="font-bold text-red-600 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40">
              {radius} کیلومتر
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full accent-red-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>۱ کیلومتر (پیاده)</span>
            <span>۱۰ کیلومتر</span>
            <span>۲۵ کیلومتر (کل تهران)</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-md shadow-red-600/20"
        >
          {COPY_FA.locationSheet.confirmButton}
        </button>
      </div>
    </div>
  );
}
