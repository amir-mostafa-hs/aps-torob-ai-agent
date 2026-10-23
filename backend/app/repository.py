import json
import os
import sqlite3
from typing import List, Optional, Dict, Any

from app.config import settings
from app.database import get_source_db_connection
from app.normalizer import build_fts5_query, normalize_persian_text
from app.models import (
    ProductSummary, ProductDetail, BuyingGuide, StoreOfferItem,
    PriceInfo, StoreNavigation, StoreHours, PaymentConditions,
    StoreDetail, AlternativeShop, MallInfo, BazaarHub
)

class DataRepository:
    def __init__(self):
        # In-memory caches for fast JSON lookups
        self.malls_cache: Dict[str, Any] = {}
        self.guides_cache: Dict[str, Any] = {}
        self._load_caches()

    def _load_caches(self):
        if os.path.exists(settings.MALLS_PATH):
            try:
                with open(settings.MALLS_PATH, "r", encoding="utf-8") as f:
                    self.malls_cache = json.load(f)
            except Exception:
                self.malls_cache = {}

        if os.path.exists(settings.GUIDES_PATH):
            try:
                with open(settings.GUIDES_PATH, "r", encoding="utf-8") as f:
                    self.guides_cache = json.load(f)
            except Exception:
                self.guides_cache = {}

    def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[ProductSummary]:
        """
        Performs full-text search on products using FTS5 and optional brand/category filters.
        """
        fts_query = build_fts5_query(query)
        if not fts_query or fts_query == '""':
            return []

        conn = get_source_db_connection()
        cur = conn.cursor()

        sql = """
        SELECT 
            p.product_id,
            p.category_name,
            p.persian_title_clean,
            p.brand_clean,
            p.model_clean,
            p.condition,
            p.condition_source,
            p.authenticity,
            p.specs_count,
            p.specs_summary,
            p.primary_image_url,
            (SELECT MIN(price_toman) FROM offers WHERE product_id = p.product_id) AS min_price,
            (SELECT MAX(price_toman) FROM offers WHERE product_id = p.product_id) AS max_price,
            (SELECT COUNT(*) FROM offers WHERE product_id = p.product_id) AS offers_count
        FROM products_fts f
        JOIN products p ON p.product_id = f.product_id
        WHERE products_fts MATCH ?
        """
        params: List[Any] = [fts_query]

        if category:
            sql += " AND p.category_name = ?"
            params.append(category)
        if brand:
            sql += " AND p.brand_clean = ?"
            params.append(brand)

        sql += " LIMIT ? OFFSET ?;"
        params.extend([limit, offset])

        try:
            cur.execute(sql, params)
            rows = cur.fetchall()
            if not rows and " AND " in fts_query:
                fallback_params = list(params)
                fallback_params[0] = fts_query.replace(" AND ", " OR ")
                cur.execute(sql, fallback_params)
                rows = cur.fetchall()
            results = []
            for r in rows:
                results.append(ProductSummary(
                    product_id=r["product_id"],
                    category_name=r["category_name"],
                    persian_title_clean=r["persian_title_clean"],
                    brand_clean=r["brand_clean"],
                    model_clean=r["model_clean"],
                    condition=r["condition"] or "نو",
                    condition_source=r["condition_source"] or "default_assumed_new",
                    authenticity=r["authenticity"] or "استاندارد / نامشخص",
                    specs_count=r["specs_count"] or 0,
                    specs_summary=r["specs_summary"],
                    primary_image_url=r["primary_image_url"],
                    min_price_toman=r["min_price"],
                    max_price_toman=r["max_price"],
                    offers_count=r["offers_count"] or 0
                ))
            return results
        finally:
            conn.close()

    def get_product_detail(self, product_id: str) -> Optional[ProductDetail]:
        """
        Retrieves detailed product info and attaches buying guide if available.
        """
        conn = get_source_db_connection()
        cur = conn.cursor()
        sql = """
        SELECT 
            p.product_id,
            p.category_name,
            p.persian_title_clean,
            p.brand_clean,
            p.model_clean,
            p.condition,
            p.condition_source,
            p.authenticity,
            p.specs_count,
            p.specs_summary,
            p.primary_image_url,
            (SELECT MIN(price_toman) FROM offers WHERE product_id = p.product_id) AS min_price,
            (SELECT MAX(price_toman) FROM offers WHERE product_id = p.product_id) AS max_price,
            (SELECT COUNT(*) FROM offers WHERE product_id = p.product_id) AS offers_count
        FROM products p
        WHERE p.product_id = ?;
        """
        try:
            cur.execute(sql, (product_id,))
            r = cur.fetchone()
            if not r:
                return None

            buying_guide = None
            if product_id in self.guides_cache:
                guide_data = self.guides_cache[product_id]
                buying_guide = BuyingGuide(
                    market_price_summary=guide_data.get("market_price_summary", ""),
                    highlights_and_pros=guide_data.get("highlights_and_pros", []),
                    in_person_buying_checklist=guide_data.get("in_person_buying_checklist", [])
                )

            return ProductDetail(
                product_id=r["product_id"],
                category_name=r["category_name"],
                persian_title_clean=r["persian_title_clean"],
                brand_clean=r["brand_clean"],
                model_clean=r["model_clean"],
                condition=r["condition"] or "نو",
                condition_source=r["condition_source"] or "default_assumed_new",
                authenticity=r["authenticity"] or "استاندارد / نامشخص",
                specs_count=r["specs_count"] or 0,
                specs_summary=r["specs_summary"],
                primary_image_url=r["primary_image_url"],
                min_price_toman=r["min_price"],
                max_price_toman=r["max_price"],
                offers_count=r["offers_count"] or 0,
                buying_guide=buying_guide
            )
        finally:
            conn.close()

    def get_offers_for_product(
        self,
        product_id: str,
        installment_only: bool = False
    ) -> List[StoreOfferItem]:
        """
        Retrieves all physical store offers for a product, with store navigation and hours.
        NEVER exposes fake phone numbers.
        """
        conn = get_source_db_connection()
        cur = conn.cursor()

        sql = """
        SELECT 
            o.offer_id,
            o.shop_id,
            o.price_toman,
            o.last_price_changed_at,
            o.price_age_days,
            o.price_freshness_label,
            o.needs_seller_call,
            o.call_reason,
            o.warranty_clean,
            o.has_warranty,
            s.name AS shop_name,
            s.is_real_shop,
            s.lat,
            s.lon,
            s.main_street,
            s.mall_name_clean,
            s.floor_clean,
            s.unit_clean,
            s.indoor_navigation_hint,
            s.is_inside_mall,
            s.location_label,
            s.hours_data_quality,
            s.is_hours_estimated,
            s.effective_sat_to_wed_hours,
            s.thu_hours,
            s.open_on_friday,
            s.clean_weekly_hours_json,
            s.has_installment,
            s.has_torob_pay,
            s.has_snapp_pay,
            s.has_digi_pay,
            s.has_tara,
            s.payment_providers,
            s.instagram_url,
            s.website_url_clean
        FROM offers o
        JOIN shops s ON s.shop_id = o.shop_id
        WHERE o.product_id = ?
        """
        params: List[Any] = [product_id]

        if installment_only:
            sql += " AND s.has_installment = 1"

        sql += " ORDER BY o.price_toman ASC;"

        try:
            cur.execute(sql, params)
            rows = cur.fetchall()
            offers = []
            for r in rows:
                weekly_hours = None
                if r["clean_weekly_hours_json"]:
                    try:
                        weekly_hours = json.loads(r["clean_weekly_hours_json"])
                    except Exception:
                        weekly_hours = None

                offers.append(StoreOfferItem(
                    offer_id=r["offer_id"],
                    shop_id=r["shop_id"],
                    product_id=product_id,
                    shop_name=r["shop_name"],
                    is_real_shop=bool(r["is_real_shop"]),
                    price=PriceInfo(
                        amount_toman=r["price_toman"] or 0.0,
                        last_changed_at=r["last_price_changed_at"],
                        age_days=r["price_age_days"],
                        freshness_label=r["price_freshness_label"] or "نامشخص",
                        needs_seller_call=bool(r["needs_seller_call"]),
                        call_reason=r["call_reason"] or "قیمت به‌روز"
                    ),
                    navigation=StoreNavigation(
                        is_inside_mall=bool(r["is_inside_mall"]),
                        mall_name_clean=r["mall_name_clean"],
                        floor_clean=r["floor_clean"],
                        unit_clean=r["unit_clean"],
                        indoor_navigation_hint=r["indoor_navigation_hint"],
                        main_street=r["main_street"],
                        location_label=r["location_label"]
                    ),
                    hours=StoreHours(
                        hours_data_quality=r["hours_data_quality"] or "unknown",
                        is_hours_estimated=bool(r["is_hours_estimated"]),
                        effective_sat_to_wed_hours=r["effective_sat_to_wed_hours"],
                        thu_hours=r["thu_hours"],
                        open_on_friday=bool(r["open_on_friday"]),
                        clean_weekly_hours_json=weekly_hours
                    ),
                    payments=PaymentConditions(
                        has_installment=bool(r["has_installment"]),
                        has_torob_pay=bool(r["has_torob_pay"]),
                        has_snapp_pay=bool(r["has_snapp_pay"]),
                        has_digi_pay=bool(r["has_digi_pay"]),
                        has_tara=bool(r["has_tara"]),
                        payment_providers=r["payment_providers"]
                    ),
                    lat=r["lat"] or 0.0,
                    lon=r["lon"] or 0.0,
                    warranty_clean=r["warranty_clean"] or "نامشخص",
                    has_warranty=bool(r["has_warranty"]),
                    instagram_url=r["instagram_url"],
                    website_url_clean=r["website_url_clean"]
                ))
            return offers
        finally:
            conn.close()

    def get_shop_detail(self, shop_id: str) -> Optional[StoreDetail]:
        """
        Retrieves shop details and parsed alternative shops graph.
        """
        conn = get_source_db_connection()
        cur = conn.cursor()
        sql = """
        SELECT 
            shop_id, name, address, is_real_shop, lat, lon,
            main_street, mall_name_clean, floor_clean, unit_clean,
            indoor_navigation_hint, is_inside_mall, location_label,
            hours_data_quality, is_hours_estimated, effective_sat_to_wed_hours,
            thu_hours, open_on_friday, clean_weekly_hours_json,
            has_installment, has_torob_pay, has_snapp_pay, has_digi_pay, has_tara,
            payment_providers, instagram_url, website_url_clean,
            alternative_shops_json
        FROM shops
        WHERE shop_id = ?;
        """
        try:
            cur.execute(sql, (shop_id,))
            r = cur.fetchone()
            if not r:
                return None

            alts: List[AlternativeShop] = []
            if r["alternative_shops_json"]:
                try:
                    alt_data = json.loads(r["alternative_shops_json"])
                    for a in alt_data:
                        alts.append(AlternativeShop(
                            alt_shop_id=a["alt_shop_id"],
                            alt_shop_name=a["alt_shop_name"],
                            same_mall=a.get("same_mall", False),
                            distance_meters=a.get("distance_meters", 0.0),
                            shared_categories_count=a.get("shared_categories_count", 0),
                            score=a.get("score", 0.0)
                        ))
                except Exception:
                    alts = []

            weekly_hours = None
            if r["clean_weekly_hours_json"]:
                try:
                    weekly_hours = json.loads(r["clean_weekly_hours_json"])
                except Exception:
                    weekly_hours = None

            return StoreDetail(
                shop_id=r["shop_id"],
                name=r["name"],
                address=r["address"],
                is_real_shop=bool(r["is_real_shop"]),
                lat=r["lat"],
                lon=r["lon"],
                navigation=StoreNavigation(
                    is_inside_mall=bool(r["is_inside_mall"]),
                    mall_name_clean=r["mall_name_clean"],
                    floor_clean=r["floor_clean"],
                    unit_clean=r["unit_clean"],
                    indoor_navigation_hint=r["indoor_navigation_hint"],
                    main_street=r["main_street"],
                    location_label=r["location_label"]
                ),
                hours=StoreHours(
                    hours_data_quality=r["hours_data_quality"] or "unknown",
                    is_hours_estimated=bool(r["is_hours_estimated"]),
                    effective_sat_to_wed_hours=r["effective_sat_to_wed_hours"],
                    thu_hours=r["thu_hours"],
                    open_on_friday=bool(r["open_on_friday"]),
                    clean_weekly_hours_json=weekly_hours
                ),
                payments=PaymentConditions(
                    has_installment=bool(r["has_installment"]),
                    has_torob_pay=bool(r["has_torob_pay"]),
                    has_snapp_pay=bool(r["has_snapp_pay"]),
                    has_digi_pay=bool(r["has_digi_pay"]),
                    has_tara=bool(r["has_tara"]),
                    payment_providers=r["payment_providers"]
                ),
                instagram_url=r["instagram_url"],
                website_url_clean=r["website_url_clean"],
                alternative_shops=alts
            )
        finally:
            conn.close()

    def get_mall_info(self, mall_name: str) -> Optional[MallInfo]:
        """
        Retrieves mall details from in-memory directory.
        """
        clean_name = normalize_persian_text(mall_name)
        # Search direct or partial key
        match = self.malls_cache.get(mall_name) or self.malls_cache.get(clean_name)
        if not match:
            for k, v in self.malls_cache.items():
                if clean_name in k or k in clean_name:
                    match = v
                    break
        if not match:
            return None

        return MallInfo(
            mall_name=match.get("mall_name", mall_name),
            is_major_hub=match.get("is_major_hub", False),
            location_label=match.get("location_label"),
            shops_count_in_dataset=match.get("shops_count_in_dataset", 0),
            top_categories=match.get("top_categories", []),
            typical_hours=match.get("typical_hours"),
            coordinates=match.get("coordinates", {}),
            google_maps_widget_url=match.get("google_maps_widget_url"),
            nearest_metro=match.get("nearest_metro"),
            traffic_zone=match.get("traffic_zone"),
            parking_info=match.get("parking_info"),
            known_for=match.get("known_for")
        )

    def get_bazaar_recommendation(self, category_name: str) -> Optional[BazaarHub]:
        """
        Retrieves the commercial bazaar hub recommendation for a category.
        """
        conn = get_source_db_connection()
        cur = conn.cursor()
        sql = """
        SELECT 
            category_name, total_shops, hub_confidence, installment_shops,
            top_neighborhoods, top_streets, top_malls, center_lat, center_lon,
            google_maps_url, neshan_maps_url, agent_recommendation_text
        FROM bazaar_hubs
        WHERE category_name = ? OR category_name LIKE ?
        ORDER BY total_shops DESC
        LIMIT 1;
        """
        try:
            cur.execute(sql, (category_name, f"%{category_name}%"))
            r = cur.fetchone()
            if not r:
                return None
            return BazaarHub(
                category_name=r["category_name"],
                total_shops=r["total_shops"],
                hub_confidence=r["hub_confidence"],
                installment_shops=r["installment_shops"],
                top_neighborhoods=r["top_neighborhoods"],
                top_streets=r["top_streets"],
                top_malls=r["top_malls"],
                center_lat=r["center_lat"],
                center_lon=r["center_lon"],
                google_maps_url=r["google_maps_url"],
                neshan_maps_url=r["neshan_maps_url"],
                agent_recommendation_text=r["agent_recommendation_text"]
            )
        finally:
            conn.close()
