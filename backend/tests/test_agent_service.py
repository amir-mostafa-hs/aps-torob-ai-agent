import json
import pytest
from app.models import ChatRequest, ChatContext
from app.repository import DataRepository
from app.services.search_service import SearchService
from app.services.inquiry_service import InquiryService
from app.services.session_service import SessionService
from app.services.agent_service import AgentService
from app.services.llm_client import LLMClient

@pytest.fixture
def agent():
    repo = DataRepository()
    search_svc = SearchService(repo)
    inquiry_svc = InquiryService(repo)
    session_svc = SessionService()
    # Uses offline mock client
    mock_llm = LLMClient(provider="mock")
    return AgentService(repo, search_svc, inquiry_svc, session_svc, mock_llm)

def test_agent_stream_product_search(agent):
    req = ChatRequest(
        session_id="test-agent-sess-1",
        message="یه گوشی سامسونگ می‌خوام",
        context=ChatContext(area_name="ونک")
    )
    events = list(agent.stream_chat(req))
    assert len(events) >= 3
    
    event_types = [e["event"] for e in events]
    assert "thinking" in event_types
    assert "tool_start" in event_types
    assert "tool_done" in event_types
    assert "ui_block" in event_types
    assert "done" in event_types

    # Verify UI block
    ui_block_events = [e for e in events if e["event"] == "ui_block"]
    assert len(ui_block_events) > 0
    block_data = json.loads(ui_block_events[0]["data"])
    assert block_data["type"] == "ProductCardList"
    assert len(block_data["data"]["products"]) > 0

def test_agent_stream_mall_navigation(agent):
    req = ChatRequest(
        session_id="test-agent-sess-2",
        message="پاساژ علاءالدین چطوری برم؟"
    )
    events = list(agent.stream_chat(req))
    event_types = [e["event"] for e in events]
    assert "ui_block" in event_types
    ui_block_events = [e for e in events if e["event"] == "ui_block"]
    block_data = json.loads(ui_block_events[0]["data"])
    assert block_data["type"] == "MallNavigationCard"
    assert "علاءالدین" in block_data["data"]["mall_name"]
