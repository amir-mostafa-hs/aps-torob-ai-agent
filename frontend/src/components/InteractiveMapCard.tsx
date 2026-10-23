'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Compass, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface InteractiveMapCardProps {
  lat: number;
  lon: number;
  title: string;
  subtitle?: string;
  address?: string;
  mallName?: string;
  userLat?: number;
  userLon?: number;
  distanceMeters?: number | null;
}

export function InteractiveMapCard({
  lat,
  lon,
  title,
  subtitle,
  address,
  mallName,
  userLat = 35.7575,
  userLon = 51.4099,
  distanceMeters,
}: InteractiveMapCardProps) {
  const [zoomLevel, setZoomLevel] = useState(15);

  // Compute bounding box for OpenStreetMap embed
  const delta = 0.008 * (16 / zoomLevel);
  const minLon = (lon - delta).toFixed(4);
  const minLat = (lat - delta).toFixed(4);
  const maxLon = (lon + delta).toFixed(4);
  const maxLat = (lat + delta).toFixed(4);

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lon}`;

  // Direct app navigation links
  const neshanUrl = `https://neshan.org/maps/@${lat},${lon},16z`;
  const baladUrl = `https://balad.ir/location?latitude=${lat}&longitude=${lon}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

  const formattedDistance =
    distanceMeters !== undefined && distanceMeters !== null
      ? distanceMeters < 1000
        ? `${Math.round(distanceMeters).toLocaleString('fa-IR')} متر`
        : `${(distanceMeters / 1000).toFixed(1).replace('.', '٫')} کیلومتر`
      : null;

  return (
    <div className="w-full my-3 rounded-2xl border border-[#e8e6df] dark:border-[#263346] bg-white dark:bg-[#18202c] shadow-xs overflow-hidden animate-enter">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[#f0eee6] dark:border-[#263346] flex items-center justify-between bg-slate-50/50 dark:bg-[#151b24]/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-[#d9383a] dark:text-[#e0484a] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-[#f0f6fc]">
              موقعیت مکانی: {title}
            </h4>
            {mallName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                واقع در {mallName} {subtitle ? `• ${subtitle}` : ''}
              </p>
            )}
          </div>
        </div>

        {formattedDistance && (
          <div className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-[11px] font-bold text-[#d9383a] dark:text-[#e0484a] flex items-center gap-1 shrink-0">
            <Navigation className="w-3 h-3" />
            <span>{formattedDistance} از شما</span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-56 bg-slate-100 dark:bg-[#111620] overflow-hidden">
        <iframe
          title={`نقشه موقعیت ${title}`}
          src={osmUrl}
          className="w-full h-full border-0 select-none pointer-events-auto"
          loading="lazy"
        />

        {/* Map Control Buttons */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
            className="w-7 h-7 rounded-lg bg-white/95 dark:bg-[#18202c]/95 backdrop-blur-md shadow-xs border border-slate-200 dark:border-[#2a3547] text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            title="بزرگ‌نمایی"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 12))}
            className="w-7 h-7 rounded-lg bg-white/95 dark:bg-[#18202c]/95 backdrop-blur-md shadow-xs border border-slate-200 dark:border-[#2a3547] text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            title="کوچک‌نمایی"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User location indicator overlay */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#18202c]/90 backdrop-blur-md text-[10.5px] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-[#2a3547] flex items-center gap-1.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>موقعیت شما: تهران (میدان ونک)</span>
        </div>
      </div>

      {/* Address & Direct Navigation Links */}
      <div className="p-3 bg-white dark:bg-[#18202c] border-t border-[#f0eee6] dark:border-[#263346] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed truncate">
          {address || 'تهران، محدوده تجاری اعلام شده در کاتالوگ فروشگاه'}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={neshanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#212c3d] dark:hover:bg-[#2a374c] text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <span>نشان</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href={baladUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#212c3d] dark:hover:bg-[#2a374c] text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <span>بلد</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-[#d9383a] hover:bg-[#c42b2d] text-white text-[11px] font-medium transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>گوگل مپ</span>
            <Navigation className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
