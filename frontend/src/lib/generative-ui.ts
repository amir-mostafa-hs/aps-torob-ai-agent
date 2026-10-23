/**
 * Generative UI Allowlist & Schema Validator
 * Ensures only explicitly approved, typed components can be rendered.
 * Strictly prevents execution or rendering of arbitrary model-generated code or HTML.
 */

export const ALLOWED_UI_BLOCK_TYPES = [
  'ProductCardList',
  'ShopCardList',
  'MallNavigationCard',
  'BazaarHubCard',
  'InquirySimulationCard',
  'ProductCompareCard',
] as const;

export type AllowedUIBlockType = typeof ALLOWED_UI_BLOCK_TYPES[number];

export interface ValidatedUIBlockSuccess {
  valid: true;
  type: AllowedUIBlockType;
  data: Record<string, any>;
}

export interface ValidatedUIBlockFailure {
  valid: false;
  type: string;
  error: string;
}

export type ValidatedUIBlock = ValidatedUIBlockSuccess | ValidatedUIBlockFailure;

export function isAllowedType(type: string): type is AllowedUIBlockType {
  return (ALLOWED_UI_BLOCK_TYPES as readonly string[]).includes(type);
}

export function validateUIBlock(raw: unknown): ValidatedUIBlock | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const candidate = raw as { type?: unknown; data?: unknown };

  if (typeof candidate.type !== 'string') {
    return {
      valid: false,
      type: 'Unknown',
      error: 'نوع کامپوننت مشخص نشده است.',
    };
  }

  const type = candidate.type;

  if (!isAllowedType(type)) {
    return {
      valid: false,
      type: 'Unknown',
      error: `نوع کامپوننت «${type}» در لیست مجاز سامانه نیست.`,
    };
  }

  const data = candidate.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      type,
      error: 'داده‌های کامپوننت باید به صورت شیء معتبر باشند.',
    };
  }

  const dataObj = data as Record<string, any>;

  // Type-specific field validations
  switch (type) {
    case 'ProductCardList': {
      if (!Array.isArray(dataObj.products)) {
        return {
          valid: false,
          type,
          error: 'فهرست محصولات باید یک آرایه باشد.',
        };
      }
      return {
        valid: true,
        type,
        data: {
          products: dataObj.products.filter(
            (p) => p && typeof p === 'object' && p.product_id && p.persian_title_clean
          ),
        },
      };
    }

    case 'ShopCardList': {
      if (!Array.isArray(dataObj.offers)) {
        return {
          valid: false,
          type,
          error: 'فهرست فروشگاه‌ها باید یک آرایه باشد.',
        };
      }
      return {
        valid: true,
        type,
        data: {
          offers: dataObj.offers.filter(
            (o) => o && typeof o === 'object' && o.offer_id && o.shop_name
          ),
        },
      };
    }

    case 'MallNavigationCard': {
      if (!dataObj.mall_name && !dataObj.mall_name_clean) {
        return {
          valid: false,
          type,
          error: 'نام پاساژ مشخص نشده است.',
        };
      }
      return {
        valid: true,
        type,
        data: dataObj,
      };
    }

    case 'BazaarHubCard': {
      if (!dataObj.category_name && !dataObj.top_neighborhoods && !dataObj.agent_recommendation_text) {
        return {
          valid: false,
          type,
          error: 'اطلاعات بورس کالا کامل نیست.',
        };
      }
      return {
        valid: true,
        type,
        data: dataObj,
      };
    }

    case 'InquirySimulationCard': {
      if (!dataObj.offer_id) {
        return {
          valid: false,
          type,
          error: 'شناسه آگهی برای استعلام مشخص نشده است.',
        };
      }
      return {
        valid: true,
        type,
        data: dataObj,
      };
    }

    case 'ProductCompareCard': {
      if (!Array.isArray(dataObj.products) || dataObj.products.length < 2) {
        return {
          valid: false,
          type,
          error: 'برای مقایسه حداقل دو محصول لازم است.',
        };
      }
      return {
        valid: true,
        type,
        data: dataObj,
      };
    }

    default:
      return {
        valid: false,
        type: 'Unknown',
        error: 'نوع کامپوننت پشتیبانی نمی‌شود.',
      };
  }
}
