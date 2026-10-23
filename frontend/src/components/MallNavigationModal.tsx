'use client';

import React, { useEffect, useState } from 'react';
import { X, Building2, Train, Car, Navigation, MapPin, Compass } from 'lucide-react';
import { StoreOfferItem, MallInfo } from '@/types/api';
import { getMall } from '@/lib/api';
import { COPY_FA } from '@/copy/fa';

interface MallNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: StoreOfferItem | null;
  mallName?: string | null;
}

export function MallNavigationModal({
  isOpen,
  onClose,
  offer,
  mallName,
}: MallNavigationModalProps) {
  const [mallInfo, setMallInfo] = useState<MallInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveMallName = mallName || offer?.navigation.mall_name_clean;

  useEffect(() => {
    if (isOpen && effectiveMallName) {
      setLoading(true);
      getMall(effectiveMallName)
        .then(setMallInfo)
        .catch(() => setMallInfo(null))
        .finally(() => setLoading(false));
    } else {
      setMallInfo(null);
    }
  }, [isOpen, effectiveMallName]);

  if (!isOpen || (!offer && !mallName)) return null;

  const nav = offer?.navigation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#18202c] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-[#263346] space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#232d3d] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/15 text-[#d9383a] dark:text-[#e0484a]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-[#f0f6fc]">
                {COPY_FA.mallLocator.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {offer ? `${offer.shop_name} • ` : ''}
                {effectiveMallName || 'پاساژ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* In-Mall Exact Location Card (if specific store offer is provided) */}
        {nav && (
          <div className="bg-rose-50/50 dark:bg-[#1a2230]/60 p-4 rounded-2xl border border-rose-200/60 dark:border-[#2a3547] space-y-3">
            <span className="text-xs font-bold text-[#d9383a] dark:text-[#e0484a] block">
              موقعیت دقیق غرفه در پاساژ:
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white dark:bg-[#151b24] p-2.5 rounded-xl border border-slate-200 dark:border-[#232d3d]">
                <span className="text-slate-400 block text-[10px]">طبقه:</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f6fc] text-sm">
                  {nav.floor_clean || 'همکف'}
                </span>
              </div>
              <div className="bg-white dark:bg-[#151b24] p-2.5 rounded-xl border border-slate-200 dark:border-[#232d3d]">
                <span className="text-slate-400 block text-[10px]">واحد / پلاک:</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f6fc] text-sm">
                  {nav.unit_clean || 'نامشخص'}
                </span>
              </div>
            </div>

            {nav.indoor_navigation_hint && (
              <div className="bg-white dark:bg-[#151b24] p-3 rounded-xl border border-slate-200 dark:border-[#232d3d] text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <span className="font-bold text-[#d9383a] dark:text-[#e0484a] ml-1">راهنمای مسیر داخل راهرو:</span>
                {nav.indoor_navigation_hint}
              </div>
            )}
          </div>
        )}

        {/* Mall Directory & Access Details */}
        {mallInfo && (
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
              مشخصات و دسترسی‌های مجتمع:
            </h4>
            <div className="space-y-2 text-xs">
              {mallInfo.nearest_metro && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <Train className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">نزدیک‌ترین مترو:</span>
                    <span className="text-slate-600 dark:text-slate-300">{mallInfo.nearest_metro}</span>
                  </div>
                </div>
              )}

              {mallInfo.parking_info && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <Car className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">پارکینگ:</span>
                    <span className="text-slate-600 dark:text-slate-300">{mallInfo.parking_info}</span>
                  </div>
                </div>
              )}

              {mallInfo.typical_hours && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <Building2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">ساعات کاری پاساژ:</span>
                    <span className="text-slate-600 dark:text-slate-300">{mallInfo.typical_hours}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Street Address */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {nav?.main_street || nav?.location_label || mallInfo?.location_label || 'تهران'}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          {COPY_FA.mallLocator.closeBtn}
        </button>
      </div>
    </div>
  );
}
