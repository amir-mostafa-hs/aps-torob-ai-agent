'use client';

import React, { useEffect, useState } from 'react';
import { X, Info, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { ProductDetail } from '@/types/api';
import { getProduct } from '@/lib/api';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  productId,
}: ProductDetailModalProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true);
      getProduct(productId)
        .then(setProduct)
        .catch(() => setProduct(null))
        .finally(() => setLoading(false));
    } else {
      setProduct(null);
    }
  }, [isOpen, productId]);

  if (!isOpen || !productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                مشخصات فنی و راهنمای خرید حضوری
              </h3>
              <p className="text-xs text-slate-500">
                بررسی نکات مهم کالا پیش از مراجعه به بازار
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

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            در حال دریافت اطلاعات کالا...
          </div>
        ) : product ? (
          <div className="space-y-4 text-xs leading-relaxed">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {product.persian_title_clean}
            </h4>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                دسته: {product.category_name}
              </span>
              <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold">
                وضعیت: {product.condition}
              </span>
              <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-semibold">
                اصالت: {product.authenticity}
              </span>
            </div>

            {/* Specs Summary */}
            {product.specs_summary && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  خلاصه مشخصات فنی:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {product.specs_summary}
                </p>
              </div>
            )}

            {/* Buying Guide */}
            {product.buying_guide && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>چک‌لیست بررسی هنگام خرید حضوری:</span>
                </h5>
                <ul className="space-y-2">
                  {product.buying_guide.in_person_buying_checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-emerald-900 dark:text-emerald-200">{item}</span>
                    </li>
                  ))}
                </ul>

                {product.buying_guide.highlights_and_pros.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      نقاط قوت مدل:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pr-1">
                      {product.buying_guide.highlights_and_pros.map((pro, idx) => (
                        <li key={idx}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            اطلاعات کالا در دسترس نیست.
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
        >
          بستن
        </button>
      </div>
    </div>
  );
}
