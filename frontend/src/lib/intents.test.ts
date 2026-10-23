import test from 'node:test';
import assert from 'node:assert/strict';
import { isMapOrNavigationIntent, isStoreFilterIntent, isGibberishOrNonsense } from './intents.ts';

test('Intent Detection Tests', async (t) => {
  await t.test('isMapOrNavigationIntent identifies map queries correctly', () => {
    assert.equal(isMapOrNavigationIntent('دیدن نقشه و مسیریابی'), true);
    assert.equal(isMapOrNavigationIntent('مشاهده روی نقشه'), true);
    assert.equal(isMapOrNavigationIntent('نمایش روی نقشه'), true);
    assert.equal(isMapOrNavigationIntent('مسیریابی فروشگاه'), true);
    assert.equal(isMapOrNavigationIntent('لوکیشن پاساژ'), true);
    assert.equal(isMapOrNavigationIntent('لپ‌تاپ لنوو'), false);
    assert.equal(isMapOrNavigationIntent('کتونی نایک'), false);
  });

  await t.test('isStoreFilterIntent identifies shop filters correctly', () => {
    const f1 = isStoreFilterIntent('فقط فروشگاه‌های باز الان');
    assert.equal(f1.isFilter, true);
    assert.equal(f1.openNow, true);

    const f2 = isStoreFilterIntent('امکان خرید اقساطی');
    assert.equal(f2.isFilter, true);
    assert.equal(f2.installmentOnly, true);

    const f3 = isStoreFilterIntent('نزدیک‌ترین فروشگاه‌ها');
    assert.equal(f3.isFilter, true);
    assert.equal(f3.sortBy, 'distance');

    const f4 = isStoreFilterIntent('خرید گوشی سامسونگ');
    assert.equal(f4.isFilter, false);
  });

  await t.test('isGibberishOrNonsense identifies random gibberish', () => {
    assert.equal(isGibberishOrNonsense('dfadfdaf'), true);
    assert.equal(isGibberishOrNonsense('asdfghjkl'), true);
    assert.equal(isGibberishOrNonsense('سسسسسسس'), true);
    assert.equal(isGibberishOrNonsense('a'), true);
    assert.equal(isGibberishOrNonsense('لپ تاپ ایسوس'), false);
    assert.equal(isGibberishOrNonsense('iphone 15 pro'), false);
    assert.equal(isGibberishOrNonsense('samsung s24'), false);
    assert.equal(isGibberishOrNonsense('کتونی نایک'), false);
  });
});
