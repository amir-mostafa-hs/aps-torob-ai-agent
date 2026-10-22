import {
  ProductSummary, ProductDetail, StoreOfferItem, StoreDetail,
  MallInfo, BazaarHub, InquiryResponse
} from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL !== undefined 
  ? process.env.NEXT_PUBLIC_API_URL 
  : (typeof window !== 'undefined' ? '' : 'http://localhost:8000');

export async function searchProducts(
  q: string,
  category?: string,
  brand?: string,
  limit: number = 20
): Promise<{ total: number; items: ProductSummary[] }> {
  const params = new URLSearchParams({ q, limit: limit.toString() });
  if (category) params.append('category', category);
  if (brand) params.append('brand', brand);

  const res = await fetch(`${API_BASE}/api/v1/products/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error('خطا در دریافت نتایج جستجو');
  }
  return res.json();
}

export async function getProduct(productId: string): Promise<ProductDetail> {
  const res = await fetch(`${API_BASE}/api/v1/products/${productId}`);
  if (!res.ok) {
    throw new Error('کالا یافت نشد');
  }
  return res.json();
}

export interface StoreFilterParams {
  user_lat?: number;
  user_lon?: number;
  max_radius_meters?: number;
  min_budget?: number;
  max_budget?: number;
  installment_only?: boolean;
  open_now?: boolean;
  sort_by?: 'price' | 'distance' | 'balanced';
}

export async function getProductShops(
  productId: string,
  filters: StoreFilterParams = {}
): Promise<{ product_id: string; total_offers: number; offers: StoreOfferItem[] }> {
  const params = new URLSearchParams();
  if (filters.user_lat) params.append('user_lat', filters.user_lat.toString());
  if (filters.user_lon) params.append('user_lon', filters.user_lon.toString());
  if (filters.max_radius_meters) params.append('max_radius_meters', filters.max_radius_meters.toString());
  if (filters.min_budget) params.append('min_budget', filters.min_budget.toString());
  if (filters.max_budget) params.append('max_budget', filters.max_budget.toString());
  if (filters.installment_only) params.append('installment_only', 'true');
  if (filters.open_now) params.append('open_now', 'true');
  if (filters.sort_by) params.append('sort_by', filters.sort_by);

  const res = await fetch(`${API_BASE}/api/v1/products/${productId}/shops?${params.toString()}`);
  if (!res.ok) {
    throw new Error('خطا در دریافت لیست فروشگاه‌ها');
  }
  return res.json();
}

export async function getShop(shopId: string): Promise<StoreDetail> {
  const res = await fetch(`${API_BASE}/api/v1/shops/${shopId}`);
  if (!res.ok) {
    throw new Error('فروشگاه یافت نشد');
  }
  return res.json();
}

export async function getMall(mallName: string): Promise<MallInfo> {
  const res = await fetch(`${API_BASE}/api/v1/malls/${encodeURIComponent(mallName)}`);
  if (!res.ok) {
    throw new Error('اطلاعات مجتمع یافت نشد');
  }
  return res.json();
}

export async function getBazaar(categoryName: string): Promise<BazaarHub> {
  const res = await fetch(`${API_BASE}/api/v1/bazaars/${encodeURIComponent(categoryName)}`);
  if (!res.ok) {
    throw new Error('بورس مربوطه یافت نشد');
  }
  return res.json();
}

export async function simulateInquiry(
  offerId: string,
  userNote?: string
): Promise<InquiryResponse> {
  const res = await fetch(`${API_BASE}/api/v1/inquiry/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offer_id: offerId,
      inquiry_type: 'stock_and_price',
      user_note: userNote
    })
  });
  if (!res.ok) {
    throw new Error('خطا در ارسال استعلام شبیه‌سازی‌شده');
  }
  return res.json();
}

export async function streamAgentChat(
  sessionId: string,
  message: string,
  context: { user_lat?: number; user_lon?: number; area_name?: string } = {},
  onEvent: (event: string, data: any) => void
) {
  const res = await fetch(`${API_BASE}/api/v1/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      context
    })
  });

  if (!res.ok || !res.body) {
    throw new Error('خطا در اتصال به دستیار هوشمند');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    // Normalize \r\n to \n for cross-platform SSE parsing
    const normalized = buffer.replace(/\r\n/g, '\n');
    const chunks = normalized.split('\n\n');
    buffer = chunks.pop() || '';

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      let eventType = 'message';
      let dataText = '';
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataText = line.slice(5).trim();
        }
      }
      if (dataText) {
        try {
          const parsed = JSON.parse(dataText);
          onEvent(eventType, parsed);
        } catch {
          onEvent(eventType, dataText);
        }
      }
    }
  }
}
