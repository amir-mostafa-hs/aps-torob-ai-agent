export interface PriceInfo {
  amount_toman: number;
  last_changed_at: string | null;
  age_days: number | null;
  freshness_label: string;
  needs_seller_call: boolean;
  call_reason: string;
}

export interface StoreNavigation {
  is_inside_mall: boolean;
  mall_name_clean: string | null;
  floor_clean: string | null;
  unit_clean: string | null;
  indoor_navigation_hint: string | null;
  main_street: string | null;
  location_label: string | null;
}

export interface StoreHours {
  hours_data_quality: string;
  is_hours_estimated: boolean;
  effective_sat_to_wed_hours: string | null;
  thu_hours: string | null;
  open_on_friday: boolean;
  clean_weekly_hours_json: Record<string, string> | null;
}

export interface PaymentConditions {
  has_installment: boolean;
  has_torob_pay: boolean;
  has_snapp_pay: boolean;
  has_digi_pay: boolean;
  has_tara: boolean;
  payment_providers: string | null;
}

export interface BuyingGuide {
  market_price_summary: any;
  highlights_and_pros: string[];
  in_person_buying_checklist: string[];
}

export interface ProductSummary {
  product_id: string;
  category_name: string;
  persian_title_clean: string;
  brand_clean: string | null;
  model_clean: string | null;
  condition: string;
  condition_source: string;
  authenticity: string;
  specs_count: number;
  specs_summary: string | null;
  primary_image_url: string | null;
  min_price_toman: number | null;
  max_price_toman: number | null;
  offers_count: number;
}

export interface ProductDetail extends ProductSummary {
  buying_guide?: BuyingGuide | null;
}

export interface StoreOfferItem {
  offer_id: string;
  shop_id: string;
  product_id: string;
  shop_name: string;
  is_real_shop: boolean;
  price: PriceInfo;
  navigation: StoreNavigation;
  hours: StoreHours;
  payments: PaymentConditions;
  distance_meters: number | null;
  lat: number;
  lon: number;
  warranty_clean: string;
  has_warranty: boolean;
  instagram_url: string | null;
  website_url_clean: string | null;
}

export interface AlternativeShop {
  alt_shop_id: string;
  alt_shop_name: string;
  same_mall: boolean;
  distance_meters: number;
  shared_categories_count: number;
  score: number;
}

export interface StoreDetail {
  shop_id: string;
  name: string;
  address: string;
  is_real_shop: boolean;
  navigation: StoreNavigation;
  hours: StoreHours;
  payments: PaymentConditions;
  lat: number;
  lon: number;
  instagram_url: string | null;
  website_url_clean: string | null;
  alternative_shops: AlternativeShop[];
}

export interface MallInfo {
  mall_name: string;
  is_major_hub: boolean;
  location_label: string | null;
  shops_count_in_dataset: number;
  top_categories: string[];
  typical_hours: string | null;
  coordinates: Record<string, number>;
  google_maps_widget_url: string | null;
  nearest_metro: string | null;
  traffic_zone: string | null;
  parking_info: string | null;
  known_for: string | null;
}

export interface BazaarHub {
  category_name: string;
  total_shops: number;
  hub_confidence: string;
  installment_shops: number;
  top_neighborhoods: string | null;
  top_streets: string | null;
  top_malls: string | null;
  center_lat: number | null;
  center_lon: number | null;
  google_maps_url: string | null;
  neshan_maps_url: string | null;
  agent_recommendation_text: string | null;
}

export interface InquiryResponse {
  offer_id: string;
  shop_id: string;
  simulation_disclaimer: string;
  in_stock: boolean;
  confirmed_price_toman: number;
  price_changed: boolean;
  seller_message: string;
  recommended_action: string;
}

export interface UIBlock {
  type: string;
  data: any;
}
