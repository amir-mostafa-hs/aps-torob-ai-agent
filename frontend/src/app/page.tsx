'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Store,
  Layers,
  AlertCircle,
  Building2,
  Check,
  RefreshCw,
  X,
  CreditCard,
  Compass,
  PhoneCall,
  Clock,
  Filter,
  SearchX,
  HelpCircle
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
import { determineUIState, getSearchStatusMessage, getStoresStatusMessage } from '@/lib/progressive-states';

export default function Home() {
  // Navigation & Step state (Step 1 = Models, Step 2 = Nearby Stores)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Location state
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState('میدان ونک');
  const [userLat, setUserLat] = useState(35.7575);
  const [userLon, setUserLon] = useState(51.4099);
  const [radiusMeters, setRadiusMeters] = useState(10000);

  // Search & Products state (Step 1)
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [compareProducts, setCompareProducts] = useState<ProductSummary[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  // Selected Product & Store Offers state (Step 2)
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [storeOffers, setStoreOffers] = useState<StoreOfferItem[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [bazaarFallback, setBazaarFallback] = useState<BazaarHub | null>(null);

  // Store Filters
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'balanced'>('balanced');
  const [installmentOnly, setInstallmentOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  // Modals & Chat Drawer state
  const [activeOfferForMall, setActiveOfferForMall] = useState<StoreOfferItem | null>(null);
  const [activeOfferForInquiry, setActiveOfferForInquiry] = useState<StoreOfferItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Determine current high-level UI state for telemetry/aria
  const activeUIState = determineUIState({
    hasSearched,
    loadingProducts,
    productsCount: products.length,
    selectedProduct,
    loadingStores,
    storeOffersCount: storeOffers.length,
    hasError: !!productsError || !!storesError
  });

  // Execute product search
  const handleSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setLoadingProducts(true);
    setProductsError(null);
    setHasSearched(true);
    setCurrentStep(1);
    setSelectedProduct(null);
    setSelectedCategoryFilter('all');

    try {
      const res = await searchProducts(trimmed, undefined, undefined, 24);
      setProducts(res.items || []);
    } catch {
      setProducts([]);
      setProductsError('خطا در برقراری ارتباط با کاتالوگ ترب. لطفاً اتصال اینترنت خود را بررسی کنید.');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Reset to State A (Initial clean state)
  const handleResetSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setProducts([]);
    setProductsError(null);
    setSelectedCategoryFilter('all');
    setSelectedProduct(null);
    setCurrentStep(1);
  };

  // Select a product to view physical stores in Step 2
  const handleSelectProductForStores = async (product: ProductSummary) => {
    setSelectedProduct(product);
    setCurrentStep(2);
    setLoadingStores(true);
    setStoresError(null);
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
      setStoreOffers(res.offers || []);
      if ((!res.offers || res.offers.length === 0) && product.category_name) {
        // Fallback to bazaar recommendation for this category
        getBazaar(product.category_name).then(setBazaarFallback).catch(() => {});
      }
    } catch {
      setStoreOffers([]);
      setStoresError('خطا در دریافت لیست فروشگاه‌های فیزیکی اطراف.');
    } finally {
      setLoadingStores(false);
    }
  };

  // Re-fetch stores when filters or location change in Step 2
  useEffect(() => {
    if (currentStep === 2 && selectedProduct) {
      handleSelectProductForStores(selectedProduct);
    }
  }, [sortBy, installmentOnly, openNowOnly, userLat, userLon, radiusMeters]);

  // Handle product comparison toggle
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

  // Derived available categories from active search results for instant filtering
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category_name) cats.add(p.category_name);
    });
    return Array.from(cats);
  }, [products]);

  // Filtered products list based on selected category chip
  const displayedProducts = useMemo(() => {
    if (selectedCategoryFilter === 'all') return products;
    return products.filter((p) => p.category_name === selectedCategoryFilter);
  }, [products, selectedCategoryFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0c1017] text-slate-900 dark:text-[#f0f6fc]">
      {/* Accessible live region for status announcements */}
      <div className="sr-only" aria-live="polite">
        {loadingProducts && getSearchStatusMessage()}
        {loadingStores && getStoresStatusMessage()}
        {!loadingProducts && hasSearched && `${products.length} مدل کالا یافت شد`}
      </div>

      {/* Top Navigation */}
      <Navbar
        currentArea={currentArea}
        onOpenLocation={() => setIsLocationOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Step Indicator & Location Bar */}
        <section aria-label="مراحل فرآیند خرید حضوری" className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#232d3d] pb-3 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 pb-1 transition-all ${
                currentStep === 1
                  ? 'border-b-2 border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
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
                  ? 'border-b-2 border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-400 disabled:opacity-40 cursor-not-allowed'
              }`}
            >
              <span>{COPY_FA.steps[2]}</span>
            </button>
          </div>

          <button
            onClick={() => setIsLocationOpen(true)}
            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
            title="تغییر محدوده جغرافیایی خرید"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>شعاع {(radiusMeters / 1000).toLocaleString('fa-IR')} ک.م از {currentArea}</span>
          </button>
        </section>

        {/* STEP 1: Search & Product Discovery */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Search Container */}
            <section
              aria-label="بخش جستجوی کالا"
              className="bg-white dark:bg-[#151b24] border border-slate-200/80 dark:border-[#232d3d] rounded-3xl p-6 md:p-8 shadow-sm space-y-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/30 font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  دستیار هوشمند خرید حضوری
                </span>

                {hasSearched && (
                  <button
                    onClick={handleResetSearch}
                    className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>پاک کردن جستجو</span>
                  </button>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-black leading-tight max-w-2xl text-slate-900 dark:text-[#f0f6fc]">
                {COPY_FA.home.title}
              </h1>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                {COPY_FA.home.subtitle}
              </p>

              {/* Search Bar Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchQuery);
                }}
                className="flex items-center gap-2 bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-[#232d3d] focus-within:border-rose-500 dark:focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10 rounded-2xl p-2 shadow-sm max-w-2xl transition-all"
              >
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={COPY_FA.home.inputPlaceholder}
                  className="flex-1 text-xs md:text-sm text-slate-900 dark:text-[#f0f6fc] bg-transparent outline-none placeholder:text-slate-400"
                  aria-label="نام کالا یا نیاز خرید خود را بنویسید"
                />

                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="پاک کردن متن ورودی"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loadingProducts || !searchQuery.trim()}
                  className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-xs md:text-sm transition-all active:scale-[0.98]"
                >
                  {COPY_FA.home.sendButton}
                </button>
              </form>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  پیشنهادهای پرجستجو:
                </span>
                {COPY_FA.home.quickChips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setSearchQuery(chip.query);
                      handleSearch(chip.query);
                    }}
                    className={`py-1 px-3 rounded-full border text-xs font-medium transition-all ${
                      searchQuery === chip.query && hasSearched
                        ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1a2230] dark:hover:bg-[#232d3d] text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-[#2a3547]'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </section>

            {/* STATE A: Initial Search View (Clean, calm discovery pillars) */}
            {!hasSearched && !loadingProducts && (
              <section aria-label="راهنمای امکانات خرید حضوری" className="space-y-4 animate-enter">
                <div className="text-center py-2">
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    امکانات اختصاصی خرید حضوری در تهران
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    یک جستجوی ساده برای مدل دلخواهتان انجام دهید تا نتایج واقعی تهران را مشاهده کنید.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pillar 1 */}
                  <div className="bg-white dark:bg-[#151b24] p-5 rounded-2xl border border-slate-200/80 dark:border-[#232d3d] shadow-sm space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-900/30">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-[#f0f6fc]">
                      استعلام زنده موجودی و قیمت قطعی
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      قبل از مراجعه به پاساژ، از آخرین وضعیت موجودی کالا و قیمت قطعی فروشنده مطمئن شوید.
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div className="bg-white dark:bg-[#151b24] p-5 rounded-2xl border border-slate-200/80 dark:border-[#232d3d] shadow-sm space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/30">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-[#f0f6fc]">
                      راهنمای دقیق طبقه و واحد در پاساژ
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      یافتن آسان غرفه در مجتمع‌های تجاری بزرگ مانند علاءالدین و پایتخت با مسیریابی داخلی، نزدیک‌ترین مترو و پارکینگ.
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div className="bg-white dark:bg-[#151b24] p-5 rounded-2xl border border-slate-200/80 dark:border-[#232d3d] shadow-sm space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-900/30">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-[#f0f6fc]">
                      فیلتر خرید اقساطی و فروشگاه‌های باز
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      تفکیک فروشگاه‌های دارای پذیرش ترب‌پی، ساعات کاری روزهای عادی و جمعه‌ها بدون اتلاف وقت در ترافیک تهران.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* STATE B: Search in progress (Status acknowledgement + Lightweight Skeletons) */}
            {loadingProducts && (
              <section aria-label="در حال بارگذاری نتایج" className="space-y-4 animate-enter">
                {/* Persian status message */}
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-[#151b24] border border-slate-200/80 dark:border-[#232d3d] text-xs text-slate-700 dark:text-slate-300 shadow-sm">
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="font-medium">{getSearchStatusMessage()}</span>
                </div>

                {/* Card Skeletons matching exact product grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-[#151b24] rounded-2xl p-4 border border-slate-200/80 dark:border-[#232d3d] space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="w-20 h-5 rounded-full animate-shimmer" />
                        <div className="w-12 h-5 rounded-full animate-shimmer" />
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-4 rounded animate-shimmer" />
                        <div className="w-3/4 h-4 rounded animate-shimmer" />
                      </div>
                      <div className="w-full h-8 rounded-lg animate-shimmer" />
                      <div className="pt-2 border-t border-slate-100 dark:border-[#232d3d] flex justify-between items-end">
                        <div className="w-24 h-5 rounded animate-shimmer" />
                        <div className="w-16 h-4 rounded animate-shimmer" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-8 rounded-xl animate-shimmer" />
                        <div className="h-8 rounded-xl animate-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STATE E: Error State */}
            {productsError && !loadingProducts && (
              <section aria-label="خطا در جستجو" className="p-6 text-center bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-3 animate-enter">
                <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
                <p className="font-bold text-sm">{productsError}</p>
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
                >
                  تلاش مجدد
                </button>
              </section>
            )}

            {/* STATE C: Results Arrived (Smooth waterfall reveal, count, category filters, cards) */}
            {!loadingProducts && !productsError && hasSearched && products.length > 0 && (
              <section aria-label="نتایج مدل‌های کاتالوگ" className="space-y-4 animate-enter">
                {/* Result header & Category Filter pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      مدل‌های پیشنهادی کاتالوگ ({displayedProducts.length.toLocaleString('fa-IR')} مدل)
                    </h2>
                  </div>

                  {compareProducts.length > 0 && (
                    <button
                      onClick={() => setIsCompareModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 self-start sm:self-auto"
                    >
                      <Layers className="w-4 h-4" />
                      <span>مشاهده مقایسه ({compareProducts.length.toLocaleString('fa-IR')} کالا)</span>
                    </button>
                  )}
                </div>

                {/* In-results category quick filters */}
                {availableCategories.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                      فیلتر دسته‌بندی:
                    </span>
                    <button
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                        selectedCategoryFilter === 'all'
                          ? 'bg-rose-600 text-white dark:bg-rose-600'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1a2230] dark:hover:bg-[#232d3d] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      همه دسته‌ها ({products.length.toLocaleString('fa-IR')})
                    </button>
                    {availableCategories.map((cat) => {
                      const count = products.filter((p) => p.category_name === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                            selectedCategoryFilter === cat
                              ? 'bg-rose-600 text-white dark:bg-rose-600'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1a2230] dark:hover:bg-[#232d3d] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cat} ({count.toLocaleString('fa-IR')})
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedProducts.map((product, idx) => (
                    <div
                      key={product.product_id}
                      className={idx < 3 ? `stagger-${idx + 1}` : ''}
                    >
                      <ProductCard
                        product={product}
                        isSelectedForCompare={compareProducts.some((p) => p.product_id === product.product_id)}
                        onToggleCompare={handleToggleCompare}
                        onViewStores={handleSelectProductForStores}
                        onViewDetails={(id) => setDetailProductId(id)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STATE E: Empty Search Results */}
            {!loadingProducts && !productsError && hasSearched && products.length === 0 && (
              <section aria-label="هیچ کالایی پیدا نشد" className="p-8 text-center bg-white dark:bg-[#151b24] rounded-2xl border border-slate-200 dark:border-[#232d3d] space-y-4 animate-enter">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1a2230] flex items-center justify-center mx-auto text-slate-400">
                  <SearchX className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    کالایی با عنوان «{searchQuery}» در کاتالوگ پیدا نشد.
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    می‌توانید املای واژه را بررسی کنید، دسته‌بندی کلی‌تری مثل گوشی سامسونگ یا لپ‌تاپ را جستجو کنید، یا از دستیار هوشمند کمک بگیرید.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsChatOpen(true);
                    }}
                    className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>مشورت با دستیار هوشمند</span>
                  </button>
                  <button
                    onClick={handleResetSearch}
                    className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1a2230] dark:hover:bg-[#232d3d] text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                  >
                    پاک کردن جستجو
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* STEP 2: Physical Stores Nearby (State D Interactive Results) */}
        {currentStep === 2 && selectedProduct && (
          <div className="space-y-6 animate-enter">
            {/* Selected Product Banner */}
            <section
              aria-label="کالای انتخاب‌شده"
              className="bg-white dark:bg-[#151b24] p-4 md:p-5 rounded-2xl border border-slate-200/80 dark:border-[#232d3d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    کالای انتخابی شما
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedProduct.category_name}
                  </span>
                </div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-[#f0f6fc]">
                  {selectedProduct.persian_title_clean}
                </h2>
              </div>

              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
                <span>تغییر یا انتخاب مدل دیگر</span>
              </button>
            </section>

            {/* Filter Bar */}
            <section
              aria-label="فیلترهای فروشگاه‌های حضوری"
              className="bg-white dark:bg-[#151b24] p-3.5 rounded-2xl border border-slate-200 dark:border-[#232d3d] flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-500 dark:text-slate-400">مرتب‌سازی:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2a3547] bg-slate-50 dark:bg-[#1a2230] text-slate-800 dark:text-slate-200 font-medium outline-none"
                  aria-label="ترتیب نمایش فروشگاه‌ها"
                >
                  <option value="balanced">{COPY_FA.stores.filterLabels.sortBalanced}</option>
                  <option value="price">{COPY_FA.stores.filterLabels.sortPrice}</option>
                  <option value="distance">{COPY_FA.stores.filterLabels.sortDistance}</option>
                </select>

                {/* Installment Filter */}
                <button
                  type="button"
                  onClick={() => setInstallmentOnly(!installmentOnly)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                    installmentOnly
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-[#2a3547] hover:bg-slate-50 dark:hover:bg-[#1a2230] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {COPY_FA.stores.filterLabels.installment}
                </button>

                {/* Open Now Filter */}
                <button
                  type="button"
                  onClick={() => setOpenNowOnly(!openNowOnly)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                    openNowOnly
                      ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      : 'border-slate-200 dark:border-[#2a3547] hover:bg-slate-50 dark:hover:bg-[#1a2230] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {COPY_FA.stores.filterLabels.openNow}
                </button>
              </div>

              <div className="text-slate-500 dark:text-slate-400 font-medium">
                یافت شده: <strong className="text-rose-600 dark:text-rose-400">{storeOffers.length.toLocaleString('fa-IR')}</strong> فروشگاه
              </div>
            </section>

            {/* Store Grid or Skeletons or Empty/Bourse Fallback */}
            {loadingStores ? (
              <section aria-label="در حال بارگذاری فروشگاه‌ها" className="space-y-4 animate-enter">
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-[#151b24] border border-slate-200/80 dark:border-[#232d3d] text-xs text-slate-700 dark:text-slate-300 shadow-sm">
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="font-medium">{getStoresStatusMessage()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-[#151b24] rounded-2xl p-4 border border-slate-200/80 dark:border-[#232d3d] space-y-3"
                    >
                      <div className="w-2/3 h-5 rounded animate-shimmer" />
                      <div className="w-full h-4 rounded animate-shimmer" />
                      <div className="w-full h-12 rounded-xl animate-shimmer" />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="h-8 rounded-xl animate-shimmer" />
                        <div className="h-8 rounded-xl animate-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : storesError ? (
              <section aria-label="خطا در دریافت فروشگاه‌ها" className="p-6 text-center bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-3 animate-enter">
                <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
                <p className="font-bold text-sm">{storesError}</p>
                <button
                  onClick={() => selectedProduct && handleSelectProductForStores(selectedProduct)}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
                >
                  تلاش مجدد
                </button>
              </section>
            ) : storeOffers.length > 0 ? (
              <section aria-label="فهرست فروشگاه‌های حضوری" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {storeOffers.map((offer, idx) => (
                    <div
                      key={offer.offer_id}
                      className={idx < 3 ? `stagger-${idx + 1}` : ''}
                    >
                      <ShopCard
                        offer={offer}
                        onOpenMallGuide={(o) => setActiveOfferForMall(o)}
                        onOpenInquiry={(o) => setActiveOfferForInquiry(o)}
                      />
                    </div>
                  ))}
                </div>

                {/* Contextual Agent Follow-up Suggestions at bottom of Step 2 */}
                <div className="bg-white dark:bg-[#151b24] p-4 rounded-2xl border border-slate-200/80 dark:border-[#232d3d] space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span>سوالات تکمیلی از دستیار هوشمند ترب درباره این کالا:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      `نزدیک‌ترین مترو به فروشگاه‌های ${selectedProduct.persian_title_clean.slice(0, 20)} کجاست؟`,
                      'کدام یک از این فروشگاه‌ها طرح اقساطی ترب‌پی دارند؟',
                      'ساعات کاری این پاساژها در روزهای جمعه چطوریه؟'
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsChatOpen(true);
                        }}
                        className="py-1 px-3 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#1a2230] dark:hover:bg-[#232d3d] dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-[#2a3547] transition-colors text-right"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section aria-label="فروشگاهی پیدا نشد" className="space-y-4 animate-enter">
                <div className="p-8 text-center bg-white dark:bg-[#151b24] rounded-2xl border border-slate-200 dark:border-[#232d3d] text-xs text-slate-600 space-y-3">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {COPY_FA.stores.emptyMessage}
                  </p>
                  <p className="text-slate-400">
                    {COPY_FA.stores.emptySuggestion}
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => setRadiusMeters(20000)}
                      className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
                    >
                      افزایش شعاع جستجو به ۲۰ کیلومتر
                    </button>
                    <button
                      onClick={() => {
                        setInstallmentOnly(false);
                        setOpenNowOnly(false);
                      }}
                      className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1a2230] dark:hover:bg-[#232d3d] text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                    >
                      حذف فیلترها
                    </button>
                  </div>
                </div>

                {/* Bazaar Fallback Recommendation Card */}
                {bazaarFallback && (
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200/80 dark:border-amber-800 space-y-3 animate-enter">
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
              </section>
            )}
          </div>
        )}
      </main>

      {/* Floating Compare Dock (State D) */}
      {compareProducts.length > 0 && currentStep === 1 && (
        <aside
          aria-label="داک مقایسه مدل‌ها"
          className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-20 bg-slate-900/95 dark:bg-[#151b24]/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between animate-slide-up border border-slate-700 dark:border-[#2a3547]"
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center font-bold text-[10px]">
              {compareProducts.length.toLocaleString('fa-IR')}
            </span>
            <span>مدل انتخاب‌شده برای مقایسه</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all active:scale-[0.98]"
            >
              مشاهده مقایسه
            </button>
            <button
              onClick={() => setCompareProducts([])}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              aria-label="پاک کردن لیست مقایسه"
            >
              پاک کردن
            </button>
          </div>
        </aside>
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
