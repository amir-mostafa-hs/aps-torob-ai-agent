import pytest
from app.database import get_source_db_connection
from app.repository import DataRepository

@pytest.fixture
def repo():
    return DataRepository()

def test_source_db_connection_read_only():
    conn = get_source_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM products;")
    assert cur.fetchone()[0] == 225903
    
    # Verify read-only enforcement: write attempt must raise OperationalError
    with pytest.raises(Exception):
        cur.execute("CREATE TABLE test_fail (id INT);")
    conn.close()

def test_search_products_persian_and_english(repo):
    # Search for iPhone / آیفون
    results_fa = repo.search_products(query="آیفون", limit=5)
    assert len(results_fa) > 0
    assert any("آیفون" in p.persian_title_clean or "iPhone" in p.persian_title_clean for p in results_fa)

    results_en = repo.search_products(query="Samsung", limit=5)
    assert len(results_en) > 0
    assert any("سامسونگ" in p.persian_title_clean or "Samsung" in p.persian_title_clean for p in results_en)

def test_get_product_detail_with_buying_guide(repo):
    # Top product with buying guide
    pid = "product_3d232904551de256df85f09c"
    product = repo.get_product_detail(pid)
    assert product is not None
    assert product.product_id == pid
    assert product.buying_guide is not None
    assert len(product.buying_guide.highlights_and_pros) > 0

def test_get_offers_for_product_and_installment_filter(repo):
    # Find a product with multiple offers
    products = repo.search_products(query="دوربین مداربسته", limit=5)
    assert len(products) > 0
    pid = products[0].product_id
    
    offers = repo.get_offers_for_product(pid)
    assert len(offers) > 0
    for offer in offers:
        assert offer.product_id == pid
        assert offer.price.amount_toman > 0
        assert offer.navigation is not None
        # Verify fake phone is NOT exposed
        assert not hasattr(offer, "phone") or getattr(offer, "phone", None) is None

def test_bazaar_hub_lookup(repo):
    bazaar = repo.get_bazaar_recommendation("لوازم خانگی")
    assert bazaar is not None
    assert bazaar.category_name == "لوازم خانگی" or "لوازم" in bazaar.category_name
