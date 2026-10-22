import math
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.models import StoreOfferItem
from app.repository import DataRepository

EARTH_RADIUS_METERS = 6371000.0

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two points on Earth in meters.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) *
         math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_METERS * c

def is_store_open_now(clean_weekly_hours: Optional[dict]) -> Optional[bool]:
    """
    Determines whether a store is currently open based on Tehran time (UTC+3:30).
    Returns True if open, False if closed, None if hours are unknown.
    """
    if not clean_weekly_hours:
        return None

    # Tehran timezone is UTC+3:30
    tehran_tz = timezone(timedelta(hours=3, minutes=30))
    now = datetime.now(tehran_tz)
    
    # Python weekday(): 0 is Monday, 5 is Saturday, 6 is Sunday
    # In Persian / Iran calendar:
    # Saturday -> 'sat'
    # Sunday -> 'sun'
    # Monday -> 'mon'
    # Tuesday -> 'tue'
    # Wednesday -> 'wed'
    # Thursday -> 'thu'
    # Friday -> 'fri'
    day_map = {
        5: "sat",
        6: "sun",
        0: "mon",
        1: "tue",
        2: "wed",
        3: "thu",
        4: "fri"
    }
    today_key = day_map.get(now.weekday())
    if not today_key or today_key not in clean_weekly_hours:
        return None

    hours_str = clean_weekly_hours[today_key]
    if not hours_str or "بسته" in hours_str:
        return False

    # Attempt to parse shift string e.g. "10:00 - 21:00"
    try:
        parts = hours_str.replace(" ", "").split("-")
        if len(parts) == 2:
            start_parts = [int(p) for p in parts[0].split(":")]
            end_parts = [int(p) for p in parts[1].split(":")]
            start_time = now.replace(hour=start_parts[0], minute=start_parts[1], second=0, microsecond=0)
            end_time = now.replace(hour=end_parts[0], minute=end_parts[1], second=0, microsecond=0)
            return start_time <= now <= end_time
    except Exception:
        pass

    return None

class SearchService:
    def __init__(self, repo: DataRepository):
        self.repo = repo

    def get_filtered_product_offers(
        self,
        product_id: str,
        user_lat: Optional[float] = None,
        user_lon: Optional[float] = None,
        max_radius_meters: Optional[float] = None,
        min_budget_toman: Optional[float] = None,
        max_budget_toman: Optional[float] = None,
        installment_only: bool = False,
        open_now_only: bool = False,
        sort_by: str = "price" # 'price', 'distance', 'balanced'
    ) -> List[StoreOfferItem]:
        """
        Retrieves, annotates with distance, filters, and ranks store offers for a product.
        """
        offers = self.repo.get_offers_for_product(
            product_id=product_id,
            installment_only=installment_only
        )

        filtered: List[StoreOfferItem] = []
        for offer in offers:
            # 1. Budget filters
            if min_budget_toman is not None and offer.price.amount_toman < min_budget_toman:
                continue
            if max_budget_toman is not None and offer.price.amount_toman > max_budget_toman:
                continue

            # 2. Distance calculation
            if user_lat is not None and user_lon is not None and offer.lat and offer.lon:
                dist = calculate_haversine_distance(user_lat, user_lon, offer.lat, offer.lon)
                offer.distance_meters = round(dist, 1)
                if max_radius_meters is not None and dist > max_radius_meters:
                    continue

            # 3. Open now filter
            if open_now_only:
                open_status = is_store_open_now(offer.hours.clean_weekly_hours_json)
                if open_status is not True:
                    continue

            filtered.append(offer)

        # 4. Sorting
        if sort_by == "distance":
            filtered.sort(key=lambda o: (o.distance_meters is None, o.distance_meters or 0.0, o.price.amount_toman))
        elif sort_by == "balanced":
            # Balanced ranking: considers price ratio, proximity, and freshness
            def rank_score(o: StoreOfferItem) -> float:
                score = 0.0
                score += (o.price.amount_toman / 100000.0) # Price component
                if o.distance_meters is not None:
                    score += (o.distance_meters / 500.0) # Distance penalty
                if o.price.needs_seller_call:
                    score += 50.0 # Stale price penalty
                return score
            filtered.sort(key=rank_score)
        else:
            # Default: price ascending
            filtered.sort(key=lambda o: (o.price.amount_toman, o.distance_meters or 0.0))

        return filtered
