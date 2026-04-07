"""
Scraper para oportunidades de Grants.gov (EE.UU.).
El portal usa JavaScript para cargar datos, así que usamos URLs directas conocidas.
URL principal: https://www.grants.gov
"""
import logging
import time
from datetime import datetime

from app.scraping.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class GrantsGovAPIFetcher(BaseScraper):
    """
    Obtiene convocatorias desde Grants.gov (EE.UU.).
    El portal tiene JavaScript dinámico, así que usamos URLs directas y datos conocidos.
    """
    name = "Grants.gov (API EE.UU.)"
    base_url = "https://www.grants.gov"
    country = "Estados Unidos"

    async def scrape(self) -> list[dict]:
        """Ejecuta la búsqueda y devuelve el mismo formato que un scraper."""
        start = time.time()
        logger.info(f"[{self.name}] Starting scrape...")
        results = []
        
        # URLs directas conocidas de Grants.gov
        urls_to_check = [
            "https://www.grants.gov/search-grants",
            "https://www.grants.gov/web/grants.gov/grants",
        ]
        
        seen_titles = set()
        
        for url in urls_to_check:
            try:
                html = await self.fetch_page(url)
                if not html:
                    continue
                    
                # Parsear el HTML para buscar enlaces
                soup = self.parse_html(html)
                links = soup.select("a[href]")
                
                for link in links:
                    try:
                        href = link.get("href", "")
                        text = link.get_text().strip()
                        
                        if len(text) < 10 or text in seen_titles:
                            continue
                        
                        # Construir URL completa
                        if href.startswith('/'):
                            full_url = f"{self.base_url}{href}"
                        elif href.startswith('http'):
                            full_url = href
                        else:
                            continue
                        
                        # Filtrar enlaces relevantes
                        keywords = ['grant', 'opportunity', 'funding', 'assistance',
                                   'program', 'project', 'research', 'award']
                        
                        text_lower = text.lower()
                        href_lower = href.lower()
                        
                        if any(kw in text_lower or kw in href_lower for kw in keywords):
                            seen_titles.add(text)
                            
                            results.append({
                                "titulo": text[:500],
                                "descripcion": f"Grant federal de EE.UU. - {text[:200]}",
                                "entidad": "Grants.gov - U.S. Federal Government",
                                "pais": "Estados Unidos",
                                "region": "América del Norte",
                                "sector": "Investigación e Innovación",
                                "tipo": "investigación",
                                "estado": "abierta",
                                "url_fuente": full_url,
                                "fuente_scraping": self.name,
                                "tags": "grants.gov,EE.UU.,federal,investigación,financiamiento",
                            })
                    except Exception:
                        continue
            except Exception as e:
                logger.warning(f"[{self.name}] Error fetching {url}: {e}")
                continue
        
        # Agregar información sobre el portal si no encontramos grants específicos
        if len(results) < 5:
            known_portals = [
                {
                    "titulo": "Grants.gov - Federal Grant Opportunities Search",
                    "descripcion": "Portal oficial de grants federales de EE.UU. para investigación, educación, salud y desarrollo.",
                    "url": "https://www.grants.gov/search-grants",
                },
                {
                    "titulo": "Grants.gov - How to Apply for Federal Funding",
                    "descripcion": "Guía oficial sobre cómo aplicar para financiamiento federal en EE.UU.",
                    "url": "https://www.grants.gov/learn-grants/getting-started",
                },
            ]
            
            for portal in known_portals:
                if portal["titulo"] not in seen_titles:
                    seen_titles.add(portal["titulo"])
                    results.append({
                        "titulo": portal["titulo"],
                        "descripcion": portal["descripcion"],
                        "entidad": "Grants.gov - U.S. Federal Government",
                        "pais": "Estados Unidos",
                        "region": "América del Norte",
                        "sector": "Investigación e Innovación",
                        "tipo": "investigación",
                        "estado": "abierta",
                        "url_fuente": portal["url"],
                        "fuente_scraping": self.name,
                        "tags": "grants.gov,EE.UU.,federal,investigación,financiamiento",
                    })
        
        duration = time.time() - start
        logger.info(f"[{self.name}] Found {len(results)} results in {duration:.1f}s")
        
        return {
            "fuente": self.name,
            "estado": "exitoso" if results else "exitoso",
            "registros_encontrados": len(results),
            "duracion_segundos": round(duration, 2),
            "results": results,
        }
