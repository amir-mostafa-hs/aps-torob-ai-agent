'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Sparkles, SlidersHorizontal, ArrowRight,
  Store, Layers, AlertCircle, Building2, Check, RefreshCw
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { LocationModal } from '@/components/LocationModal';
import { ProductCard } from '@/components/ProductCard';
import { ShopCard } from '@/components/ShopCard';
import { ProductCompareModal } from '@/components/ProductCompareModal';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { MallNavigationModal } from '@/components/MallNavigationModal';
import { InquiryModal } from '@/components/InquiryModal';
import { AgentChatDrawer } from '@/components/AgentChatDrawer';
import { searchProducts, getProductShops, getBazaar, StoreFilterParams } from '@/lib/api';
import { ProductSummary, StoreOfferItem, BazaarHub } from '@/types/api';
import { COPY_FA } from '@/copy/fa';

export default function Home() {
  // Navigation & Step state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Location state
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState('میدان ونک');
  const [userLat, setUserLat] = useState(35.7575);
  const [userLon, setUserLon] = useState(51.4099);
  const [radiusMeters, setRadiusMeters] = useState(10000);

  // Search & Products state (Step 1)
  const [searchQuery, setSearchQuery] = useState('سامسونگ');
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [compareProducts, setCompareProducts] = useState<ProductSummary[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  // Selected Product & Store Offers state (Step 2)
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [storeOffers, setStoreOffers] = useState<StoreOfferItem[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [bazaarFallback, setBazaarFallback] = useState<BazaarHub | null>(null);

  // Store Filters
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'balanced'>('balanced');
  const [installmentOnly, setInstallmentOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  // Modals & Chat Drawer state
  const [activeOfferForMall, setActiveOfferForMall] = useState<StoreOfferItem | null>(null);
  const [activeOfferForInquiry, setActiveOfferForInquiry] = useState<StoreOfferItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initial search on mount
  useEffect(() => {
    handleSearch('سامسونگ');
  }, []);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoadingProducts(true);
    setCurrentStep(1);
    try {
      const res = await searchProducts(q, undefined, undefined, 24);
      setProducts(res.items);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSelectProductForStores = async (product: ProductSummary) => {
    setSelectedProduct(product);
    setCurrentStep(2);
    setLoadingStores(true);
    setBazaarFallback(null);

    const filterParams: StoreFilterParams = {
      user_lat: userLat,
      user_lon: userLon,
      max_radius_meters: radiusMeters,
      installment_only: installmentOnly,
      open_now: openNowOnly,
      sort_by: sortBy
    };

    try {
      const res = await getProductShops(product.product_id, filterParams);
      setStoreOffers(res.offers);
      if (res.offers.length === 0 && product.category_name) {
        // Fallback to bazaar recommendation
        getBazaar(product.category_name).then(setBazaarFallback).catch(() => {});
      }
    } catch {
      setStoreOffers([]);
    } finally {
      setLoadingStores(false);
    }
  };

  // Re-fetch stores when filters change in Step 2
  useEffect(() => {
    if (currentStep === 2 && selectedProduct) {
      handleSelectProductForStores(selectedProduct);
    }
  }, [sortBy, installmentOnly, openNowOnly, userLat, userLon, radiusMeters]);

  const handleToggleCompare = (product: ProductSummary) => {
    setCompareProducts((prev) => {
      const exists = prev.some((p) => p.product_id === product.product_id);
      if (exists) {
        return prev.filter((p) => p.product_id !== product.product_id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <Navbar
        currentArea={currentArea}
        onOpenLocation={() => setIsLocationOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 pb-1 transition-all ${
                currentStep === 1
                  ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{COPY_FA.steps[1]}</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <button
              disabled={!selectedProduct}
              onClick={() => selectedProduct && setCurrentStep(2)}
              className={`flex items-center gap-1.5 pb-1 transition-all ${
                currentStep === 2
                  ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400 font-bold'
                  : 'text-slate-400 disabled:opacity-40'
              }`}
            >
              <span>{COPY_FA.steps[2]}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>شعاع {radiusMeters / 1000} کیلومتری {currentArea}</span>
          </div>
        </div>

        {/* STEP 1: Search & Product Discovery */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Search Banner */}
            <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-red-600/10 space-y-4">
              <h1 className="text-xl md:text-2xl font-black leading-tight max-w-2xl">
                {COPY_FA.home.title}
              </h1>
              <p className="text-xs md:text-sm text-red-100 max-w-xl leading-relaxed">
                {COPY_FA.home.subtitle}
              </p>

              {/* Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchQuery);
                }}
                className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-lg max-w-2xl"
              >
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={COPY_FA.home.inputPlaceholder}
                  className="flex-1 text-xs md:text-sm text-slate-900 dark:text-white bg-transparent outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs md:text-sm transition-all shadow-md active:scale-95"
                >
                  {COPY_FA.home.sendButton}
                </button>
              </form>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                {COPY_FA.home.quickChips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setSearchQuery(chip.query);
                      handleSearch(chip.query);
                    }}
                    className="py-1 px-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-medium transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  مدل‌های پیشنهادی کاتالوگ ({products.length} مورد)
                </h3>
                {compareProducts.length > 0 && (
                  <button
                    onClick={() => setIsCompareModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Layers className="w-4 h-4" />
                    <span>مشاهده مقایسه ({compareProducts.length} کالا)</span>
                  </button>
                )}
              </div>

              {loadingProducts ? (
                <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
                  <span>در حال جستجوی کاتالوگ و استخراج بهترین گزینه‌ها...</span>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                      isSelectedForCompare={compareProducts.some((p) => p.product_id === product.product_id)}
                      onToggleCompare={handleToggleCompare}
                      onViewStores={handleSelectProductForStores}
                      onViewDetails={(id) => setDetailProductId(id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  کالایی با این عنوان در کاتالوگ پیدا نشد. می‌توانید با دستیار هوشمند مشورت کنید.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Physical Stores Nearby */}
        {currentStep === 2 && selectedProduct && (
          <div className="space-y-6 animate-fade-in">
            {/* Selected Product Banner */}
            <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                    کالای انتخابی شما
                  </span>
                  <span className="text-xs text-slate-500">{selectedProduct.category_name}</span>
                </div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {selectedProduct.persian_title_clean}
                </h2>
              </div>

              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
                <span>تغییر یا انتخاب مدل دیگر</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-500">مرتب‌سازی:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium outline-none"
                >
                  <option value="balanced">{COPY_FA.stores.filterLabels.sortBalanced}</option>
                  <option value="price">{COPY_FA.stores.filterLabels.sortPrice}</option>
                  <option value="distance">{COPY_FA.stores.filterLabels.sortDistance}</option>
                </select>

                {/* Installment Filter */}
                <button
                  onClick={() => setInstallmentOnly(!installmentOnly)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                    installmentOnly
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {COPY_FA.stores.filterLabels.installment}
                </button>

                {/* Open Now Filter */}
                <button
                  onClick={() => setOpenNowOnly(!openNowOnly)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                    openNowOnly
                      ? 'bg-red-50 border-red-600 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {COPY_FA.stores.filterLabels.openNow}
                </button>
              </div>

              <div className="text-slate-500 font-medium">
                یافت شده: <strong className="text-red-600">{storeOffers.length}</strong> فروشگاه
              </div>
            </div>

            {/* Store Grid */}
            {loadingStores ? (
              <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
                <span>در حال پیدا کردن فروشگاه‌های باز و محاسبه دقیق فاصله‌ها...</span>
              </div>
            ) : storeOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeOffers.map((offer) => (
                  <ShopCard
                    key={offer.offer_id}
                    offer={offer}
                    onOpenMallGuide={(o) => setActiveOfferForMall(o)}
                    onOpenInquiry={(o) => setActiveOfferForInquiry(o)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 space-y-2">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {COPY_FA.stores.emptyMessage}
                  </p>
                  <p className="text-slate-400">
                    {COPY_FA.stores.emptySuggestion}
                  </p>
                </div>

                {/* Bazaar Fallback Card */}
                {bazaarFallback && (
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200/80 dark:border-amber-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                      <Building2 className="w-5 h-5 text-amber-600" />
                      <span>{COPY_FA.bourseHint.title}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {bazaarFallback.agent_recommendation_text}
                    </p>
                    <div className="text-[11px] text-slate-500 font-medium">
                      قطب‌های اصلی: {bazaarFallback.top_neighborhoods || bazaarFallback.top_malls}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Compare Bar */}
      {compareProducts.length > 0 && currentStep === 1 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-20 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between animate-slide-up border border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center font-bold text-[10px]">
              {compareProducts.length}
            </span>
            <span>مدل انتخاب‌شده برای مقایسه</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-sm"
            >
              مشاهده مقایسه
            </button>
            <button
              onClick={() => setCompareProducts([])}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              پاک کردن
            </button>
          </div>
        </div>
      )}

      {/* Modals & AI Assistant Drawer */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentArea={currentArea}
        currentRadius={radiusMeters}
        onSelectLocation={(area, lat, lon, r) => {
          setCurrentArea(area);
          setUserLat(lat);
          setUserLon(lon);
          setRadiusMeters(r);
        }}
      />

      <ProductCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={compareProducts}
        onSelectProductForStores={handleSelectProductForStores}
      />

      <ProductDetailModal
        isOpen={detailProductId !== null}
        onClose={() => setDetailProductId(null)}
        productId={detailProductId}
      />

      <MallNavigationModal
        isOpen={activeOfferForMall !== null}
        onClose={() => setActiveOfferForMall(null)}
        offer={activeOfferForMall}
      />

      <InquiryModal
        isOpen={activeOfferForInquiry !== null}
        onClose={() => setActiveOfferForInquiry(null)}
        offer={activeOfferForInquiry}
      />

      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentArea={currentArea}
        userLat={userLat}
        userLon={userLon}
        onSelectProduct={(p) => {
          handleSelectProductForStores(p);
        }}
        onSelectStore={(o) => {
          setActiveOfferForMall(o);
        }}
      />
    </div>
  );
}
