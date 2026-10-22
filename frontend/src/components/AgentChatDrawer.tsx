'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Store, Compass, Building2, PhoneCall, Loader2 } from 'lucide-react';
import { streamAgentChat } from '@/lib/api';
import { COPY_FA } from '@/copy/fa';
import { ProductSummary, StoreOfferItem } from '@/types/api';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentArea: string;
  userLat?: number;
  userLon?: number;
  onSelectProduct: (product: ProductSummary) => void;
  onSelectStore: (offer: StoreOfferItem) => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  thinking?: string;
  tools?: { name: string; status: 'running' | 'done' }[];
  uiBlocks?: { type: string; data: any }[];
}

export function AgentChatDrawer({
  isOpen,
  onClose,
  currentArea,
  userLat,
  userLon,
  onSelectProduct,
  onSelectStore,
}: AgentChatDrawerProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'سلام! من دستیار خرید حضوری ترب در تهران هستم. دنبال چه کالایی در تهران هستید؟ می‌توانم مدل‌های پرفروش، فروشگاه‌های نزدیک و باز، شرایط اقساط و راهنمای داخل پاساژ را برایتان پیدا کنم.'
    }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionIdRef = useRef<string>(
    typeof window !== 'undefined'
      ? localStorage.getItem('torob_session_id') || `sess_${Math.random().toString(36).substring(2, 9)}`
      : 'sess_default'
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('torob_session_id', sessionIdRef.current);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || streaming) return;

    setInput('');
    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `asst_${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text },
      { id: assistantMsgId, sender: 'assistant', text: '', thinking: 'در حال بررسی نیاز...', tools: [], uiBlocks: [] }
    ]);
    setStreaming(true);

    try {
      await streamAgentChat(
        sessionIdRef.current,
        text,
        { user_lat: userLat, user_lon: userLon, area_name: currentArea },
        (event, data) => {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantMsgId) return m;

              if (event === 'thinking') {
                return { ...m, thinking: data.step || 'در حال پردازش...' };
              } else if (event === 'tool_start') {
                const tools = m.tools || [];
                return {
                  ...m,
                  thinking: `در حال اجرای ${data.tool}...`,
                  tools: [...tools, { name: data.tool, status: 'running' }]
                };
              } else if (event === 'tool_done') {
                const tools = (m.tools || []).map((t) =>
                  t.name === data.tool ? { ...t, status: 'done' as const } : t
                );
                return { ...m, thinking: undefined, tools };
              } else if (event === 'ui_block') {
                const blocks = m.uiBlocks || [];
                return { ...m, uiBlocks: [...blocks, data] };
              } else if (event === 'message') {
                return { ...m, text: (m.text || '') + (data.delta || '') };
              }
              return m;
            })
          );
        }
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, text: 'متأسفانه در اتصال به دستیار مشکلی پیش آمد. می‌توانید از جستجو و فیلترهای بالای صفحه استفاده کنید.' }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {COPY_FA.chat.drawerTitle}
              </h3>
              <p className="text-[11px] text-slate-500">
                پاسخ‌گویی هوشمند بر اساس موجودی واقعی تهران
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-red-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Thinking spinner */}
                {m.thinking && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 mb-2 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{m.thinking}</span>
                  </div>
                )}

                {/* Text Content */}
                {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}

                {/* Rendered Generative UI Blocks */}
                {m.uiBlocks && m.uiBlocks.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                    {m.uiBlocks.map((block, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm">
                        {block.type === 'ProductCardList' && (
                          <div className="space-y-1.5">
                            <span className="font-bold text-[11px] text-slate-500 block">مدل‌های پیدا شده:</span>
                            {block.data.products?.map((p: any) => (
                              <div
                                key={p.product_id}
                                onClick={() => {
                                  onSelectProduct(p);
                                  onClose();
                                }}
                                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors border border-slate-100 dark:border-slate-700 flex justify-between items-center"
                              >
                                <span className="font-medium text-[11px] truncate max-w-[200px]">{p.persian_title_clean}</span>
                                <span className="text-[10px] font-bold text-red-600 shrink-0">دیدن فروشگاه‌ها</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === 'ShopCardList' && (
                          <div className="space-y-1.5">
                            <span className="font-bold text-[11px] text-slate-500 block">فروشگاه‌های دارای کالا:</span>
                            {block.data.offers?.map((o: any) => (
                              <div
                                key={o.offer_id}
                                onClick={() => {
                                  onSelectStore(o);
                                  onClose();
                                }}
                                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors border border-slate-100 dark:border-slate-700 flex justify-between items-center"
                              >
                                <div>
                                  <span className="font-medium text-[11px] block">{o.shop_name}</span>
                                  <span className="text-[10px] text-slate-400">{o.navigation?.mall_name_clean || o.navigation?.main_street || 'تهران'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-red-600 shrink-0">
                                  {Math.round(o.price?.amount_toman).toLocaleString('fa-IR')} ت
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === 'MallNavigationCard' && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                              <Compass className="w-3.5 h-3.5" />
                              <span>{block.data.mall_name}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                              {block.data.nearest_metro && `مترو نزدیک: ${block.data.nearest_metro}`}
                            </p>
                          </div>
                        )}

                        {block.type === 'BazaarHubCard' && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>بورس اصلی در تهران: {block.data.top_neighborhoods || block.data.top_malls}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                              {block.data.agent_recommendation_text}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
          {['کتونی پیاده‌روی تا ۳ میلیون', 'گوشی سامسونگ علاءالدین', 'لپ‌تاپ سبک'].map((prompt) => (
            <button
              key={prompt}
              disabled={streaming}
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={COPY_FA.chat.inputPlaceholder}
              disabled={streaming}
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-all shadow-sm active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
