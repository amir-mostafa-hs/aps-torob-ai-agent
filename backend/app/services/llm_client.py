import json
import logging
from typing import List, Dict, Any, Optional, Generator
import httpx

from app.config import settings

logger = logging.getLogger(__name__)

class LLMClient:
    """
    Unified client for OpenAI-compatible LLM endpoints (BoxAPI & Google AI Studio/Gemini).
    Includes a deterministic offline fallback mode for reliable testing without external API spend.
    """
    def __init__(
        self,
        provider: Optional[str] = None,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ):
        self.provider = provider or settings.LLM_PROVIDER
        if self.provider == "boxapi":
            self.base_url = (base_url or settings.BOXAPI_BASE_URL).rstrip("/")
            self.api_key = api_key or settings.BOXAPI_API_KEY
            self.model = model or settings.BOXAPI_MODEL
        elif self.provider == "gemini":
            self.base_url = (base_url or settings.GEMINI_BASE_URL).rstrip("/")
            self.api_key = api_key or settings.GEMINI_API_KEY
            self.model = model or settings.GEMINI_MODEL
        else:
            self.provider = "mock"
            self.base_url = ""
            self.api_key = ""
            self.model = "mock-agent"

    def chat_completion(
        self,
        messages: List[Dict[str, Any]],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Executes a chat completion request.
        If provider is 'mock' or API key is not configured, returns deterministic intent responses.
        """
        if self.provider == "mock" or not self.api_key:
            return self._mock_completion(messages, tools)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"

        url = f"{self.base_url}/chat/completions"
        try:
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, headers=headers, json=payload)
                res.raise_for_status()
                data = res.json()
                choice = data["choices"][0]["message"]
                return choice
        except Exception as e:
            logger.warning(f"LLM request to {self.provider} failed: {e}. Falling back to deterministic mock response.")
            return self._mock_completion(messages, tools)

    def _mock_completion(
        self,
        messages: List[Dict[str, Any]],
        tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Deterministic mock LLM response for local testing and offline execution.
        Recognizes core Persian keywords to trigger appropriate tool calls.
        """
        user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                content = m.get("content", "")
                if isinstance(content, str):
                    user_msg = content
                break

        # Check if previous message was a tool result
        last_msg = messages[-1] if messages else {}
        if last_msg.get("role") == "tool":
            return {
                "role": "assistant",
                "content": "با بررسی اطلاعات کاتالوگ و فروشگاه‌های ترب، گزینه‌های بالا مطابق با خواسته شما پیشنهاد شدند. می‌توانید با استفاده از کارت‌ها، جزئیات هر فروشگاه یا راهنمای داخل پاساژ را مشاهده کنید."
            }

        # Intent detection based on user query
        product_keywords = ["کتونی", "کفش", "سامسونگ", "گوشی", "لپ‌تاپ", "لپتاپ", "دوربین", "سونی", "آیفون", "شارژر"]
        matched_kw = next((w for w in product_keywords if w in user_msg), None)
        if matched_kw:
            # Trigger search_products tool with the clean matched product keyword
            return {
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {
                        "id": "call_mock_search_1",
                        "type": "function",
                        "function": {
                            "name": "search_products",
                            "arguments": json.dumps({"query": matched_kw}, ensure_ascii=False)
                        }
                    }
                ]
            }
        elif "پاساژ" in user_msg or "علاءالدین" in user_msg or "چارسو" in user_msg:
            return {
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {
                        "id": "call_mock_mall_1",
                        "type": "function",
                        "function": {
                            "name": "get_mall_navigation",
                            "arguments": json.dumps({"mall_name": "پاساژ علاءالدین"}, ensure_ascii=False)
                        }
                    }
                ]
            }
        else:
            return {
                "role": "assistant",
                "content": "سلام! من دستیار خرید حضوری ترب در تهران هستم. نام یا مدل کالای مورد نظرتان، یا محدوده مورد نظر برای خرید حضوری را بفرمایید تا فروشگاه‌های نزدیک و باز را برایتان بررسی کنم."
            }
