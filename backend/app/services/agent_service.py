import json
import logging
from typing import List, Dict, Any, Optional, Generator

from app.models import ChatRequest, ChatContext, UIBlock
from app.repository import DataRepository
from app.services.search_service import SearchService
from app.services.inquiry_service import InquiryService
from app.services.session_service import SessionService
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """شما «دستیار هوشمند خرید حضوری ترب در تهران» هستید.
وظیفه شما راهنمایی خریداران برای کشف مدل مناسب کالا، یافتن فروشگاه‌های فیزیکی نزدیک در تهران، مقایسه قیمت و شرایط اقساط و ساعات کار، و کمک به ناوبری داخل پاساژ است.

اصول و قواعد رفتاری غیرقابل‌تغییر:
۱. فقط بر اساس اطلاعات واقعی موجود در کاتالوگ و فروشگاه‌های ترب پاسخ دهید؛ هرگز محصول یا قیمتی را جعل نکنید.
۲. شماره تلفن‌های موجود در دیتاست آزمایشی و جعلی هستند؛ هرگز شماره‌ای را به کاربر ارائه ندهید و برای تماس پیشنهاد نکنید.
۳. استعلام فروشنده در این نسخه به‌صورت شبیه‌سازی‌شده در داخل برنامه است؛ ادعای ارسال پیامک واقعی نکنید.
۴. پوشش فروشگاه‌ها در تهران انتخابی است؛ اگر در محله‌ای فروشگاهی نبود، بورس کالا در تهران را پیشنهاد دهید.
۵. پاسخ‌ها را به زبان فارسی، کوتاه، شفاف و مستقیم بنویسید. کاربر نیازی به توضیحات طولانی ندارد.
۶. برای جستجو یا استعلام از ابزارهای ارائه‌شده استفاده کنید."""

AGENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "جست‌وجوی کالاهای کاتالوگ با عنوان فارسی/انگلیسی، برند، دسته و حداکثر قیمت",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "متن جستجو یا نام کالا"},
                    "category": {"type": "string", "description": "نام دسته بندی"},
                    "brand": {"type": "string", "description": "نام برند"},
                    "max_price": {"type": "number", "description": "سقف قیمت به تومان"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_shops",
            "description": "یافتن فروشگاه‌های فیزیکی دارای یک محصول خاص در تهران با امکان فیلتر فاصله و اقساط",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "string", "description": "شناسه پایدار کالا"},
                    "max_radius_meters": {"type": "number", "description": "حداکثر شعاع فاصله به متر"},
                    "installment_only": {"type": "boolean", "description": "فقط فروشگاه‌های دارای خرید قسطی"},
                    "open_now": {"type": "boolean", "description": "فقط فروشگاه‌های در حال حاضر باز"}
                },
                "required": ["product_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_mall_navigation",
            "description": "دریافت اطلاعات مجتمع تجاری، طبقه، متروی نزدیک و امکانات پاساژ",
            "parameters": {
                "type": "object",
                "properties": {
                    "mall_name": {"type": "string", "description": "نام پاساژ یا مرکز خرید"}
                },
                "required": ["mall_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "suggest_alternatives",
            "description": "پیشنهاد بورس تخصصی کالا در تهران یا فروشگاه‌های همکار در همان محدوده",
            "parameters": {
                "type": "object",
                "properties": {
                    "category_name": {"type": "string", "description": "نام دسته‌بندی کالا"}
                },
                "required": ["category_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "simulate_inquiry",
            "description": "استعلام شبیه‌سازی‌شده موجودی و قیمت قطعی از فروشگاه",
            "parameters": {
                "type": "object",
                "properties": {
                    "offer_id": {"type": "string", "description": "شناسه آگهی فروشگاه"},
                    "user_note": {"type": "string", "description": "یادداشت خریدار"}
                },
                "required": ["offer_id"]
            }
        }
    }
]

class AgentService:
    def __init__(
        self,
        repo: DataRepository,
        search_service: SearchService,
        inquiry_service: InquiryService,
        session_service: SessionService,
        llm_client: Optional[LLMClient] = None
    ):
        self.repo = repo
        self.search_service = search_service
        self.inquiry_service = inquiry_service
        self.session_service = session_service
        self.llm_client = llm_client or LLMClient()

    def stream_chat(
        self,
        request: ChatRequest
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Orchestrates the tool-calling loop and yields SSE event dictionaries.
        Limits tool iterations to max 3.
        """
        session_id = request.session_id
        session_state = self.session_service.get_state(session_id)
        
        # Build conversation messages
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        history = session_state.get("history", [])
        for h in history[-6:]: # Keep last 3 turns
            messages.append(h)
        messages.append({"role": "user", "content": request.message})

        yield {"event": "thinking", "data": json.dumps({"step": "بررسی پیام خریدار و نیازسنجی..."}, ensure_ascii=False)}

        max_iterations = 3
        iteration = 0
        ui_blocks: List[Dict[str, Any]] = []

        context = request.context or ChatContext()

        while iteration < max_iterations:
            iteration += 1
            response = self.llm_client.chat_completion(messages, tools=AGENT_TOOLS)
            
            tool_calls = response.get("tool_calls")
            if not tool_calls:
                # Direct message response
                content = response.get("content") or ""
                yield {"event": "message", "data": json.dumps({"delta": content}, ensure_ascii=False)}
                messages.append({"role": "assistant", "content": content})
                break

            # Process tool calls
            messages.append(response)
            for tool_call in tool_calls:
                fn_name = tool_call["function"]["name"]
                args_str = tool_call["function"].get("arguments", "{}")
                try:
                    args = json.loads(args_str)
                except Exception:
                    args = {}

                yield {
                    "event": "tool_start",
                    "data": json.dumps({"tool": fn_name, "args": args}, ensure_ascii=False)
                }

                tool_result, ui_block = self._execute_tool(fn_name, args, context)

                if ui_block:
                    ui_blocks.append(ui_block)
                    yield {
                        "event": "ui_block",
                        "data": json.dumps(ui_block, ensure_ascii=False)
                    }

                yield {
                    "event": "tool_done",
                    "data": json.dumps({"tool": fn_name, "status": "success"}, ensure_ascii=False)
                }

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.get("id", f"call_{iteration}"),
                    "name": fn_name,
                    "content": json.dumps(tool_result, ensure_ascii=False)
                })

        # Save session history
        history.append({"role": "user", "content": request.message})
        if messages[-1].get("role") == "assistant" and messages[-1].get("content"):
            history.append({"role": "assistant", "content": messages[-1]["content"]})
        session_state["history"] = history[-10:]
        self.session_service.save_state(session_id, session_state)

        yield {"event": "done", "data": json.dumps({"session_id": session_id, "status": "completed"}, ensure_ascii=False)}

    def _execute_tool(
        self,
        name: str,
        args: Dict[str, Any],
        context: ChatContext
    ) -> tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
        """
        Dispatches tool call to deterministic services and generates validated UI blocks.
        """
        if name == "search_products":
            query = args.get("query", "")
            items = self.repo.search_products(
                query=query,
                category=args.get("category"),
                brand=args.get("brand"),
                limit=4
            )
            # Resilient fallback: If 0 items, search by first significant word
            if not items and query:
                words = [w for w in query.strip().split() if len(w) > 2]
                first_word = words[0] if words else ""
                if first_word and first_word != query:
                    items = self.repo.search_products(
                        query=first_word,
                        category=args.get("category"),
                        brand=args.get("brand"),
                        limit=4
                    )
            data = [item.model_dump() for item in items]
            ui_block = {"type": "ProductCardList", "data": {"products": data}} if data else None
            return {"count": len(items), "products": data}, ui_block

        elif name == "find_shops":
            pid = args.get("product_id") or context.selected_product_id or ""
            offers = self.search_service.get_filtered_product_offers(
                product_id=pid,
                user_lat=context.user_lat,
                user_lon=context.user_lon,
                max_radius_meters=args.get("max_radius_meters"),
                installment_only=args.get("installment_only", False),
                open_now_only=args.get("open_now", False),
                sort_by="balanced"
            )
            data = [offer.model_dump() for offer in offers[:4]]
            ui_block = {"type": "ShopCardList", "data": {"offers": data}} if data else None
            return {"total_offers": len(offers), "offers": data}, ui_block

        elif name == "get_mall_navigation":
            mall_name = args.get("mall_name", "")
            mall = self.repo.get_mall_info(mall_name)
            if mall:
                m_data = mall.model_dump()
                return m_data, {"type": "MallNavigationCard", "data": m_data}
            return {"error": "پاساژ یافت نشد"}, None

        elif name == "suggest_alternatives":
            cat = args.get("category_name", "")
            bazaar = self.repo.get_bazaar_recommendation(cat)
            if bazaar:
                b_data = bazaar.model_dump()
                return b_data, {"type": "BazaarHubCard", "data": b_data}
            return {"error": "بورس برای این دسته ثبت نشده"}, None

        elif name == "simulate_inquiry":
            offer_id = args.get("offer_id", "")
            inquiry = self.inquiry_service.simulate_inquiry(
                offer_id=offer_id,
                user_note=args.get("user_note")
            )
            i_data = inquiry.model_dump()
            return i_data, {"type": "InquirySimulationCard", "data": i_data}

        return {"error": f"Unknown tool: {name}"}, None
