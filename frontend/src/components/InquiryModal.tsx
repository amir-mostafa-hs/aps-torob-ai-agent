'use client';

import React, { useState } from 'react';
import { X, PhoneCall, CheckCircle2, AlertTriangle, Send, Store } from 'lucide-react';
import { StoreOfferItem, InquiryResponse } from '@/types/api';
import { simulateInquiry } from '@/lib/api';
import { COPY_FA } from '@/copy/fa';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: StoreOfferItem | null;
}

export function InquiryModal({
  isOpen,
  onClose,
  offer,
}: InquiryModalProps) {
  const [userNote, setUserNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<InquiryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !offer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await simulateInquiry(offer.offer_id, userNote);
      setResponse(res);
    } catch (err: any) {
      setError(err?.message || 'خطا در شبیه‌سازی استعلام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {COPY_FA.calls.modalTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {offer.shop_name}
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

        {/* Disclaimer Badge */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>{COPY_FA.calls.simulationNotice}</span>
        </div>

        {/* Form or Result */}
        {!response ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                یادداشت یا زمان تقریبی مراجعه:
              </label>
              <textarea
                rows={3}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder={COPY_FA.calls.userNotePlaceholder}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'در حال شبیه‌سازی ارتباط...' : COPY_FA.calls.startInquiryBtn}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Status Card */}
            <div className={`p-4 rounded-2xl border ${
              response.in_stock
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className={`w-5 h-5 ${response.in_stock ? 'text-emerald-600' : 'text-red-600'}`} />
                <span className={`font-bold text-sm ${response.in_stock ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                  {response.in_stock ? COPY_FA.calls.inStock : COPY_FA.calls.outOfStock}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>{COPY_FA.calls.priceConfirmed}</span>
                  <span className="font-extrabold text-sm text-red-600">
                    {Math.round(response.confirmed_price_toman).toLocaleString('fa-IR')} تومان
                  </span>
                </div>

                {response.price_changed && (
                  <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    {COPY_FA.calls.priceChangedWarning}
                  </div>
                )}
              </div>
            </div>

            {/* Simulated seller dialogue */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs leading-relaxed space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                {COPY_FA.calls.sellerReplyLabel}
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                «{response.seller_message}»
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-500">{COPY_FA.calls.recommendedAction}</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {response.recommended_action}
              </span>
            </div>

            <button
              onClick={() => setResponse(null)}
              className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              استعلام جدید
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs transition-colors"
        >
          {COPY_FA.calls.closeBtn}
        </button>
      </div>
    </div>
  );
}
