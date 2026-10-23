'use client';

import React from 'react';
import {
  Store,
  Compass,
  Building2,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Tag,
  MapPin,
  Clock,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { validateUIBlock } from '@/lib/generative-ui';
import { ProductSummary, StoreOfferItem } from '@/types/api';

interface GenerativeUIRendererProps {
  block: { type: string; data: any };
  onSelectProduct?: (product: ProductSummary) => void;
  onSelectStore?: (offer: StoreOfferItem) => void;
  onOpenMallGuide?: (mallName: string) => void;
  onOpenInquiry?: (offerId: string) => void;
}

export function GenerativeUIRenderer({
  block,
  onSelectProduct,
  onSelectStore,
  onOpenMallGuide,
  onOpenInquiry,
}: GenerativeUIRendererProps) {
  const validated = validateUIBlock(block);

  if (!validated || !validated.valid) {
    return (
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>{validated?.error || 'محتوای ساختاریافته قابل نمایش نیست.'}</span>
      </div>
    );
  }

  const { type, data } = validated;

  if (type === 'ProductCardList') {
    const products: ProductSummary[] = data.products || [];
    if (products.length === 0) return null;

    return (
      <div className="space-y-2 animate-enter">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span>مدل‌های پیشنهادی دستیار ({products.length.toLocaleString('fa-IR')} مدل):</span>
        </div>
        <div className="space-y-1.5">
          {products.map((p) => (
            <div
              key={p.product_id}
              onClick={() => onSelectProduct?.(p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProduct?.(p);
                }
              }}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1a2230] hover:bg-rose-50/70 dark:hover:bg-rose-950/30 cursor-pointer transition-all border border-slate-200/80 dark:border-[#2a3547] flex items-center justify-between gap-3 group active:scale-[0.99]"
            >
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-xs text-slate-900 dark:text-[#f0f6fc] block truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {p.persian_title_clean}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{p.category_name}</span>
                  {p.min_price_toman && (
                    <>
                      <span>•</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        از {Math.round(p.min_price_toman).toLocaleString('fa-IR')} ت
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 shrink-0">
                <span>فروشگاه‌ها</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'ShopCardList') {
    const offers: StoreOfferItem[] = data.offers || [];
    if (offers.length === 0) return null;

    return (
      <div className="space-y-2 animate-enter">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span>فروشگاه‌های حضوری دارای کالا ({offers.length.toLocaleString('fa-IR')} فروشگاه):</span>
        </div>
        <div className="space-y-2">
          {offers.map((o) => (
            <div
              key={o.offer_id}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1a2230] border border-slate-200/80 dark:border-[#2a3547] space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-[#f0f6fc]">
                      {o.shop_name}
                    </span>
                    {o.is_real_shop ? (
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        تأییدشده
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {o.navigation?.mall_name_clean
                        ? `${o.navigation.mall_name_clean} • ${o.navigation.floor_clean || ''} ${o.navigation.unit_clean || ''}`
                        : o.navigation?.main_street || 'تهران'}
                    </span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400 block">
                    {Math.round(o.price?.amount_toman).toLocaleString('fa-IR')} تومان
                  </span>
                  {o.distance_meters !== null && (
                    <span className="text-[10px] text-slate-400">
                      {o.distance_meters < 1000
                        ? `${Math.round(o.distance_meters)} متر`
                        : `${(o.distance_meters / 1000).toFixed(1)} ک.م`}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-[#232d3d]">
                <button
                  type="button"
                  onClick={() => onSelectStore?.(o)}
                  className="flex-1 py-1 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium transition-colors text-center"
                >
                  مشاهده جزییات فروشگاه
                </button>
                {o.navigation?.is_inside_mall && o.navigation?.mall_name_clean && (
                  <button
                    type="button"
                    onClick={() => onOpenMallGuide?.(o.navigation.mall_name_clean!)}
                    className="py-1 px-2.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-medium transition-colors"
                  >
                    راهنمای پاساژ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'MallNavigationCard') {
    return (
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1a2230] border border-slate-200/80 dark:border-[#2a3547] space-y-2 animate-enter">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
          <Compass className="w-4 h-4 shrink-0" />
          <span>راهنمای پاساژ {data.mall_name || data.mall_name_clean}</span>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          {data.floor_clean && (
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400">طبقه و واحد: </span>
              <span>{data.floor_clean} {data.unit_clean ? `• واحد ${data.unit_clean}` : ''}</span>
            </div>
          )}
          {data.nearest_metro && (
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400">نزدیک‌ترین مترو: </span>
              <span>{data.nearest_metro}</span>
            </div>
          )}
          {data.parking_info && (
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400">پارکینگ: </span>
              <span>{data.parking_info}</span>
            </div>
          )}
          {data.typical_hours && (
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400">ساعت کار مجتمع: </span>
              <span>{data.typical_hours}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'BazaarHubCard') {
    return (
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 space-y-2 animate-enter">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
          <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>پیشنهاد مراجعه به بورس تخصصی تهران</span>
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

  if (type === 'InquirySimulationCard') {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2230] border border-slate-200/80 dark:border-[#2a3547] space-y-2 animate-enter">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className={`w-4 h-4 ${data.in_stock ? 'text-emerald-600' : 'text-rose-600'}`} />
            <span className={data.in_stock ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
              {data.in_stock ? 'موجود در فروشگاه' : 'عدم موجودی'}
            </span>
          </div>
          {data.confirmed_price_toman && (
            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
              قیمت تأییدشده: {Math.round(data.confirmed_price_toman).toLocaleString('fa-IR')} تومان
            </span>
          )}
        </div>
        {data.seller_message && (
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#151b24] p-2.5 rounded-xl border border-slate-200 dark:border-[#232d3d]">
            «{data.seller_message}»
          </div>
        )}
        {data.recommended_action && (
          <div className="text-[11px] text-slate-500 font-medium">
            پیشنهاد دستیار: {data.recommended_action}
          </div>
        )}
      </div>
    );
  }

  return null;
}
