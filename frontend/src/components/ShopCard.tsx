'use client';

import React from 'react';
import {
  MapPin, Clock, CreditCard, ShieldCheck, PhoneCall,
  ExternalLink, Building2, AlertTriangle, Compass
} from 'lucide-react';
import { StoreOfferItem } from '@/types/api';
import { COPY_FA } from '@/copy/fa';

interface ShopCardProps {
  offer: StoreOfferItem;
  onOpenMallGuide: (offer: StoreOfferItem) => void;
  onOpenInquiry: (offer: StoreOfferItem) => void;
}

export function ShopCard({
  offer,
  onOpenMallGuide,
  onOpenInquiry,
}: ShopCardProps) {
  const formatPrice = (p: number) => {
    return `${Math.round(p).toLocaleString('fa-IR')} تومان`;
  };

  const formatDistance = (m: number | null) => {
    if (!m) return null;
    if (m < 1000) return `${Math.round(m)} متر`;
    return `${(m / 1000).toFixed(1)} کیلومتر`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Shop name & distance */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {offer.shop_name}
              </h4>
              {offer.is_real_shop ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  فروشگاه تأییدشده
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">
                  (ثبت‌شده در ترب)
                </span>
              )}
            </div>

            {/* Mall / Street info */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {offer.navigation.is_inside_mall && offer.navigation.mall_name_clean
                  ? `${offer.navigation.mall_name_clean} • ${offer.navigation.floor_clean || ''} ${offer.navigation.unit_clean || ''}`
                  : offer.navigation.main_street || offer.navigation.location_label || 'تهران'}
              </span>
            </div>
          </div>

          {/* Distance Badge */}
          {offer.distance_meters !== null && (
            <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {formatDistance(offer.distance_meters)}
            </span>
          )}
        </div>

        {/* Feature Badges: Installment, Hours, Freshness */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {offer.payments.has_installment && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
              <CreditCard className="w-3 h-3" />
              <span>خرید قسطی (ترب‌پی)</span>
            </span>
          )}

          {offer.hours.effective_sat_to_wed_hours && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{offer.hours.effective_sat_to_wed_hours}</span>
            </span>
          )}

          {offer.has_warranty && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{offer.warranty_clean}</span>
            </span>
          )}
        </div>

        {/* Price & Freshness Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">قیمت ثبت‌شده:</span>
            <span className="text-sm font-extrabold text-red-600 dark:text-red-400">
              {formatPrice(offer.price.amount_toman)}
            </span>
          </div>

          <div className="text-left">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
              offer.price.needs_seller_call
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}>
              {offer.price.freshness_label}
            </span>
          </div>
        </div>

        {/* Warning if stale price */}
        {offer.price.needs_seller_call && (
          <div className="text-[11px] text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{offer.price.call_reason}</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
        <button
          onClick={() => onOpenInquiry(offer)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>استعلام زنده</span>
        </button>

        {offer.navigation.is_inside_mall ? (
          <button
            onClick={() => onOpenMallGuide(offer)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-red-600" />
            <span>راهنمای پاساژ</span>
          </button>
        ) : (
          <div className="flex items-center justify-center text-[11px] text-slate-400">
            فروشگاه خیابانی
          </div>
        )}
      </div>
    </div>
  );
}
