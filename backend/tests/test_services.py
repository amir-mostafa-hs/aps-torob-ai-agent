import pytest
from app.services.search_service import calculate_haversine_distance, SearchService
from app.services.inquiry_service import InquiryService
from app.services.session_service import SessionService
from app.repository import DataRepository

def test_haversine_distance_tehran():
    # Distance between Azadi Square (35.7001, 51.3380) and Enghelab Square (35.7011, 51.3911)
    # Approx 4.8 km
    dist = calculate_haversine_distance(35.7001, 51.3380, 35.7011, 51.3911)
    assert 4500 < dist < 5000

def test_search_service_filter_and_sort(monkeypatch):
    repo = DataRepository()
    service = SearchService(repo)
    
    # Search products
    products = repo.search_products("داهوا", limit=1)
    assert len(products) > 0
    pid = products[0].product_id
    
    # Distance from Vali Asr Square (35.7118, 51.4070)
    offers = service.get_filtered_product_offers(
        product_id=pid,
        user_lat=35.7118,
        user_lon=51.4070,
        max_radius_meters=15000,
        sort_by="distance"
    )
    assert len(offers) > 0
    # First item should have smallest distance
    for i in range(len(offers) - 1):
        assert offers[i].distance_meters <= offers[i+1].distance_meters

def test_inquiry_service_simulation():
    repo = DataRepository()
    inquiry_svc = InquiryService(repo)
    
    products = repo.search_products("دوربین مداربسته", limit=1)
    offers = repo.get_offers_for_product(products[0].product_id)
    assert len(offers) > 0
    
    offer = offers[0]
    res = inquiry_svc.simulate_inquiry(
        offer_id=offer.offer_id,
        inquiry_type="stock_and_price",
        user_note="برای خرید حضوری عصر امروز"
    )
    assert res.offer_id == offer.offer_id
    assert res.shop_id == offer.shop_id
    assert "شبیه‌سازی" in res.simulation_disclaimer
    assert len(res.seller_message) > 0
    assert res.confirmed_price_toman > 0

def test_session_service_lifecycle():
    sess_svc = SessionService()
    session_id = "test-session-uuid-1234"
    
    # Create / update session state
    sess_svc.save_state(session_id, {"area_name": "ونک", "step": 1})
    
    state = sess_svc.get_state(session_id)
    assert state is not None
    assert state.get("area_name") == "ونک"
    assert state.get("step") == 1
    
    # Reset session
    sess_svc.reset_session(session_id)
    state_after = sess_svc.get_state(session_id)
    assert state_after == {}
