'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  Send,
  MapPin,
  Clock,
  Compass,
  Store,
  ShieldCheck,
  CreditCard,
  Navigation,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { LocationModal } from '@/components/LocationModal';
import { MallNavigationModal } from '@/components/MallNavigationModal';
import { InquiryModal } from '@/components/InquiryModal';
import { GenerativeUIRenderer } from '@/components/GenerativeUIRenderer';
import { AgentReasoningBox, ReasoningStep } from '@/components/AgentReasoningBox';
import { streamAgentChat, searchProducts, getProductShops, simulateInquiry, getBazaar } from '@/lib/api';
import { isMapOrNavigationIntent, isStoreFilterIntent, isGibberishOrNonsense } from '@/lib/intents';
import { ProductSummary, StoreOfferItem } from '@/types/api';
import { COPY_FA } from '@/copy/fa';

interface ChatTurn {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  reasoningSteps?: ReasoningStep[];
  isStreaming?: boolean;
  uiBlocks?: { type: string; data: any }[];
  followUpChips?: string[];
}

export default function Home() {
  // Location state
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState('میدان ونک');
  const [userLat, setUserLat] = useState(35.7575);
  const [userLon, setUserLon] = useState(51.4099);

  // Conversational state
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Modals state
  const [activeOfferForMall, setActiveOfferForMall] = useState<StoreOfferItem | null>(null);
  const [activeOfferForInquiry, setActiveOfferForInquiry] = useState<StoreOfferItem | null>(null);
  const [mallNameForModal, setMallNameForModal] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persistent anonymous session ID for this browser tab
  const sessionIdRef = useRef<string>('sess_init');

  // Track conversational context for buttons, map and shop filters
  const lastProductIdRef = useRef<string | null>(null);
  const lastProductTitleRef = useRef<string | null>(null);
  const lastProductCategoryRef = useRef<string | null>(null);
  const lastOffersRef = useRef<StoreOfferItem[]>([]);
  const lastActiveOfferRef = useRef<StoreOfferItem | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('torob_session_id');
      if (saved) {
        sessionIdRef.current = saved;
      } else {
        const fresh = `sess_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('torob_session_id', fresh);
        sessionIdRef.current = fresh;
      }
    }
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Focus input when entering chat mode
  useEffect(() => {
    if (messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [messages.length]);

  // Reset conversation to initial hero
  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setIsStreaming(false);
  };

  // Main chat submission handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    setInput('');

    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `asst_${Date.now()}`;

    // 1. GIBBERISH / NONSENSE INTERCEPTION
    if (isGibberishOrNonsense(text)) {
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, sender: 'user', text },
        {
          id: assistantMsgId,
          sender: 'assistant',
          text: `کالایی با عنوان «${text}» در کاتالوگ فروشگاه‌های ترب یافت نشد.\n\nلطفاً نام یا دسته‌بندی کالای مورد نظرتان (مثلاً: لپ‌تاپ لنوو، گوشی سامسونگ، کتونی، شارژر...) را بنویسید تا بتوانم موجودی و قیمت مغازه‌های تهران را برایتان بررسی کنم.`,
          isStreaming: false,
          reasoningSteps: [
            { text: `بررسی متن درخواست: «${text}»`, status: 'done' },
            { text: 'بررسی کاتالوگ کالاهای ترب تهران', status: 'done' }
          ],
          uiBlocks: [],
          followUpChips: [
            'لپ‌تاپ سبک دانشجویی',
            'گوشی سامسونگ اقساطی',
            'کتونی پیاده‌روی تا ۳ میلیون',
            'شارژر اورجینال لپ‌تاپ'
          ]
        }
      ]);
      return;
    }

    // 2. MAP / NAVIGATION INTENT INTERCEPTION
    if (isMapOrNavigationIntent(text)) {
      const targetOffer = lastActiveOfferRef.current || (lastOffersRef.current.length > 0 ? lastOffersRef.current[0] : null);
      
      let mapBlock: { type: string; data: any };
      let mapText = '';

      if (targetOffer) {
        mapBlock = {
          type: 'InteractiveMapCard',
          data: {
            lat: targetOffer.lat,
            lon: targetOffer.lon,
            title: targetOffer.shop_name,
            subtitle: targetOffer.navigation?.floor_clean ? `${targetOffer.navigation.floor_clean} ${targetOffer.navigation.unit_clean ? 'واحد ' + targetOffer.navigation.unit_clean : ''}` : undefined,
            address: targetOffer.navigation?.main_street || targetOffer.navigation?.mall_name_clean || 'تهران',
            mall_name: targetOffer.navigation?.mall_name_clean || undefined,
            distance_meters: targetOffer.distance_meters
          }
        };
        mapText = `موقعیت جغرافیایی «${targetOffer.shop_name}» روی نقشه تعاملی مشخص شد. برای مسیریابی مستقیم می‌توانید از دکمه‌های نشان، بلد یا گوگل مپ استفاده کنید:`;
      } else {
        // Center on Tehran Charsou / Alaeddin central electronic & retail hub
        mapBlock = {
          type: 'InteractiveMapCard',
          data: {
            lat: 35.6957,
            lon: 51.4113,
            title: 'بورس و مراکز خرید تقاطع جمهوری و حافظ (بازار چارسو و پاساژ علاءالدین)',
            subtitle: 'قطب اصلی خرید حضوری لوازم الکترونیکی و دیجیتال در تهران',
            address: 'تهران، خیابان جمهوری، تقاطع پل حافظ',
            mall_name: 'بازار چارسو'
          }
        };
        mapText = 'موقعیت مراکز خرید اصلی تهران روی نقشه تعاملی مشخص شد. با انتخاب هر کالا می‌توانید موقعیت دقیق مغازه مربوطه را ببینید:';
      }

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, sender: 'user', text },
        {
          id: assistantMsgId,
          sender: 'assistant',
          text: mapText,
          isStreaming: false,
          reasoningSteps: [
            { text: 'بررسی موقعیت جغرافیایی و راه‌های دسترسی', status: 'done' },
            { text: 'آماده‌سازی نقشه تعاملی و لینک‌های مسیریابی نشان، بلد و گوگل‌مپ', status: 'done' }
          ],
          uiBlocks: [mapBlock],
          followUpChips: targetOffer
            ? ['راهنمای داخل پاساژ', 'استعلام موجودی قطعی', 'فروشگاه‌های دیگر']
            : ['لپ‌تاپ سبک دانشجویی', 'گوشی سامسونگ اقساطی', 'کتونی پیاده‌روی']
        }
      ]);
      return;
    }

    // 3. STORE FILTER CHIP INTENT INTERCEPTION
    const filterInfo = isStoreFilterIntent(text);
    if (filterInfo.isFilter) {
      if (lastProductIdRef.current) {
        setMessages((prev) => [
          ...prev,
          { id: userMsgId, sender: 'user', text },
          {
            id: assistantMsgId,
            sender: 'assistant',
            text: '',
            isStreaming: true,
            reasoningSteps: [
              { text: `اعمال فیلتر: «${text}» بر روی فروشگاه‌ها`, status: 'running' }
            ],
            uiBlocks: []
          }
        ]);
        setIsStreaming(true);

        try {
          const res = await getProductShops(lastProductIdRef.current, {
            user_lat: userLat,
            user_lon: userLon,
            open_now: filterInfo.openNow,
            installment_only: filterInfo.installmentOnly,
            sort_by: filterInfo.sortBy || 'balanced'
          });
          const offers = res.offers || [];

          if (offers.length > 0) {
            lastOffersRef.current = offers;
            lastActiveOfferRef.current = offers[0];

            setMessages((prev) =>
              prev.map((turn) =>
                turn.id === assistantMsgId
                  ? {
                      ...turn,
                      isStreaming: false,
                      reasoningSteps: [
                        { text: `اعمال فیلتر: «${text}»`, status: 'done' },
                        { text: `یافتن ${offers.length.toLocaleString('fa-IR')} فروشگاه مطابق با این شرایط`, status: 'done' }
                      ],
                      text: `تعداد ${offers.length.toLocaleString('fa-IR')} فروشگاه دارای این کالا مطابق با شرایط «${text}» در تهران آماده است:`,
                      uiBlocks: [{ type: 'ShopCardList', data: { offers } }],
                      followUpChips: ['مشاهده روی نقشه', 'استعلام موجودی قطعی']
                    }
                  : turn
              )
            );
          } else {
            // 0 offers with this filter! Recommend Bazaar Hub in Tehran!
            let bazaarData: any = null;
            try {
              bazaarData = await getBazaar(lastProductCategoryRef.current || 'لپ تاپ و نوت بوک');
            } catch {
              // fallback
            }

            const uiBlocks: { type: string; data: any }[] = [];
            if (bazaarData) {
              uiBlocks.push({ type: 'BazaarHubCard', data: bazaarData });
            }

            setMessages((prev) =>
              prev.map((turn) =>
                turn.id === assistantMsgId
                  ? {
                      ...turn,
                      isStreaming: false,
                      reasoningSteps: [
                        { text: `بررسی شرایط «${text}» در فروشگاه‌های تهران`, status: 'done' },
                        { text: 'بررسی بورس و بازار متمرکز کالا در تهران', status: 'done' }
                      ],
                      text: `در حال حاضر هیچ فروشگاه فیزیکی ثبت‌شده‌ای با شرایط «${text}» برای این مدل باز یا دارای موجودی قطعی نیست؛ اما بورس اصلی این دسته کالا در تهران روی کارت و نقشه زیر مشخص شد تا بتوانید حضوری مراجعه فرمایید:`,
                      uiBlocks,
                      followUpChips: ['مشاهده همه فروشگاه‌ها بدون فیلتر', 'مشاهده روی نقشه']
                    }
                  : turn
              )
            );
          }
        } catch {
          setMessages((prev) =>
            prev.map((turn) =>
              turn.id === assistantMsgId
                ? { ...turn, isStreaming: false, text: 'خطا در فیلتر فروشگاه‌ها. لطفاً دوباره تلاش کنید.' }
                : turn
            )
          );
        } finally {
          setIsStreaming(false);
        }
        return;
      } else {
        setMessages((prev) => [
          ...prev,
          { id: userMsgId, sender: 'user', text },
          {
            id: assistantMsgId,
            sender: 'assistant',
            text: `لطفاً ابتدا نام یا مدل کالای مورد نظرتان را جستجو کنید تا بتوانم فروشگاه‌های فیزیکی تهران را بر اساس «${text}» برایتان فیلتر کنم.`,
            isStreaming: false,
            reasoningSteps: [
              { text: `بررسی فیلتر «${text}»`, status: 'done' }
            ],
            uiBlocks: [],
            followUpChips: [
              'لپ‌تاپ سبک دانشجویی',
              'گوشی سامسونگ اقساطی',
              'کتونی پیاده‌روی تا ۳ میلیون',
              'شارژر اورجینال لپ‌تاپ'
            ]
          }
        ]);
        return;
      }
    }

    // 4. REGULAR CONVERSATION & PRODUCT SEARCH
    // Add user message and assistant placeholder turn
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text,
      },
      {
        id: assistantMsgId,
        sender: 'assistant',
        text: '',
        isStreaming: true,
        reasoningSteps: [
          { text: `بررسی متن درخواست: «${text}»`, status: 'running' }
        ],
        uiBlocks: [],
        followUpChips: []
      }
    ]);

    setIsStreaming(true);

    try {
      let receivedAnyStreamEvent = false;
      let receivedUIBlock = false;

      // Try streaming from agent service
      await streamAgentChat(
        sessionIdRef.current,
        text,
        { user_lat: userLat, user_lon: userLon, area_name: currentArea },
        (event, data) => {
          receivedAnyStreamEvent = true;
          setMessages((prev) =>
            prev.map((turn) => {
              if (turn.id !== assistantMsgId) return turn;

              if (event === 'thinking') {
                const currentSteps = turn.reasoningSteps || [];
                const updated: ReasoningStep[] = currentSteps.map((s) => ({ ...s, status: 'done' }));
                updated.push({ text: data.step || 'در حال بررسی کاتالوگ و فروشگاه‌ها...', status: 'running' });
                return { ...turn, reasoningSteps: updated };
              } else if (event === 'tool_start') {
                const currentSteps = turn.reasoningSteps || [];
                const stepName =
                  data.tool === 'search_products'
                    ? 'جستجو در کاتالوگ کالاهای ترب'
                    : data.tool === 'find_shops'
                    ? `یافتن فروشگاه‌های فیزیکی در محدوده ${currentArea}`
                    : data.tool === 'simulate_inquiry'
                    ? 'استعلام موجودی و قیمت قطعی از فروشگاه'
                    : data.tool === 'get_mall_navigation'
                    ? 'دریافت راهنمای داخل پاساژ و طبقات'
                    : `اجرای ابزار ${data.tool}`;

                const updated: ReasoningStep[] = currentSteps.map((s) => ({ ...s, status: 'done' }));
                updated.push({ text: stepName, status: 'running' });
                return { ...turn, reasoningSteps: updated };
              } else if (event === 'tool_done') {
                const currentSteps = turn.reasoningSteps || [];
                return {
                  ...turn,
                  reasoningSteps: currentSteps.map((s) => ({ ...s, status: 'done' }))
                };
              } else if (event === 'ui_block') {
                receivedUIBlock = true;
                const existingBlocks = turn.uiBlocks || [];
                return {
                  ...turn,
                  uiBlocks: [...existingBlocks, data]
                };
              } else if (event === 'message') {
                return {
                  ...turn,
                  text: (turn.text || '') + (data.delta || '')
                };
              } else if (event === 'done') {
                return {
                  ...turn,
                  isStreaming: false,
                  reasoningSteps: (turn.reasoningSteps || []).map((s) => ({ ...s, status: 'done' as const })),
                  followUpChips: [
                    'فقط فروشگاه‌های باز الان',
                    'امکان خرید اقساطی',
                    'نزدیک‌ترین فروشگاه‌ها',
                    'مشاهده روی نقشه'
                  ]
                };
              }
              return turn;
            })
          );
        }
      );

      // GUARANTEE: If the backend did not emit any ui_block (e.g. LLM didn't call tool or FTS matched 0),
      // proactively search products with cleaned keywords and inject ProductCardList!
      if (!receivedUIBlock) {
        try {
          const searchRes = await searchProducts(text, undefined, undefined, 4);
          if (searchRes.items && searchRes.items.length > 0) {
            lastProductIdRef.current = searchRes.items[0].product_id;
            lastProductTitleRef.current = searchRes.items[0].persian_title_clean;
            lastProductCategoryRef.current = searchRes.items[0].category_name;

            setMessages((prev) =>
              prev.map((turn) =>
                turn.id === assistantMsgId
                  ? {
                      ...turn,
                      uiBlocks: [
                        ...(turn.uiBlocks || []),
                        {
                          type: 'ProductCardList',
                          data: { products: searchRes.items }
                        }
                      ]
                    }
                  : turn
              )
            );
          } else {
            // 0 products found: tell the user clearly instead of leaving them empty
            setMessages((prev) =>
              prev.map((turn) =>
                turn.id === assistantMsgId
                  ? {
                      ...turn,
                      text: turn.text || `کالایی مطابق با «${text}» در کاتالوگ فروشگاه‌های ترب تهران پیدا نشد. می‌توانید با کلمات کلی‌تر یا برند دیگری جستجو فرمایید:`,
                      followUpChips: [
                        'لپ‌تاپ سبک دانشجویی',
                        'گوشی سامسونگ اقساطی',
                        'کتونی پیاده‌روی تا ۳ میلیون',
                        'شارژر اورجینال لپ‌تاپ'
                      ]
                    }
                  : turn
              )
            );
          }
        } catch (searchErr) {
          console.warn('Auto-inject product cards failed:', searchErr);
        }
      }

      // If finished cleanly, mark isStreaming false
      setMessages((prev) =>
        prev.map((turn) =>
          turn.id === assistantMsgId
            ? {
                ...turn,
                isStreaming: false,
                reasoningSteps: (turn.reasoningSteps || []).map((s) => ({ ...s, status: 'done' as const })),
                followUpChips: turn.followUpChips?.length
                  ? turn.followUpChips
                  : ['فقط فروشگاه‌های باز الان', 'امکان خرید اقساطی', 'نزدیک‌ترین فروشگاه‌ها']
              }
            : turn
        )
      );
    } catch (err: any) {
      // Deterministic Offline fallback to ensure 100% reliable functionality
      console.warn('Agent stream fallback triggered:', err);
      try {
        const searchRes = await searchProducts(text, undefined, undefined, 4);
        const products = searchRes.items || [];

        let shopOffers: StoreOfferItem[] = [];
        if (products.length > 0) {
          lastProductIdRef.current = products[0].product_id;
          lastProductTitleRef.current = products[0].persian_title_clean;
          lastProductCategoryRef.current = products[0].category_name;

          const shopsRes = await getProductShops(products[0].product_id, {
            user_lat: userLat,
            user_lon: userLon,
            sort_by: 'balanced'
          });
          shopOffers = shopsRes.offers || [];
          if (shopOffers.length > 0) {
            lastOffersRef.current = shopOffers;
            lastActiveOfferRef.current = shopOffers[0];
          }
        }

        const uiBlocks: { type: string; data: any }[] = [];
        if (products.length > 0) {
          uiBlocks.push({
            type: 'ProductCardList',
            data: { products }
          });
        }
        if (shopOffers.length > 0) {
          uiBlocks.push({
            type: 'ShopCardList',
            data: { offers: shopOffers }
          });
        }

        setMessages((prev) =>
          prev.map((turn) =>
            turn.id === assistantMsgId
              ? {
                  ...turn,
                  isStreaming: false,
                  reasoningSteps: [
                    { text: 'بررسی کاتالوگ کالاهای ترب', status: 'done' },
                    { text: `یافتن فروشگاه‌های فیزیکی نزدیک در ${currentArea}`, status: 'done' },
                    { text: 'بررسی موجودی و ساعات کاری', status: 'done' }
                  ],
                  text:
                    products.length > 0
                      ? `مدل‌های پیشنهادی متناسب با «${text}» و فروشگاه‌های فیزیکی نزدیک در محدوده ${currentArea} برای شما آماده شد:`
                      : `متأسفانه برای عبارت «${text}» کالای فعالی در کاتالوگ یافت نشد. می‌توانید با کلمات ساده‌تر مانند «لپ‌تاپ» یا «کتونی» جستجو کنید.`,
                  uiBlocks,
                  followUpChips: [
                    'فقط فروشگاه‌های باز الان',
                    'امکان خرید اقساطی',
                    'نزدیک‌ترین فروشگاه‌ها'
                  ]
                }
              : turn
          )
        );
      } catch (fallbackErr) {
        setMessages((prev) =>
          prev.map((turn) =>
            turn.id === assistantMsgId
              ? {
                  ...turn,
                  isStreaming: false,
                  text: 'متأسفانه در اتصال موقتی مشکلی پیش آمد. لطفاً دوباره تلاش کنید.'
                }
              : turn
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  // When user clicks "فروشگاه‌های حضوری" on a product card
  const handleRequestShops = async (productId: string, productTitle: string) => {
    lastProductIdRef.current = productId;
    lastProductTitleRef.current = productTitle;

    const userPrompt = `فروشگاه‌های حضوری دارای «${productTitle}»`;
    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `asst_${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: userPrompt },
      {
        id: assistantMsgId,
        sender: 'assistant',
        text: '',
        isStreaming: true,
        reasoningSteps: [
          { text: `استعلام فروشگاه‌های حضوری برای ${productTitle}`, status: 'running' }
        ],
        uiBlocks: []
      }
    ]);

    setIsStreaming(true);

    try {
      const res = await getProductShops(productId, {
        user_lat: userLat,
        user_lon: userLon,
        sort_by: 'balanced'
      });
      const offers = res.offers || [];

      if (offers.length > 0) {
        lastOffersRef.current = offers;
        lastActiveOfferRef.current = offers[0];

        setMessages((prev) =>
          prev.map((turn) =>
            turn.id === assistantMsgId
              ? {
                  ...turn,
                  isStreaming: false,
                  reasoningSteps: [
                    { text: 'بررسی کاتالوگ فروشندگان ترب', status: 'done' },
                    { text: `محاسبه فاصله جغرافیایی از ${currentArea}`, status: 'done' },
                    { text: 'فیلتر موجودی و شرایط فروش', status: 'done' }
                  ],
                  text: `تعداد ${offers.length.toLocaleString('fa-IR')} فروشگاه فیزیکی باز در تهران برای این مدل یافت شد. می‌توانید جزییات، راهنمای پاساژ یا موقعیت روی نقشه را مشاهده کنید:`,
                  uiBlocks: [{ type: 'ShopCardList', data: { offers } }],
                  followUpChips: ['استعلام موجودی قطعی', 'فقط فروشگاه‌های اقساطی', 'مشاهده روی نقشه']
                }
              : turn
          )
        );
      } else {
        // 0 store offers for this specific model: query Bazaar Hub for category!
        let bazaarData: any = null;
        try {
          const category = lastProductCategoryRef.current || 'لپ تاپ و نوت بوک';
          bazaarData = await getBazaar(category);
        } catch {
          // fallback
        }

        const uiBlocks: { type: string; data: any }[] = [];
        if (bazaarData) {
          uiBlocks.push({ type: 'BazaarHubCard', data: bazaarData });
        }

        setMessages((prev) =>
          prev.map((turn) =>
            turn.id === assistantMsgId
              ? {
                  ...turn,
                  isStreaming: false,
                  reasoningSteps: [
                    { text: 'بررسی کاتالوگ فروشندگان فیزیکی ترب', status: 'done' },
                    { text: 'بررسی بورس متمرکز این دسته کالا در تهران', status: 'done' }
                  ],
                  text: bazaarData
                    ? `در حال حاضر فروشگاه فیزیکی ثبت‌شده‌ای با موجودی قطعی برای «${productTitle}» در این محدوده ثبت نشده است؛ اما بورس تخصصی این کالا در تهران برای خرید حضوری روی نقشه زیر مشخص شده است:`
                    : `در حال حاضر فروشگاه فیزیکی ثبت‌شده‌ای برای «${productTitle}» در این محدوده یافت نشد. می‌توانید مدل‌های مشابه دیگر را جستجو بفرمایید.`,
                  uiBlocks,
                  followUpChips: ['دیدن نقشه و مسیریابی', 'مشاهده همه فروشگاه‌ها بدون فیلتر']
                }
              : turn
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((turn) =>
          turn.id === assistantMsgId
            ? {
                ...turn,
                isStreaming: false,
                text: 'خطا در دریافت لیست فروشگاه‌ها. لطفاً دوباره تلاش کنید.'
              }
            : turn
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // When user clicks "استعلام موجودی" on a shop card
  const handleTriggerInquiry = async (offerId: string) => {
    const userPrompt = 'استعلام موجودی و قیمت قطعی از این فروشگاه';
    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `asst_${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: userPrompt },
      {
        id: assistantMsgId,
        sender: 'assistant',
        text: '',
        isStreaming: true,
        reasoningSteps: [
          { text: 'برقراری ارتباط سیستمی با فروشگاه...', status: 'running' }
        ],
        uiBlocks: []
      }
    ]);

    setIsStreaming(true);

    try {
      const res = await simulateInquiry(offerId);

      setMessages((prev) =>
        prev.map((turn) =>
          turn.id === assistantMsgId
            ? {
                ...turn,
                isStreaming: false,
                reasoningSteps: [
                  { text: 'برقراری ارتباط سیستمی با فروشگاه در پاساژ', status: 'done' },
                  { text: 'بررسی انبار و قفسه فروشنده', status: 'done' },
                  { text: 'تأیید آخرین قیمت روز و شرایط تحویل حضوری', status: 'done' }
                ],
                text: 'پاسخ استعلام فروشنده دریافت شد:',
                uiBlocks: [{ type: 'InquirySimulationCard', data: res }],
                followUpChips: ['دیدن روی نقشه و مسیریابی', 'راهنمای داخل پاساژ']
              }
            : turn
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((turn) =>
          turn.id === assistantMsgId
            ? {
                ...turn,
                isStreaming: false,
                text: 'خطا در ارسال استعلام. لطفاً دوباره تلاش کنید.'
              }
            : turn
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Starter quick prompts
  const starterPrompts = [
    { label: 'کتونی پیاده‌روی تا ۳ میلیون در ونک', query: 'کتونی پیاده‌روی تا ۳ میلیون' },
    { label: 'لپ‌تاپ سبک دانشجویی تا ۳۰ میلیون', query: 'لپ‌تاپ سبک تا ۳۰ میلیون' },
    { label: 'گوشی سامسونگ اقساطی بازار چارسو', query: 'گوشی سامسونگ اقساطی' },
    { label: 'شارژر اورجینال لپ‌تاپ', query: 'شارژر لپ‌تاپ' }
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#f8f7f4] dark:bg-[#0f141c] text-[#1c1d20] dark:text-[#f1f5f9] transition-colors">
      {/* Top Navigation */}
      <Navbar
        currentArea={currentArea}
        isChatActive={messages.length > 0}
        onOpenLocation={() => setIsLocationOpen(true)}
        onNewChat={handleNewChat}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4">
        {/* VIEW 1: HERO / LANDING (When conversation has not started) */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center py-12 sm:py-20 text-center animate-fade-in">
            {/* Torob Brand Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#d9383a] animate-pulse" />
              <span>دستیار هوشمند خرید حضوری ترب — تهران</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-[#f0f6fc] tracking-tight max-w-xl leading-tight">
              خرید حضوری در تهران، با مقایسه قیمت و استعلام موجودی
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
              کالای موردنظرتان را بنویسید؛ نزدیک‌ترین مغازه‌های باز، قیمت واقعی، موجودی لحظه‌ای و راهنمای داخل پاساژ را به شما نشان می‌دهم.
            </p>

            {/* Big Prominent Prompt Input Box (ChatGPT Style) */}
            <div className="w-full max-w-xl mt-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center rounded-2xl bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] p-2 shadow-sm focus-within:border-[#d9383a] focus-within:ring-2 focus-within:ring-[#d9383a]/15 transition-all"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="دنبال چه کالایی در تهران هستید؟ (مثلاً: لپ‌تاپ لنوو، کتونی تا ۳ تومن...)"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none ring-0 text-slate-900 dark:text-[#f0f6fc] placeholder:text-slate-400"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#d9383a] hover:bg-[#c42b2d] disabled:opacity-40 disabled:hover:bg-[#d9383a] text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
                >
                  <span>جستجو</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </form>

              {/* Starter Query Chips */}
              <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                {starterPrompts.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip.query)}
                    className="px-3 py-1.5 rounded-full bg-white dark:bg-[#18202c] hover:bg-slate-50 dark:hover:bg-[#222c3d] text-slate-600 dark:text-slate-300 text-[11px] font-medium border border-[#e8e6df] dark:border-[#263346] shadow-xs transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-12 text-right">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] shadow-xs space-y-1">
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[#d9383a] flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-[#f0f6fc]">موجودی واقعی مغازه‌ها</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  جستجوی فروشگاه‌های باز تهران بر اساس فاصله از شما و شرایط اقساط
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] shadow-xs space-y-1">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-[#f0f6fc]">راهنمای داخل پاساژ</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  مشاهده نام پاساژ، طبقه، پلاک واحد، ایستگاه مترو و پارکینگ
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] shadow-xs space-y-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-[#f0f6fc]">استعلام و نقشه</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  استعلام شبیه‌سازی‌شده قبل از حرکت و مشاهده موقعیت دقیق روی نقشه
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: FULL CONVERSATION STREAM (ChatGPT Style) */
          <div className="flex-1 flex flex-col pt-4 pb-28">
            {/* Message Stream */}
            <div className="space-y-6">
              {messages.map((turn) => (
                <div key={turn.id} className="animate-enter">
                  {turn.sender === 'user' ? (
                    /* User Message Bubble */
                    <div className="flex justify-start">
                      <div className="max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-[#222c3d] dark:text-[#f0f6fc] text-xs sm:text-sm font-medium shadow-xs rounded-tr-xs leading-relaxed">
                        {turn.text}
                      </div>
                    </div>
                  ) : (
                    /* Assistant Turn */
                    <div className="flex flex-col space-y-2">
                      {/* Assistant Avatar & Header */}
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <div className="w-6 h-6 rounded-lg bg-[#d9383a] text-white flex items-center justify-center text-xs font-black shadow-xs">
                          ت
                        </div>
                        <span>دستیار هوشمند ترب</span>
                      </div>

                      {/* Agent Reasoning Box (ChatGPT "Worked for X" collapsible) */}
                      {turn.reasoningSteps && turn.reasoningSteps.length > 0 && (
                        <AgentReasoningBox
                          steps={turn.reasoningSteps}
                          isStreaming={!!turn.isStreaming}
                        />
                      )}

                      {/* Assistant Text Response */}
                      {turn.text && (
                        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap px-1">
                          {turn.text}
                        </div>
                      )}

                      {/* Generative UI Blocks in Stream */}
                      {turn.uiBlocks && turn.uiBlocks.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {turn.uiBlocks.map((block, bIdx) => (
                            <GenerativeUIRenderer
                              key={bIdx}
                              block={block}
                              userLat={userLat}
                              userLon={userLon}
                              onRequestShops={handleRequestShops}
                              onOpenInquiry={handleTriggerInquiry}
                              onOpenMallGuide={(mallName) => setMallNameForModal(mallName)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Follow-up Suggestion Chips */}
                      {turn.followUpChips && turn.followUpChips.length > 0 && !turn.isStreaming && (
                        <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                          {turn.followUpChips.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => handleSendMessage(chip)}
                              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#18202c] hover:bg-slate-50 dark:hover:bg-[#222c3d] text-slate-600 dark:text-slate-300 text-[11px] font-medium border border-[#e8e6df] dark:border-[#263346] shadow-xs transition-colors cursor-pointer active:scale-95"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* PINNED BOTTOM CHAT INPUT BAR (Visible when in conversation) */}
      {messages.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-[#f8f7f4]/90 dark:bg-[#0f141c]/90 backdrop-blur-md border-t border-[#e8e6df] dark:border-[#263346] p-3 sm:p-4">
          <div className="max-w-3xl mx-auto space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 rounded-2xl bg-white dark:bg-[#18202c] border border-[#e8e6df] dark:border-[#263346] p-1.5 shadow-sm focus-within:border-[#d9383a] focus-within:ring-2 focus-within:ring-[#d9383a]/15 transition-all"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="سؤال یا خواسته بعدی خود را بنویسید..."
                disabled={isStreaming}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none ring-0 text-slate-900 dark:text-[#f0f6fc] placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#d9383a] hover:bg-[#c42b2d] disabled:opacity-40 disabled:hover:bg-[#d9383a] text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
                title="ارسال پیام"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ارسال</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-[10.5px] text-slate-400 dark:text-slate-500 px-1">
              <span>موقعیت مکانی فعال: {currentArea}</span>
              <span>دستیار بر اساس موجودی و کاتالوگ واقعی ترب تهران پاسخ می‌دهد</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentArea={currentArea}
        currentRadius={10000}
        onSelectLocation={(area, lat, lon) => {
          setCurrentArea(area);
          setUserLat(lat);
          setUserLon(lon);
        }}
      />

      {mallNameForModal && (
        <MallNavigationModal
          isOpen={!!mallNameForModal}
          onClose={() => setMallNameForModal(null)}
          mallName={mallNameForModal}
        />
      )}
    </div>
  );
}
