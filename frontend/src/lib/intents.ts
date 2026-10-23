/**
 * Intent recognition module for frontend conversational handling.
 * Resolves map actions, store filter chips, and gibberish queries
 * deterministically without triggering accidental product catalog searches.
 */

export function isMapOrNavigationIntent(text: string): boolean {
  const t = text.trim();
  const mapKeywords = ['نقشه', 'مسیریابی', 'لوکیشن', 'آدرس', 'روی نقشه', 'دیدن نقشه'];
  return mapKeywords.some((k) => t.includes(k));
}

export interface StoreFilterResult {
  isFilter: boolean;
  openNow?: boolean;
  installmentOnly?: boolean;
  sortBy?: 'distance' | 'price' | 'balanced';
}

export function isStoreFilterIntent(text: string): StoreFilterResult {
  const t = text.trim();

  const isOpenNow = t.includes('فروشگاه‌های باز') || t.includes('باز الان') || t.includes('فقط باز');
  const isInstallment = t.includes('خرید اقساطی') || t.includes('امکان اقساط') || t.includes('قسطی') || t.includes('اقساط');
  const isNearest = t.includes('نزدیک‌ترین فروشگاه') || t.includes('نزدیکترین') || t.includes('نزدیک تر');
  const isCheapest = t.includes('ارزان‌ترین') || t.includes('کمترین قیمت');

  // Must not be a full product search like "خرید گوشی قسطی" or "لپ تاپ اقساطی"
  const isActionChip = (
    t === 'فقط فروشگاه‌های باز الان' ||
    t === 'امکان خرید اقساطی' ||
    t === 'نزدیک‌ترین فروشگاه‌ها' ||
    t === 'فقط فروشگاه‌های اقساطی' ||
    (isOpenNow && !t.includes('گوشی') && !t.includes('لپ') && !t.includes('کفش') && !t.includes('سامسونگ')) ||
    (isInstallment && !t.includes('گوشی') && !t.includes('لپ') && !t.includes('کفش') && !t.includes('سامسونگ') && t.length < 25) ||
    (isNearest && t.length < 25)
  );

  if (isActionChip) {
    return {
      isFilter: true,
      openNow: isOpenNow ? true : undefined,
      installmentOnly: isInstallment ? true : undefined,
      sortBy: isNearest ? 'distance' : isCheapest ? 'price' : undefined
    };
  }

  return { isFilter: false };
}

export function isGibberishOrNonsense(text: string): boolean {
  const t = text.trim();
  if (t.length < 2) return true;

  // Repetitive character e.g. "aaaaa" or "سسسسس"
  if (/^(.)\1{3,}$/.test(t)) return true;

  // Pure ASCII check without known tech/product tokens
  const isAscii = /^[a-zA-Z0-9_\-\s.]+$/.test(t);
  if (isAscii) {
    const validKeywords = [
      'laptop', 'mobile', 'samsung', 'asus', 'lenovo', 'apple', 'iphone', 'sony',
      'nike', 'shoe', 'charger', 'airpod', 'headphone', 'watch', 'xiaomi', 'dell',
      'hp', 'macbook', 'ipad', 'pro', 'galaxy', 'canon', 'nikon', 'cctv', 'camera',
      'tv', 'pc', 'ram', 'ssd', 'case', 'monitor', 'keyboard', 'mouse'
    ];
    const words = t.toLowerCase().split(/\s+/);
    const hasValid = words.some((w) => validKeywords.some((k) => w.includes(k)));
    if (!hasValid) {
      return true;
    }
  }

  return false;
}
