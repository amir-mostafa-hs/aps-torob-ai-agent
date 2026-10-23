import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_health_endpoint(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["total_products"] == 225903
    assert data["total_shops"] == 6476
    assert data["total_offers"] == 331506

def test_product_search_api(client):
    res = client.get("/api/v1/products/search?q=سامسونگ&limit=3")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["items"]) <= 3
    assert "سامسونگ" in data["items"][0]["persian_title_clean"] or "Samsung" in data["items"][0]["persian_title_clean"]

def test_product_detail_api(client):
    # Search first to get a valid product
    res_search = client.get("/api/v1/products/search?q=آیفون&limit=1")
    assert res_search.status_code == 200
    pid = res_search.json()["items"][0]["product_id"]

    res = client.get(f"/api/v1/products/{pid}")
    assert res.status_code == 200
    data = res.json()
    assert data["product_id"] == pid
    assert data["condition"] in ["نو", "استوک", "کارکرده"]

def test_product_shops_api(client):
    res_search = client.get("/api/v1/products/search?q=دوربین مداربسته&limit=1")
    pid = res_search.json()["items"][0]["product_id"]

    res = client.get(f"/api/v1/products/{pid}/shops?user_lat=35.71&user_lon=51.41&sort_by=price")
    assert res.status_code == 200
    data = res.json()
    assert data["total_offers"] > 0
    assert len(data["offers"]) > 0
    # Assert phone number is NOT present in any shop offer
    for offer in data["offers"]:
        assert "phone" not in offer
        assert "primary_phone" not in offer

def test_inquiry_simulation_api(client):
    res_search = client.get("/api/v1/products/search?q=دوربین مداربسته&limit=1")
    pid = res_search.json()["items"][0]["product_id"]
    res_shops = client.get(f"/api/v1/products/{pid}/shops")
    offer_id = res_shops.json()["offers"][0]["offer_id"]

    payload = {
        "offer_id": offer_id,
        "inquiry_type": "stock_and_price",
        "user_note": "می‌خواهم بعدازظهر حضوری مراجعه کنم"
    }
    res = client.post("/api/v1/inquiry/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["offer_id"] == offer_id
    assert "شبیه‌سازی" in data["simulation_disclaimer"]
    assert data["confirmed_price_toman"] > 0

def test_cors_origins_validator():
    from app.config import Settings
    assert Settings.assemble_cors_origins("*") == ["*"]
    assert Settings.assemble_cors_origins('["http://localhost:3000", "https://torob.ir"]') == ["http://localhost:3000", "https://torob.ir"]
    assert Settings.assemble_cors_origins("http://localhost:3000, https://torob.ir") == ["http://localhost:3000", "https://torob.ir"]
    assert Settings.assemble_cors_origins(["*"]) == ["*"]
