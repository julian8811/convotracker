from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class GIZScraper(BaseScraper):
    name = "GIZ (Alemania)"
    base_url = "https://www.giz.de"
    country = "Alemania"

    async def scrape(self) -> list[dict]:
        results = []
        url = f"{self.base_url}/en/html/opportunities.html"
        html = await self.fetch_page(url)
        if not html:
            url = f"{self.base_url}/en/procurement"
            html = await self.fetch_page(url)
        if not html:
            return results

        soup = self.parse_html(html)
        items = soup.select(
            "article, .views-row, .tender-item, .procurement, .listing-item, "
            ".node--type-tender, .opportunity-card"
        )

        for item in items:
            try:
                title_el = item.select_one(
                    "h2 a, h3 a, .title a, a[href*='tender'], a[href*='opportunit']"
                )
                if not title_el:
                    continue
                titulo = clean_text(title_el.get_text())
                if len(titulo) < 8:
                    continue
                link = title_el.get("href", "")
                if link and not link.startswith("http"):
                    link = self.base_url + link
                desc_el = item.select_one("p, .description, .summary")
                descripcion = clean_text(desc_el.get_text()) if desc_el else ""
                date_el = item.select_one(".date, time, .deadline")
                fecha_cierre = None
                if date_el:
                    fecha_cierre = parse_date(
                        date_el.get("datetime") or clean_text(date_el.get_text())
                    )
                results.append({
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "entidad": "GIZ - Deutsche Gesellschaft für Internationale Zusammenarbeit",
                    "pais": "Alemania",
                    "region": "Europa",
                    "sector": "Cooperación Internacional",
                    "tipo": "cooperación_internacional",
                    "estado": "abierta",
                    "fecha_cierre": fecha_cierre,
                    "monto_maximo": None,
                    "moneda": "EUR",
                    "url_fuente": link or url,
                    "fuente_scraping": self.name,
                    "tags": "GIZ,Alemania,cooperación,desarrollo,Europa",
                })
            except Exception:
                continue
        return results
