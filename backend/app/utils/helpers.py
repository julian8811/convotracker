import hashlib
from datetime import datetime
from typing import Optional

def generate_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def parse_date(date_str: str, formats: list[str] | None = None) -> Optional[datetime]:
    if not date_str:
        return None
    if formats is None:
        formats = [
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%Y-%m-%dT%H:%M:%S",
            "%d de %B de %Y",
            "%B %d, %Y",
            "%Y/%m/%d",
        ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None

def clean_text(text: str) -> str:
    if not text:
        return ""
    import re
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def truncate(text: str, max_length: int = 200) -> str:
    if not text or len(text) <= max_length:
        return text or ""
    return text[:max_length - 3] + "..."

def format_currency(amount: float | None, currency: str = "USD") -> str:
    if amount is None:
        return "No especificado"
    symbols = {"USD": "$", "EUR": "€", "COP": "COP $", "GBP": "£"}
    symbol = symbols.get(currency, currency + " ")
    if amount >= 1_000_000:
        return f"{symbol}{amount/1_000_000:,.1f}M"
    if amount >= 1_000:
        return f"{symbol}{amount/1_000:,.1f}K"
    return f"{symbol}{amount:,.0f}"
