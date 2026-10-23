import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  determineUIState,
  getSearchStatusMessage,
  type AppUIState
} from './progressive-states.ts';

describe('Progressive UI State Determination', () => {
  it('should return initial_search (State A) when no search has been performed', () => {
    const state = determineUIState({
      hasSearched: false,
      loadingProducts: false,
      productsCount: 0,
      selectedProduct: null,
      loadingStores: false,
      storeOffersCount: 0,
      hasError: false
    });
    assert.equal(state, 'initial_search');
  });

  it('should return search_in_progress (State B) when loading products', () => {
    const state = determineUIState({
      hasSearched: true,
      loadingProducts: true,
      productsCount: 0,
      selectedProduct: null,
      loadingStores: false,
      storeOffersCount: 0,
      hasError: false
    });
    assert.equal(state, 'search_in_progress');
  });

  it('should return results_ready (State C) when products are loaded and no product selected', () => {
    const state = determineUIState({
      hasSearched: true,
      loadingProducts: false,
      productsCount: 12,
      selectedProduct: null,
      loadingStores: false,
      storeOffersCount: 0,
      hasError: false
    });
    assert.equal(state, 'results_ready');
  });

  it('should return stores_interactive (State D) when a product is selected', () => {
    const state = determineUIState({
      hasSearched: true,
      loadingProducts: false,
      productsCount: 12,
      selectedProduct: { product_id: 'p1' },
      loadingStores: false,
      storeOffersCount: 4,
      hasError: false
    });
    assert.equal(state, 'stores_interactive');
  });

  it('should return empty_results (State E) when search finished with 0 items', () => {
    const state = determineUIState({
      hasSearched: true,
      loadingProducts: false,
      productsCount: 0,
      selectedProduct: null,
      loadingStores: false,
      storeOffersCount: 0,
      hasError: false
    });
    assert.equal(state, 'empty_results');
  });

  it('should return error_state (State E) when an error occurs', () => {
    const state = determineUIState({
      hasSearched: true,
      loadingProducts: false,
      productsCount: 0,
      selectedProduct: null,
      loadingStores: false,
      storeOffersCount: 0,
      hasError: true
    });
    assert.equal(state, 'error_state');
  });

  it('should provide respectful, clear Persian search status message', () => {
    const msg = getSearchStatusMessage();
    assert.ok(msg.includes('در حال پیدا کردن گزینه‌های مناسب'));
  });
});
