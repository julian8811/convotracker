import httpx
import logging
import time
from abc import ABC, abstractmethod
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    name: str = "base"
    base_url: str = ""
    country: str = ""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
    }

    async def fetch_page(self, url: str, params: dict | None = None) -> Optional[str]:
        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                return response.text
        except httpx.HTTPError as e:
            logger.error(f"[{self.name}] Error fetching {url}: {e}")
            return None

    def parse_html(self, html: str) -> BeautifulSoup:
        return BeautifulSoup(html, "lxml")

    @abstractmethod
    async def scrape(self) -> list[dict]:
        pass

    async def run(self) -> dict:
        start = time.time()
        logger.info(f"[{self.name}] Starting scrape...")
        try:
            results = await self.scrape()
            duration = time.time() - start
            logger.info(f"[{self.name}] Found {len(results)} results in {duration:.1f}s")
            return {
                "fuente": self.name,
                "estado": "exitoso",
                "registros_encontrados": len(results),
                "duracion_segundos": round(duration, 2),
                "results": results,
            }
        except Exception as e:
            duration = time.time() - start
            logger.error(f"[{self.name}] Scraping failed: {e}")
            return {
                "fuente": self.name,
                "estado": "error",
                "registros_encontrados": 0,
                "duracion_segundos": round(duration, 2),
                "error_mensaje": str(e),
                "results": [],
            }
