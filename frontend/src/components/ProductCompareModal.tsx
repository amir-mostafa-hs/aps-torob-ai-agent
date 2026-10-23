'use client';

import React from 'react';
import { X, Layers, Check, Store } from 'lucide-react';
import { ProductSummary } from '@/types/api';
import { COPY_FA } from '@/copy/fa';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductSummary[];
  onSelectProductForStores: (product: ProductSummary) => void;
}

export function ProductCompareModal({
  isOpen,
  onClose,
  products,
  onSelectProductForStores,
}: ProductCompareModalProps) {
  if (!isOpen || products.length === 0) return null;

  const formatPrice = (p: number | null) => {
    if (!p) return 'نامشخص';
    return `${Math.round(p).toLocaleString('fa-IR')} تومان`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#151b24] rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-[#232d3d] space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#232d3d] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-[#f0f6fc]">
                {COPY_FA.productCompare.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {COPY_FA.productCompare.subtitle}
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

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#232d3d]">
                <th className="p-3 bg-slate-50 dark:bg-[#1a2230]/50 font-bold text-slate-500 dark:text-slate-400 w-36">
                  معیار مقایسه
                </th>
                {products.map((p) => (
                  <th key={p.product_id} className="p-3 font-bold text-slate-900 dark:text-[#f0f6fc] min-w-[200px]">
                    <div className="line-clamp-2 mb-2">{p.persian_title_clean}</div>
                    <button
                      onClick={() => {
                        onSelectProductForStores(p);
                        onClose();
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 dark:bg-rose-600/85 dark:hover:bg-rose-500 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1 shadow-none"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>دیدن فروشگاه‌ها</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#232d3d]">
              <tr>
                <td className="p-3 bg-slate-50/60 dark:bg-[#1a2230]/30 font-semibold text-slate-600 dark:text-slate-400">
                  {COPY_FA.productCompare.rows.priceRange}
                </td>
                {products.map((p) => (
                  <td key={p.product_id} className="p-3 font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                    {formatPrice(p.min_price_toman)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 bg-slate-50/60 dark:bg-slate-800/30 font-semibold text-slate-600 dark:text-slate-400">
                  {COPY_FA.productCompare.rows.brand}
                </td>
                {products.map((p) => (
                  <td key={p.product_id} className="p-3 text-slate-700 dark:text-slate-300">
                    {p.brand_clean || 'نامشخص'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 bg-slate-50/60 dark:bg-slate-800/30 font-semibold text-slate-600 dark:text-slate-400">
                  {COPY_FA.productCompare.rows.condition}
                </td>
                {products.map((p) => (
                  <td key={p.product_id} className="p-3 font-medium text-emerald-700 dark:text-emerald-400">
                    {p.condition}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 bg-slate-50/60 dark:bg-slate-800/30 font-semibold text-slate-600 dark:text-slate-400">
                  {COPY_FA.productCompare.rows.authenticity}
                </td>
                {products.map((p) => (
                  <td key={p.product_id} className="p-3 text-slate-600 dark:text-slate-400">
                    {p.authenticity}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 bg-slate-50/60 dark:bg-slate-800/30 font-semibold text-slate-600 dark:text-slate-400">
                  {COPY_FA.productCompare.rows.specs}
                </td>
                {products.map((p) => (
                  <td key={p.product_id} className="p-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.specs_summary || 'ثبت نشده'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
        >
          {COPY_FA.productCompare.closeBtn}
        </button>
      </div>
    </div>
  );
}
