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
      <div className="bg-white dark:bg-[#151b24] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-[#232d3d] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#232d3d] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-[#f0f6fc]">
                {COPY_FA.calls.modalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#2a3547] bg-slate-50 dark:bg-[#0c1017] focus:bg-white dark:focus:bg-[#111620] text-slate-900 dark:text-[#f0f6fc] transition-all outline-none"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/40">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 dark:bg-rose-600/85 dark:hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-none active:scale-95"
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
                : 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className={`w-5 h-5 ${response.in_stock ? 'text-emerald-600' : 'text-rose-600 dark:text-rose-400'}`} />
                <span className={`font-bold text-sm ${response.in_stock ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                  {response.in_stock ? COPY_FA.calls.inStock : COPY_FA.calls.outOfStock}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>{COPY_FA.calls.priceConfirmed}</span>
                  <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">
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
