from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# --- Sub-models ---

class PriceInfo(BaseModel):
    amount_toman: float
    last_changed_at: Optional[str] = None
    age_days: Optional[float] = None
    freshness_label: str
    needs_seller_call: bool
    call_reason: str

class StoreNavigation(BaseModel):
    is_inside_mall: bool
    mall_name_clean: Optional[str] = None
    floor_clean: Optional[str] = None
    unit_clean: Optional[str] = None
    indoor_navigation_hint: Optional[str] = None
    main_street: Optional[str] = None
    location_label: Optional[str] = None

class StoreHours(BaseModel):
    hours_data_quality: str
    is_hours_estimated: bool
    effective_sat_to_wed_hours: Optional[str] = None
    thu_hours: Optional[str] = None
    open_on_friday: bool
    clean_weekly_hours_json: Optional[Dict[str, str]] = None

class PaymentConditions(BaseModel):
    has_installment: bool
    has_torob_pay: bool
    has_snapp_pay: bool
    has_digi_pay: bool
    has_tara: bool
    payment_providers: Optional[str] = None

class BuyingGuide(BaseModel):
    market_price_summary: Any
    highlights_and_pros: List[str]
    in_person_buying_checklist: List[str]

# --- Main Entities ---

class ProductSummary(BaseModel):
    product_id: str
    category_name: str
    persian_title_clean: str
    brand_clean: Optional[str] = None
    model_clean: Optional[str] = None
    condition: str
    condition_source: str
    authenticity: str
    specs_count: int
    specs_summary: Optional[str] = None
    primary_image_url: Optional[str] = None
    min_price_toman: Optional[float] = None
    max_price_toman: Optional[float] = None
    offers_count: int = 0

class ProductDetail(ProductSummary):
    buying_guide: Optional[BuyingGuide] = None

class StoreOfferItem(BaseModel):
    offer_id: str
    shop_id: str
    product_id: str
    shop_name: str
    is_real_shop: bool
    price: PriceInfo
    navigation: StoreNavigation
    hours: StoreHours
    payments: PaymentConditions
    distance_meters: Optional[float] = None
    lat: float
    lon: float
    warranty_clean: str
    has_warranty: bool
    instagram_url: Optional[str] = None
    website_url_clean: Optional[str] = None

class AlternativeShop(BaseModel):
    alt_shop_id: str
    alt_shop_name: str
    same_mall: bool
    distance_meters: float
    shared_categories_count: int
    score: float

class StoreDetail(BaseModel):
    shop_id: str
    name: str
    address: str
    is_real_shop: bool
    navigation: StoreNavigation
    hours: StoreHours
    payments: PaymentConditions
    lat: float
    lon: float
    instagram_url: Optional[str] = None
    website_url_clean: Optional[str] = None
    alternative_shops: List[AlternativeShop] = Field(default_factory=list)

class MallInfo(BaseModel):
    mall_name: str
    is_major_hub: bool
    location_label: Optional[str] = None
    shops_count_in_dataset: int
    top_categories: List[str] = Field(default_factory=list)
    typical_hours: Optional[str] = None
    coordinates: Dict[str, float] = Field(default_factory=dict)
    google_maps_widget_url: Optional[str] = None
    nearest_metro: Optional[str] = None
    traffic_zone: Optional[str] = None
    parking_info: Optional[str] = None
    known_for: Optional[str] = None

class BazaarHub(BaseModel):
    category_name: str
    total_shops: int
    hub_confidence: str
    installment_shops: int
    top_neighborhoods: Optional[str] = None
    top_streets: Optional[str] = None
    top_malls: Optional[str] = None
    center_lat: Optional[float] = None
    center_lon: Optional[float] = None
    google_maps_url: Optional[str] = None
    neshan_maps_url: Optional[str] = None
    agent_recommendation_text: Optional[str] = None

# --- In-App Seller Simulation ---

class InquiryRequest(BaseModel):
    offer_id: str
    inquiry_type: str = "stock_and_price" # "stock_and_price", "hours", "specs"
    user_note: Optional[str] = None

class InquiryResponse(BaseModel):
    offer_id: str
    shop_id: str
    simulation_disclaimer: str = "پاسخ استعلام شبیه‌سازی‌شده بر اساس سابقه و وضعیت فروشگاه در ترب است."
    in_stock: bool
    confirmed_price_toman: float
    price_changed: bool
    seller_message: str
    recommended_action: str

# --- Chat & Generative UI ---

class ChatContext(BaseModel):
    user_lat: Optional[float] = None
    user_lon: Optional[float] = None
    area_name: Optional[str] = None
    selected_product_id: Optional[str] = None
    selected_shop_id: Optional[str] = None

class ChatRequest(BaseModel):
    session_id: str
    message: str
    context: Optional[ChatContext] = None

class UIBlock(BaseModel):
    type: str # One of allowlisted component types
    data: Dict[str, Any]
