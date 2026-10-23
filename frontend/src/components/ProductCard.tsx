'use client';

import React from 'react';
import { Store, Layers, Check, Info } from 'lucide-react';
import { ProductSummary } from '@/types/api';
import { COPY_FA } from '@/copy/fa';

interface ProductCardProps {
  product: ProductSummary;
  isSelectedForCompare: boolean;
  onToggleCompare: (product: ProductSummary) => void;
  onViewStores: (product: ProductSummary) => void;
  onViewDetails: (productId: string) => void;
}

export function ProductCard({
  product,
  isSelectedForCompare,
  onToggleCompare,
  onViewStores,
  onViewDetails,
}: ProductCardProps) {
  const formatPrice = (p: number | null) => {
    if (!p) return 'قیمت ثبت‌نشده (استعلام حضوری)';
    return `${Math.round(p).toLocaleString('fa-IR')} تومان`;
  };

  return (
    <div className="bg-white dark:bg-[#151b24] rounded-2xl p-4 border border-slate-200/80 dark:border-[#232d3d] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top badges: condition, category, brand */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1a2230] text-slate-700 dark:text-slate-300 border border-transparent dark:border-[#2a3547]">
            {product.category_name}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            {product.condition}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-bold text-sm text-slate-900 dark:text-[#f0f6fc] leading-snug line-clamp-2 mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
          {product.persian_title_clean}
        </h4>

        {/* Brand & Model */}
        {(product.brand_clean || product.model_clean) && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
            {product.brand_clean && (
              <span className="font-medium text-slate-700 dark:text-slate-300">
                برند: {product.brand_clean}
              </span>
            )}
            {product.model_clean && (
              <span className="truncate">
                مدل: {product.model_clean}
              </span>
            )}
          </div>
        )}

        {/* Specs summary snippet */}
        {product.specs_summary && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-3 bg-slate-50 dark:bg-[#1a2230]/60 p-1.5 rounded-lg border border-slate-100 dark:border-[#232d3d]">
            {product.specs_summary}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-[#232d3d] space-y-3">
        {/* Price & Offers count */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">
              شروع قیمت در تهران:
            </span>
            <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
              {formatPrice(product.min_price_toman)}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-slate-400" />
            {product.offers_count.toLocaleString('fa-IR')} فروشگاه
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewStores(product)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 dark:bg-rose-600/85 dark:hover:bg-rose-500 text-white text-xs font-medium transition-all shadow-none active:scale-95"
          >
            <Store className="w-3.5 h-3.5" />
            <span>فروشگاه‌های حضوری</span>
          </button>

          <button
            onClick={() => onToggleCompare(product)}
            className={`flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              isSelectedForCompare
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'border-slate-200 dark:border-[#2a3547] hover:bg-slate-50 dark:hover:bg-[#1a2230] text-slate-700 dark:text-slate-300'
            }`}
          >
            {isSelectedForCompare ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>در مقایسه</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>مقایسه</span>
              </>
            )}
          </button>
        </div>

        {/* Buying Guide trigger */}
        <button
          onClick={() => onViewDetails(product.product_id)}
          className="w-full text-center text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-center gap-1"
        >
          <Info className="w-3 h-3" />
          <span>مشخصات فنی و راهنمای خرید حضوری</span>
        </button>
      </div>
    </div>
  );
}
