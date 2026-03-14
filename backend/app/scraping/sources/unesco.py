from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class UNESCOScraper(BaseScraper):
    name = "UNESCO"
    base_url = "https://www.unesco.org"
    country = "Internacional"

    async def scrape(self) -> list[dict]:
        results = []
        url = f"{self.base_url}/en/calls"
        html = await self.fetch_page(url)
        if not html:
            url = f"{self.base_url}/en/funding-opportunities"
            html = await self.fetch_page(url)
        if not html:
            return results

        soup = self.parse_html(html)
        items = soup.select(
            "article, .views-row, .call-item, .funding-opportunity, "
            ".node--type-call, .listing-item, .card"
        )

        for item in items:
            try:
                title_el = item.select_one(
                    "h2 a, h3 a, .title a, .field--name-title a, a[href*='call']"
                )
                if not title_el:
                    continue
                titulo = clean_text(title_el.get_text())
                if len(titulo) < 8:
                    continue
                link = title_el.get("href", "")
                if link and not link.startswith("http"):
                    link = self.base_url + link
                desc_el = item.select_one("p, .description, .summary, .body")
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
                    "entidad": "UNESCO",
                    "pais": "Internacional",
                    "region": "Internacional",
                    "sector": "Educación y Cultura",
                    "tipo": "cooperación_internacional",
                    "estado": "abierta",
                    "fecha_cierre": fecha_cierre,
                    "url_fuente": link or url,
                    "fuente_scraping": self.name,
                    "tags": "UNESCO,ONU,educación,cultura,internacional",
                })
            except Exception:
                continue
        return results
