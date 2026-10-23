import re
from typing import List

# Mapping Persian and Arabic digits to ASCII
PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
DIGIT_MAP = str.maketrans({
    **{p: str(i) for i, p in enumerate(PERSIAN_DIGITS)},
    **{a: str(i) for i, a in enumerate(ARABIC_DIGITS)}
})

# Arabic to Persian character mapping
CHAR_MAP = str.maketrans({
    "ي": "ی",
    "ك": "ک",
    "ة": "ه",
    "ؤ": "و",
    "إ": "ا",
    "أ": "ا",
    "آ": "ا",
    "ئ": "ی",
})

# Diacritics regex
DIACRITICS_REGEX = re.compile(r"[\u064B-\u065F\u0670]")

def digits_to_ascii(text: str) -> str:
    """Converts Persian and Arabic digits to ASCII digits."""
    if not text:
        return ""
    return text.translate(DIGIT_MAP)

def normalize_persian_text(text: str) -> str:
    """
    Normalizes Persian and Arabic text:
    - Normalizes characters (ي -> ی, ك -> ک, etc.)
    - Converts digits to ASCII
    - Removes Arabic diacritics
    - Collapses spaces and zero-width non-joiners
    """
    if not text:
        return ""
    
    # Character conversions
    cleaned = text.translate(CHAR_MAP)
    # Digits to ASCII
    cleaned = digits_to_ascii(cleaned)
    # Remove diacritics
    cleaned = DIACRITICS_REGEX.sub("", cleaned)
    # Replace ZWNJ with space
    cleaned = cleaned.replace("\u200c", " ")
    # Collapse multiple whitespaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

# FTS5 reserved keywords
FTS5_RESERVED = {"AND", "OR", "NOT", "NEAR"}

# Common Persian conversational stop words in search prompts
PERSIAN_STOPWORDS = {
    "یه", "یک", "میخوام", "میخواهم", "می", "خوام", "خواهم", "دنبال", "دارید", "دارین",
    "برای", "رو", "در", "با", "از", "که", "این", "آن", "به", "هم",
    "تا", "حدود", "لطفا", "لطفاً", "چی", "کجا", "شد", "شود", "کنم", "کنید",
    "میلیون", "تومن", "تومان", "هزار", "قیمت", "خرید", "ارزان", "قسطی", "فروشگاه", "مغازه", "نزدیک",
    "اصل", "حضوری", "تهران", "بازار", "پاساژ", "چارسو", "علاءالدین", "پایتخت", "پالادیوم", "کوروش", "ارگ"
}

def build_fts5_query(raw_query: str) -> str:
    """
    Sanitizes user query for safe and performant SQLite FTS5 matching.
    Extracts alphanumeric tokens (Persian, Arabic, English, Digits),
    filters out conversational stop words, and combines keywords with AND.
    """
    normalized = normalize_persian_text(raw_query)
    # Extract continuous word tokens (supports Persian, Arabic, English letters and digits)
    tokens = re.findall(r"[\w]+", normalized, flags=re.UNICODE)
    
    # Filter reserved keywords
    meaningful_tokens = [t for t in tokens if t.upper() not in FTS5_RESERVED]
    
    # Strip conversational stop words if content tokens remain
    content_tokens = [t for t in meaningful_tokens if t not in PERSIAN_STOPWORDS]
    # If there are word tokens, filter out standalone short digits from price expressions
    has_words = any(re.search(r"[^\d]", t) for t in content_tokens)
    if has_words:
        content_tokens = [t for t in content_tokens if re.search(r"[^\d]", t) or len(t) >= 3]

    final_tokens = content_tokens if content_tokens else meaningful_tokens

    safe_tokens: List[str] = [f'"{token}"' for token in final_tokens]
    
    if not safe_tokens:
        return '""'
    
    return " AND ".join(safe_tokens)

