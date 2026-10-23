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
        import re
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
            tool_content = last_msg.get("content", "")
            if "bazaar_hub" in tool_content or "agent_recommendation_text" in tool_content:
                return {
                    "role": "assistant",
                    "content": "در حال حاضر فروشگاه تکی با موجودی قطعی برای این کالا ثبت نشده است؛ اما بورس اصلی این دسته کالا در تهران روی کارت و نقشه زیر مشخص شد تا بتوانید برای خرید حضوری مراجعه فرمایید."
                }
            if '"count": 0' in tool_content or '"total_offers": 0' in tool_content:
                return {
                    "role": "assistant",
                    "content": "متأسفانه برای این مورد نتیجه مستقیمی در فروشگاه‌های نزدیک یافت نشد. می‌توانید با دسته‌بندی کلی‌تر یا مدل مشابه جستجو فرمایید."
                }
            if "mall_name" in tool_content or "nearest_metro" in tool_content:
                return {
                    "role": "assistant",
                    "content": "راهنمای موقعیت، طبقات و مسیرهای دسترسی پاساژ روی کارت و نقشه زیر مشخص است. برای مسیریابی می‌توانید از نرم‌افزارهای نشان، بلد یا گوگل مپ استفاده کنید."
                }
            return {
                "role": "assistant",
                "content": "با بررسی اطلاعات کاتالوگ و فروشگاه‌های ترب، گزینه‌های بالا مطابق با خواسته شما پیشنهاد شدند. می‌توانید با استفاده از کارت‌ها، جزئیات هر فروشگاه یا راهنمای داخل پاساژ را مشاهده کنید."
            }

        clean_msg = user_msg.strip()

        # Check for gibberish or unintelligible English non-words
        is_english_gibberish = bool(re.match(r"^[a-zA-Z0-9_\-\s]+$", clean_msg)) and not any(
            w in clean_msg.lower() for w in ["laptop", "mobile", "samsung", "asus", "lenovo", "apple", "iphone", "sony", "nike", "shoe", "charger", "airpod", "headphone"]
        )
        if is_english_gibberish or len(clean_msg) < 2:
            return {
                "role": "assistant",
                "content": f"کالایی با عنوان «{clean_msg}» در کاتالوگ فروشگاه‌های ترب یافت نشد.\n\nلطفاً نام یا دسته‌بندی کالای مورد نظرتان (مثلاً: لپ‌تاپ لنوو، گوشی سامسونگ، کتونی، شارژر...) را به فارسی یا انگلیسی بنویسید تا بتوانم موجودی و قیمت مغازه‌های تهران را برایتان بررسی کنم."
            }

        # Check for Map / Navigation intent
        if any(w in clean_msg for w in ["نقشه", "مسیریابی", "لوکیشن", "آدرس", "کجاست"]):
            mall_to_nav = "پاساژ چارسو"
            for m in ["علاءالدین", "چارسو", "پایتخت", "پالادیوم", "کوروش", "ارگ", "تندیس"]:
                if m in clean_msg:
                    mall_to_nav = f"پاساژ {m}" if not m.startswith("پاساژ") and not m.startswith("بازار") else m
                    break
            return {
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {
                        "id": "call_mock_mall_nav",
                        "type": "function",
                        "function": {
                            "name": "get_mall_navigation",
                            "arguments": json.dumps({"mall_name": mall_to_nav}, ensure_ascii=False)
                        }
                    }
                ]
            }

        # Check for Bazaar / Hub intent
        if any(w in clean_msg for w in ["بورس", "مرکز خرید", "کجا بخرم", "بازار"]):
            return {
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {
                        "id": "call_mock_bazaar",
                        "type": "function",
                        "function": {
                            "name": "suggest_alternatives",
                            "arguments": json.dumps({"category_name": "لپ تاپ و نوت بوک"}, ensure_ascii=False)
                        }
                    }
                ]
            }

        product_keywords = ["کتونی", "کفش", "سامسونگ", "گوشی", "لپ‌تاپ", "لپتاپ", "دوربین", "سونی", "آیفون", "شارژر", "تبلت", "ساعت", "هندزفری", "ایرپاد"]
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
        elif "پاساژ" in user_msg:
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
