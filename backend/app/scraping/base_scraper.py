import httpx
import logging
import time
import asyncio
from abc import ABC, abstractmethod
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# Configuración de retry
MAX_RETRIES = 3
RETRY_DELAY = 2  # segundos (será multiplicado exponencialmente)


class BaseScraper(ABC):
    name: str = "base"
    base_url: str = ""
    country: str = ""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
    }
    
    # Para sitios con problemas de SSL
    verify_ssl: bool = True

    async def fetch_page(self, url: str, params: dict | None = None) -> Optional[str]:
        last_error = None
        
        for attempt in range(MAX_RETRIES):
            try:
                async with httpx.AsyncClient(
                    timeout=httpx.Timeout(30.0, connect=10.0),
                    follow_redirects=True,
                    verify=self.verify_ssl
                ) as client:
                    response = await client.get(url, headers=self.headers, params=params)
                    response.raise_for_status()
                    return response.text
            except httpx.TimeoutException as e:
                last_error = e
                logger.warning(f"[{self.name}] Timeout fetching {url} (attempt {attempt + 1}/{MAX_RETRIES})")
            except httpx.HTTPStatusError as e:
                last_error = e
                # Si es 404, no reintentar (recurso no existe)
                if e.response.status_code == 404:
                    logger.warning(f"[{self.name}] 404 Not Found: {url}")
                    return None
                logger.warning(f"[{self.name}] HTTP error {e.response.status_code} fetching {url} (attempt {attempt + 1}/{MAX_RETRIES})")
            except httpx.RequestError as e:
                last_error = e
                logger.warning(f"[{self.name}] Request error fetching {url} (attempt {attempt + 1}/{MAX_RETRIES}): {e}")
            except Exception as e:
                last_error = e
                logger.error(f"[{self.name}] Unexpected error fetching {url}: {e}")
                break
            
            # Esperar antes de reintentar (exponential backoff)
            if attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAY * (2 ** attempt)
                logger.info(f"[{self.name}] Retrying in {delay}s...")
                await asyncio.sleep(delay)
        
        logger.error(f"[{self.name}] Failed to fetch {url} after {MAX_RETRIES} attempts: {last_error}")
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
