import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_UI_BLOCK_TYPES,
  validateUIBlock,
  type ValidatedUIBlock
} from './generative-ui.ts';

describe('Generative UI Allowlist and Validation', () => {
  it('should define the explicit allowlist of UI component types', () => {
    assert.ok(Array.isArray(ALLOWED_UI_BLOCK_TYPES));
    assert.deepEqual(ALLOWED_UI_BLOCK_TYPES, [
      'ProductCardList',
      'ShopCardList',
      'MallNavigationCard',
      'BazaarHubCard',
      'InquirySimulationCard',
      'ProductCompareCard'
    ]);
  });

  it('should reject non-object or null input', () => {
    assert.equal(validateUIBlock(null), null);
    assert.equal(validateUIBlock(undefined), null);
    assert.equal(validateUIBlock('string'), null);
    assert.equal(validateUIBlock(123), null);
  });

  it('should reject unknown component types', () => {
    const maliciousBlock = {
      type: 'ArbitraryCodeExecution',
      data: { code: 'alert("hack")' }
    };
    const result = validateUIBlock(maliciousBlock);
    assert.ok(result);
    assert.equal(result.valid, false);
    assert.equal(result.type, 'Unknown');
  });

  it('should validate ProductCardList with valid products', () => {
    const validBlock = {
      type: 'ProductCardList',
      data: {
        products: [
          {
            product_id: 'p1',
            persian_title_clean: 'گوشی سامسونگ A54',
            category_name: 'گوشی موبایل',
            min_price_toman: 15000000,
            offers_count: 5,
            condition: 'نو',
            authenticity: 'اصل'
          }
        ]
      }
    };
    const result = validateUIBlock(validBlock);
    assert.ok(result);
    assert.equal(result.valid, true);
    assert.equal(result.type, 'ProductCardList');
    assert.equal((result as any).data.products.length, 1);
  });

  it('should reject ProductCardList when products is not an array', () => {
    const invalidBlock = {
      type: 'ProductCardList',
      data: { products: 'not-an-array' }
    };
    const result = validateUIBlock(invalidBlock);
    assert.ok(result);
    assert.equal(result.valid, false);
  });

  it('should validate ShopCardList with valid offers', () => {
    const validBlock = {
      type: 'ShopCardList',
      data: {
        offers: [
          {
            offer_id: 'off_1',
            shop_id: 'shop_1',
            shop_name: 'فروشگاه پایتخت',
            price: { amount_toman: 14500000, freshness_label: 'به‌روز' },
            navigation: { is_inside_mall: true, mall_name_clean: 'پاساژ علاءالدین' }
          }
        ]
      }
    };
    const result = validateUIBlock(validBlock);
    assert.ok(result);
    assert.equal(result.valid, true);
    assert.equal(result.type, 'ShopCardList');
  });

  it('should validate MallNavigationCard', () => {
    const validBlock = {
      type: 'MallNavigationCard',
      data: {
        mall_name: 'پاساژ علاءالدین',
        floor_clean: 'طبقه دوم',
        unit_clean: 'واحد ۲۱۴'
      }
    };
    const result = validateUIBlock(validBlock);
    assert.ok(result);
    assert.equal(result.valid, true);
    assert.equal(result.type, 'MallNavigationCard');
  });

  it('should validate BazaarHubCard', () => {
    const validBlock = {
      type: 'BazaarHubCard',
      data: {
        category_name: 'گوشی موبایل',
        top_neighborhoods: 'خیابان جمهوری / علاءالدین',
        agent_recommendation_text: 'برای تنوع بیشتر به بورس علاءالدین مراجعه کنید.'
      }
    };
    const result = validateUIBlock(validBlock);
    assert.ok(result);
    assert.equal(result.valid, true);
    assert.equal(result.type, 'BazaarHubCard');
  });

  it('should validate InquirySimulationCard', () => {
    const validBlock = {
      type: 'InquirySimulationCard',
      data: {
        offer_id: 'off_1',
        in_stock: true,
        confirmed_price_toman: 14500000,
        seller_message: 'موجود است، آماده تحویل حضوری.',
        recommended_action: 'مراجعه به فروشگاه'
      }
    };
    const result = validateUIBlock(validBlock);
    assert.ok(result);
    assert.equal(result.valid, true);
    assert.equal(result.type, 'InquirySimulationCard');
  });
});
