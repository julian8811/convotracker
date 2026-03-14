import re
from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class MincienciasScraper(BaseScraper):
    name = "Minciencias Colombia"
    base_url = "https://minciencias.gov.co"
    country = "Colombia"

    async def scrape(self) -> list[dict]:
        results = []
        url = f"{self.base_url}/convocatorias"
        html = await self.fetch_page(url)
        if not html:
            return results

        soup = self.parse_html(html)
        items = soup.select("article, .views-row, .node--type-convocatoria, .view-content .item-list li")

        for item in items:
            try:
                title_el = item.select_one("h2 a, h3 a, .field--name-title a, a.title")
                if not title_el:
                    continue

                titulo = clean_text(title_el.get_text())
                link = title_el.get("href", "")
                if link and not link.startswith("http"):
                    link = self.base_url + link

                desc_el = item.select_one(".field--name-body, .summary, p, .field--name-field-description")
                descripcion = clean_text(desc_el.get_text()) if desc_el else ""

                date_el = item.select_one(".date, .field--name-field-fecha, time, .datetime")
                fecha_cierre = None
                if date_el:
                    date_text = date_el.get("datetime") or date_el.get_text()
                    fecha_cierre = parse_date(clean_text(date_text))

                results.append({
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "entidad": "Minciencias",
                    "pais": self.country,
                    "region": "América Latina",
                    "sector": "Ciencia y Tecnología",
                    "tipo": "investigación",
                    "estado": "abierta",
                    "fecha_cierre": fecha_cierre,
                    "url_fuente": link or url,
                    "fuente_scraping": self.name,
                    "tags": "investigación,ciencia,tecnología,Colombia",
                })
            except Exception:
                continue

        return results
