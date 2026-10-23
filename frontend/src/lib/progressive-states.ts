/**
 * Progressive UI State Machine and Status Messages
 * Coordinates transitions between States A, B, C, D, and E cleanly.
 */

export type AppUIState =
  | 'initial_search'      // State A: Clean hero, no clutter
  | 'search_in_progress'  // State B: Persian status, skeletons, query visible
  | 'results_ready'       // State C: Smooth entrance, product cards, filters
  | 'stores_interactive'  // State D: Selected product, nearby stores, comparison, inquiry
  | 'empty_results'       // State E: Friendly empty state, bourse recommendation
  | 'error_state';        // State E: Calm error with retry action

export interface StateDeterminationParams {
  hasSearched: boolean;
  loadingProducts: boolean;
  productsCount: number;
  selectedProduct: any | null;
  loadingStores: boolean;
  storeOffersCount: number;
  hasError: boolean;
}

export function determineUIState(params: StateDeterminationParams): AppUIState {
  if (params.hasError) {
    return 'error_state';
  }

  if (params.selectedProduct !== null) {
    return 'stores_interactive';
  }

  if (!params.hasSearched) {
    return 'initial_search';
  }

  if (params.loadingProducts) {
    return 'search_in_progress';
  }

  if (params.productsCount === 0) {
    return 'empty_results';
  }

  return 'results_ready';
}

export function getSearchStatusMessage(): string {
  return 'در حال پیدا کردن گزینه‌های مناسب و بررسی موجودی در کاتالوگ ترب...';
}

export function getStoresStatusMessage(): string {
  return 'در حال یافتن فروشگاه‌های فیزیکی باز، محاسبه دقیق فواصل و شرایط اقساط...';
}
