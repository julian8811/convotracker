from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class UKRIScraper(BaseScraper):
    name = "UKRI (Reino Unido)"
    base_url = "https://www.ukri.org"
    country = "Reino Unido"

    async def scrape(self) -> list[dict]:
        results = []
        url = f"{self.base_url}/opportunity"
        html = await self.fetch_page(url)
        if not html:
            url = f"{self.base_url}/funding"
            html = await self.fetch_page(url)
        if not html:
            return results

        soup = self.parse_html(html)
        items = soup.select(
            "article, .opportunity-card, .funding-opportunity, .views-row, "
            ".listing-item, [data-opportunity], .card"
        )

        for item in items:
            try:
                title_el = item.select_one(
                    "h2 a, h3 a, .title a, a[href*='opportunity'], a[href*='funding']"
                )
                if not title_el:
                    continue
                titulo = clean_text(title_el.get_text())
                if len(titulo) < 8:
                    continue
                link = title_el.get("href", "")
                if link and not link.startswith("http"):
                    link = self.base_url + link
                desc_el = item.select_one("p, .description, .summary, .excerpt")
                descripcion = clean_text(desc_el.get_text()) if desc_el else ""
                date_el = item.select_one(".date, time, .deadline, .closing")
                fecha_cierre = None
                if date_el:
                    fecha_cierre = parse_date(
                        date_el.get("datetime") or clean_text(date_el.get_text())
                    )
                results.append({
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "entidad": "UK Research and Innovation",
                    "pais": "Reino Unido",
                    "region": "Europa",
                    "sector": "Investigación e Innovación",
                    "tipo": "investigación",
                    "estado": "abierta",
                    "fecha_cierre": fecha_cierre,
                    "monto_maximo": None,
                    "moneda": "GBP",
                    "url_fuente": link or url,
                    "fuente_scraping": self.name,
                    "tags": "UKRI,Reino Unido,investigación,financiamiento,Europa",
                })
            except Exception:
                continue
        return results
