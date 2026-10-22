import pytest
from app.normalizer import normalize_persian_text, build_fts5_query, digits_to_ascii

def test_digits_to_ascii():
    assert digits_to_ascii("۱۲۳۴۵۶۷۸۹۰") == "1234567890"
    assert digits_to_ascii("١٢٣٤٥٦٧٨٩٠") == "1234567890"
    assert digits_to_ascii("قیمت ۲۰۰۰۰ تومان") == "قیمت 20000 تومان"

def test_normalize_persian_text_arabic_characters():
    assert normalize_persian_text("يك گوشي عالي") == "یک گوشی عالی"
    assert normalize_persian_text("سامسونگ كاور") == "سامسونگ کاور"

def test_normalize_persian_text_zwnj_and_spaces():
    # ZWNJ replaced with space or standardized
    assert normalize_persian_text("گوشی  سامسونگ   A54") == "گوشی سامسونگ A54"

def test_build_fts5_query_safe_tokens():
    # Strips dangerous or invalid FTS punctuation and formats tokens with AND / prefix
    query = build_fts5_query("سامسونگ Galaxy A54")
    assert "سامسونگ" in query
    assert "Galaxy" in query
    assert "A54" in query
    # Must not throw sqlite3 syntax errors on symbols
    dangerous = build_fts5_query('سامسونگ * (A54) "pro" OR/AND')
    assert "*" not in dangerous or dangerous.endswith("*")
    assert "(" not in dangerous
    assert ")" not in dangerous
