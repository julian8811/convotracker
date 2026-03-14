from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class CAFScraper(BaseScraper):
    name = "CAF (Corporación Andina de Fomento)"
    base_url = "https://www.caf.com"
    country = "América Latina"

    async def scrape(self) -> list[dict]:
        results = []
        url = f"{self.base_url}/es/contrataciones"
        html = await self.fetch_page(url)
        if not html:
            url = f"{self.base_url}/es/procurement"
            html = await self.fetch_page(url)
        if not html:
            return results

        soup = self.parse_html(html)
        items = soup.select(
            "article, .views-row, .procurement-item, .tender, .listing-item, "
            ".node--type-procurement, .card, li.tender"
        )

        for item in items:
            try:
                title_el = item.select_one(
                    "h2 a, h3 a, .title a, .tender-title a, a[href*='contratacion'], a[href*='procurement']"
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
                date_el = item.select_one(".date, time, .fecha-cierre")
                fecha_cierre = None
                if date_el:
                    fecha_cierre = parse_date(
                        date_el.get("datetime") or clean_text(date_el.get_text())
                    )
                results.append({
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "entidad": "CAF - Banco de Desarrollo de América Latina",
                    "pais": "América Latina",
                    "region": "América Latina",
                    "sector": "Desarrollo",
                    "tipo": "desarrollo",
                    "estado": "abierta",
                    "fecha_cierre": fecha_cierre,
                    "url_fuente": link or url,
                    "fuente_scraping": self.name,
                    "tags": "CAF,región andina,desarrollo,financiamiento,LATAM",
                })
            except Exception:
                continue
        return results
