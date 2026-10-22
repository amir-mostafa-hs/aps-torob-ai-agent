from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Path, Body
from fastapi.middleware.cors import CORSMiddleware

from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.database import get_source_db_connection
from app.models import (
    ProductSummary, ProductDetail, StoreOfferItem, StoreDetail,
    MallInfo, BazaarHub, InquiryRequest, InquiryResponse, ChatRequest
)
from app.repository import DataRepository
from app.services.search_service import SearchService
from app.services.inquiry_service import InquiryService
from app.services.session_service import SessionService
from app.services.agent_service import AgentService

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API for Torob In-Person Shopping Assistant"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate core singletons
repo = DataRepository()
search_service = SearchService(repo)
inquiry_service = InquiryService(repo)
session_service = SessionService()
agent_service = AgentService(repo, search_service, inquiry_service, session_service)

# --- Health & Observability ---

@app.get("/api/v1/health", tags=["System"])
def health_check():
    """
    Health and readiness probe. Distinguishes DB availability and returns row counts.
    """
    try:
        conn = get_source_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM products;")
        total_products = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM shops;")
        total_shops = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM offers;")
        total_offers = cur.fetchone()[0]
        conn.close()
        return {
            "status": "ok",
            "database": "connected",
            "total_products": total_products,
            "total_shops": total_shops,
            "total_offers": total_offers
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

# --- Products API ---

@app.get("/api/v1/products/search", tags=["Products"])
def search_products(
    q: str = Query(..., description="Persian or English search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    items = repo.search_products(query=q, category=category, brand=brand, limit=limit, offset=offset)
    return {
        "query": q,
        "total": len(items),
        "limit": limit,
        "offset": offset,
        "items": items
    }

@app.get("/api/v1/products/{product_id}", response_model=ProductDetail, tags=["Products"])
def get_product(product_id: str = Path(...)):
    product = repo.get_product_detail(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/api/v1/products/{product_id}/shops", tags=["Products"])
def get_product_shops(
    product_id: str = Path(...),
    user_lat: Optional[float] = Query(None),
    user_lon: Optional[float] = Query(None),
    max_radius_meters: Optional[float] = Query(None),
    min_budget: Optional[float] = Query(None),
    max_budget: Optional[float] = Query(None),
    installment_only: bool = Query(False),
    open_now: bool = Query(False),
    sort_by: str = Query("price", pattern="^(price|distance|balanced)$")
):
    offers = search_service.get_filtered_product_offers(
        product_id=product_id,
        user_lat=user_lat,
        user_lon=user_lon,
        max_radius_meters=max_radius_meters,
        min_budget_toman=min_budget,
        max_budget_toman=max_budget,
        installment_only=installment_only,
        open_now_only=open_now,
        sort_by=sort_by
    )
    return {
        "product_id": product_id,
        "total_offers": len(offers),
        "offers": offers
    }

# --- Shops API ---

@app.get("/api/v1/shops/{shop_id}", response_model=StoreDetail, tags=["Shops"])
def get_shop(shop_id: str = Path(...)):
    shop = repo.get_shop_detail(shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop

# --- Malls & Bazaars API ---

@app.get("/api/v1/malls/{mall_name}", response_model=MallInfo, tags=["Malls"])
def get_mall(mall_name: str = Path(...)):
    mall = repo.get_mall_info(mall_name)
    if not mall:
        raise HTTPException(status_code=404, detail="Mall not found in directory")
    return mall

@app.get("/api/v1/bazaars/{category_name}", response_model=BazaarHub, tags=["Bazaars"])
def get_bazaar(category_name: str = Path(...)):
    bazaar = repo.get_bazaar_recommendation(category_name)
    if not bazaar:
        raise HTTPException(status_code=404, detail="Bazaar not found for category")
    return bazaar

# --- Simulated Inquiry API ---

@app.post("/api/v1/inquiry/simulate", response_model=InquiryResponse, tags=["Inquiry"])
def simulate_seller_inquiry(req: InquiryRequest):
    return inquiry_service.simulate_inquiry(
        offer_id=req.offer_id,
        inquiry_type=req.inquiry_type,
        user_note=req.user_note
    )

# --- Anonymous Session State API ---

@app.post("/api/v1/session/state", tags=["Session"])
def save_session_state(
    session_id: str = Query(...),
    state: Dict[str, Any] = Body(...)
):
    session_service.save_state(session_id, state)
    return {"status": "saved", "session_id": session_id}

@app.get("/api/v1/session/{session_id}", tags=["Session"])
def get_session_state(session_id: str = Path(...)):
    return {
        "session_id": session_id,
        "state": session_service.get_state(session_id)
    }

@app.post("/api/v1/session/reset", tags=["Session"])
def reset_session(session_id: str = Query(...)):
    session_service.reset_session(session_id)
    return {"status": "reset", "session_id": session_id}

# --- Agent Chat & Generative UI (SSE Streaming) ---

@app.post("/api/v1/agent/chat", tags=["Agent"])
def agent_chat(req: ChatRequest):
    """
    Streaming SSE agent chat with intent reasoning, tool-calling loop, and Generative UI blocks.
    """
    return EventSourceResponse(agent_service.stream_chat(req))

