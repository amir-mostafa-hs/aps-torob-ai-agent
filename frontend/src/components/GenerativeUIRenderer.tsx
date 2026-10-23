'use client';

import React, { useState } from 'react';
import {
  Store,
  Compass,
  Building2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ArrowLeft,
  Navigation,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  CreditCard,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { validateUIBlock } from '@/lib/generative-ui';
import { ProductSummary, StoreOfferItem } from '@/types/api';
import { InteractiveMapCard } from '@/components/InteractiveMapCard';

interface GenerativeUIRendererProps {
  block: { type: string; data: any };
  userLat?: number;
  userLon?: number;
  onSelectProduct?: (product: ProductSummary) => void;
  onSelectStore?: (offer: StoreOfferItem) => void;
  onOpenMallGuide?: (mallName: string) => void;
  onOpenInquiry?: (offerId: string) => void;
  onRequestShops?: (productId: string, productTitle: string) => void;
}

export function GenerativeUIRenderer({
  block,
  userLat = 35.7575,
  userLon = 51.4099,
  onSelectProduct,
  onSelectStore,
  onOpenMallGuide,
  onOpenInquiry,
  onRequestShops,
}: GenerativeUIRendererProps) {
  const [selectedMapOffer, setSelectedMapOffer] = useState<StoreOfferItem | null>(null);

  const validated = validateUIBlock(block);

  if (!validated || !validated.valid) {
    return (
      <div className="p-3 my-2 rounded-2xl bg-slate-100 dark:bg-[#18202c] text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 border border-[#e8e6df] dark:border-[#263346]">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>{validated?.error || 'محتوای ساختاریافته قابل نمایش نیست.'}</span>
      </div>
    );
  }

  const { type, data } = validated;

  // 1. PRODUCT CARDS LIST
  if (type === 'ProductCardList') {
    const products: ProductSummary[] = data.products || [];
    if (products.length === 0) return null;

    return (
      <div className="w-full my-3 space-y-2.5 animate-enter">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#d9383a]" />
            <span>مدل‌های کاتالوگ مطابق نیاز شما ({products.length.toLocaleString('fa-IR')} مدل):</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {products.map((p, idx) => (
            <div
              key={p.product_id}
              className={`p-3.5 rounded-2xl bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-xs flex flex-col justify-between gap-3 group stagger-${Math.min(idx + 1, 4)}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#222c3d] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    {p.category_name}
                  </span>
                  {p.offers_count > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-900/50">
                      {p.offers_count.toLocaleString('fa-IR')} مغازه در تهران
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-[#f0f6fc] leading-snug line-clamp-2 group-hover:text-[#d9383a] transition-colors">
                  {p.persian_title_clean}
                </h4>

                {p.specs_summary && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.specs_summary}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#f0eee6] dark:border-[#212c3d] flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">شروع قیمت در تهران</span>
                  <span className="text-xs font-black text-[#d9383a] dark:text-[#e0484a]">
                    {p.min_price_toman
                      ? `${Math.round(p.min_price_toman).toLocaleString('fa-IR')} تومان`
                      : 'استعلام قیمت'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onRequestShops) {
                      onRequestShops(p.product_id, p.persian_title_clean);
                    } else if (onSelectProduct) {
                      onSelectProduct(p);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#d9383a] hover:bg-[#c42b2d] text-white text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-xs cursor-pointer"
                >
                  <span>فروشگاه‌های حضوری</span>
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. SHOP CARDS LIST
  if (type === 'ShopCardList') {
    const offers: StoreOfferItem[] = data.offers || [];
    if (offers.length === 0) return null;

    return (
      <div className="w-full my-3 space-y-2.5 animate-enter">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
          <div className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-[#d9383a]" />
            <span>مغازه‌های فیزیکی دارای کالا ({offers.length.toLocaleString('fa-IR')} فروشگاه باز):</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {offers.map((o) => {
            const isMapOpen = selectedMapOffer?.offer_id === o.offer_id;
            return (
              <div
                key={o.offer_id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] shadow-xs space-y-3 transition-all"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-[#f0f6fc]">
                        {o.shop_name}
                      </span>
                      {o.is_real_shop ? (
                        <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>تأییدشده در ترب</span>
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#222c3d] text-slate-500">
                          فروشگاه حضوری
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {o.navigation?.mall_name_clean
                          ? `${o.navigation.mall_name_clean} ${o.navigation.floor_clean ? `• ${o.navigation.floor_clean}` : ''} ${o.navigation.unit_clean ? `واحد ${o.navigation.unit_clean}` : ''}`
                          : o.navigation?.main_street || 'تهران'}
                      </span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs font-black text-[#d9383a] dark:text-[#e0484a] block">
                      {Math.round(o.price?.amount_toman).toLocaleString('fa-IR')} تومان
                    </span>
                    {o.distance_meters !== null && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {o.distance_meters < 1000
                          ? `${Math.round(o.distance_meters).toLocaleString('fa-IR')} متر از شما`
                          : `${(o.distance_meters / 1000).toFixed(1).replace('.', '٫')} ک.م از شما`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges row: Installment, hours */}
                <div className="flex items-center gap-2 flex-wrap text-[10.5px]">
                  {o.payments?.has_installment && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      <span>امکان خرید اقساطی</span>
                    </span>
                  )}
                  {o.hours?.effective_sat_to_wed_hours && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#222c3d] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>ساعت کاری: {o.hours.effective_sat_to_wed_hours}</span>
                    </span>
                  )}
                </div>

                {/* Actions row */}
                <div className="pt-2 border-t border-[#f0eee6] dark:border-[#212c3d] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {/* Inquiry button */}
                    <button
                      type="button"
                      onClick={() => onOpenInquiry?.(o.offer_id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#222c3d] dark:hover:bg-[#2c384e] text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>استعلام موجودی</span>
                    </button>

                    {/* Mall navigation button */}
                    {o.navigation?.is_inside_mall && o.navigation?.mall_name_clean && (
                      <button
                        type="button"
                        onClick={() => onOpenMallGuide?.(o.navigation.mall_name_clean!)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#222c3d] dark:hover:bg-[#2c384e] text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Compass className="w-3 h-3 text-[#d9383a]" />
                        <span>راهنمای پاساژ</span>
                      </button>
                    )}
                  </div>

                  {/* Toggle Map View button */}
                  <button
                    type="button"
                    onClick={() => setSelectedMapOffer(isMapOpen ? null : o)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-[#2a364a] hover:bg-slate-800 text-white text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{isMapOpen ? 'بستن نقشه' : 'نمایش روی نقشه'}</span>
                  </button>
                </div>

                {/* Inline Map rendering when toggled */}
                {isMapOpen && (
                  <div className="mt-2 pt-2 border-t border-[#f0eee6] dark:border-[#212c3d]">
                    <InteractiveMapCard
                      lat={o.lat}
                      lon={o.lon}
                      title={o.shop_name}
                      subtitle={o.navigation?.floor_clean ? `${o.navigation.floor_clean} واحد ${o.navigation.unit_clean || ''}` : undefined}
                      address={o.navigation?.main_street || `${o.navigation?.mall_name_clean || 'تهران'}`}
                      mallName={o.navigation?.mall_name_clean || undefined}
                      userLat={userLat}
                      userLon={userLon}
                      distanceMeters={o.distance_meters}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. INTERACTIVE MAP CARD
  if (type === 'InteractiveMapCard') {
    return (
      <InteractiveMapCard
        lat={data.lat}
        lon={data.lon}
        title={data.title || data.shop_name || 'فروشگاه فیزیکی'}
        subtitle={data.subtitle}
        address={data.address}
        mallName={data.mall_name}
        userLat={userLat}
        userLon={userLon}
        distanceMeters={data.distance_meters}
      />
    );
  }

  // 4. MALL NAVIGATION CARD
  if (type === 'MallNavigationCard') {
    return (
      <div className="my-3 p-4 rounded-2xl bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] space-y-2.5 animate-enter shadow-xs">
        <div className="flex items-center gap-2 text-[#d9383a] dark:text-[#e0484a] font-bold text-xs">
          <Compass className="w-4 h-4 shrink-0" />
          <span>راهنمای داخل پاساژ {data.mall_name || data.mall_name_clean}</span>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
          {data.floor_clean && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">طبقه و موقعیت:</span>
              <span>{data.floor_clean} {data.unit_clean ? `• واحد ${data.unit_clean}` : ''}</span>
            </div>
          )}
          {data.nearest_metro && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">نزدیک‌ترین مترو:</span>
              <span>{data.nearest_metro}</span>
            </div>
          )}
          {data.parking_info && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">پارکینگ:</span>
              <span>{data.parking_info}</span>
            </div>
          )}
          {data.typical_hours && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">ساعت کار مجتمع:</span>
              <span>{data.typical_hours}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. BAZAAR HUB CARD
  if (type === 'BazaarHubCard') {
    return (
      <div className="my-3 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5 animate-enter shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
          <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>پیشنهاد مراجعه به بورس تخصصی کالا در تهران</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {data.agent_recommendation_text || 'برای این دسته کالا می‌توانید به بورس‌های اصلی تهران مراجعه کنید.'}
        </p>
        {(data.top_neighborhoods || data.top_malls) && (
          <div className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
            قطب‌های اصلی: {data.top_neighborhoods || data.top_malls}
          </div>
        )}
      </div>
    );
  }

  // 6. INQUIRY SIMULATION CARD
  if (type === 'InquirySimulationCard') {
    return (
      <div className="my-3 p-4 rounded-2xl bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] space-y-3 animate-enter shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className={`w-4 h-4 ${data.in_stock ? 'text-emerald-600' : 'text-rose-600'}`} />
            <span className={data.in_stock ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
              {data.in_stock ? 'تأییدیه استعلام: کالا موجود است' : 'عدم موجودی در این لحظه'}
            </span>
          </div>
          {data.confirmed_price_toman && (
            <span className="text-xs font-black text-[#d9383a] dark:text-[#e0484a]">
              قیمت قطعی: {Math.round(data.confirmed_price_toman).toLocaleString('fa-IR')} تومان
            </span>
          )}
        </div>

        {data.seller_message && (
          <div className="text-xs text-slate-700 dark:text-slate-300 bg-[#f8f7f4] dark:bg-[#121822] p-3 rounded-xl border border-[#e8e6df] dark:border-[#263346] leading-relaxed">
            «{data.seller_message}»
          </div>
        )}

        <div className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium flex items-center justify-between">
          <span>{data.recommended_action || 'پیشنهاد: قبل از حرکت، استعلام را با فروشگاه بررسی کنید.'}</span>
          <span className="text-[10px] bg-slate-100 dark:bg-[#222c3d] px-2 py-0.5 rounded text-slate-500">
            استعلام شبیه‌سازی‌شده ترب
          </span>
        </div>
      </div>
    );
  }

  return null;
}
