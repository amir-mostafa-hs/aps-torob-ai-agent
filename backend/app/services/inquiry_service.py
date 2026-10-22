import json
from typing import Optional
from app.database import get_source_db_connection
from app.models import InquiryResponse
from app.repository import DataRepository

class InquiryService:
    def __init__(self, repo: DataRepository):
        self.repo = repo

    def simulate_inquiry(
        self,
        offer_id: str,
        inquiry_type: str = "stock_and_price",
        user_note: Optional[str] = None
    ) -> InquiryResponse:
        """
        Simulates an in-app seller inquiry grounded in audited offer state.
        Never calls fake phone numbers or claims actual live message delivery.
        """
        conn = get_source_db_connection()
        cur = conn.cursor()
        sql = """
        SELECT 
            o.offer_id, o.shop_id, o.price_toman, o.mock_seller_state_json,
            o.needs_seller_call, o.call_reason, s.name AS shop_name,
            s.mall_name_clean, s.floor_clean, s.unit_clean
        FROM offers o
        JOIN shops s ON s.shop_id = o.shop_id
        WHERE o.offer_id = ?;
        """
        try:
            cur.execute(sql, (offer_id,))
            r = cur.fetchone()
            if not r:
                return InquiryResponse(
                    offer_id=offer_id,
                    shop_id="",
                    simulation_disclaimer="استعلام شبیه‌سازی‌شده (آفر یافت نشد)",
                    in_stock=False,
                    confirmed_price_toman=0.0,
                    price_changed=False,
                    seller_message="متأسفانه اطلاعات این آگهی در دسترس نیست.",
                    recommended_action="انتخاب فروشگاه دیگر"
                )

            # Default values
            in_stock = True
            confirmed_price = r["price_toman"] or 0.0
            price_changed = False
            seller_msg = (
                f"سلام، کالا در فروشگاه {r['shop_name']} موجود است. "
                f"قیمت: {int(confirmed_price):,} تومان. "
            )
            if r["is_inside_mall"] if "is_inside_mall" in r.keys() else r["mall_name_clean"]:
                seller_msg += f"آدرس: {r['mall_name_clean'] or ''} {r['floor_clean'] or ''} {r['unit_clean'] or ''}."

            if r["mock_seller_state_json"]:
                try:
                    mock_data = json.loads(r["mock_seller_state_json"])
                    in_stock = mock_data.get("in_stock", True)
                    confirmed_price = float(mock_data.get("confirmed_price_toman", confirmed_price))
                    price_changed = mock_data.get("price_changed", False)
                    if mock_data.get("seller_message"):
                        seller_msg = mock_data["seller_message"]
                except Exception:
                    pass

            recommended_action = "مراجعه حضوری به فروشگاه" if in_stock else "بررسی فروشگاه‌های جایگزین"

            return InquiryResponse(
                offer_id=offer_id,
                shop_id=r["shop_id"],
                simulation_disclaimer="پاسخ استعلام شبیه‌سازی‌شده بر اساس سابقه و وضعیت فروشگاه در ترب است.",
                in_stock=in_stock,
                confirmed_price_toman=confirmed_price,
                price_changed=price_changed,
                seller_message=seller_msg,
                recommended_action=recommended_action
            )
        finally:
            conn.close()
