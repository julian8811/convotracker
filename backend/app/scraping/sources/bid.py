from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class BIDScraper(BaseScraper):
    name = "BID / IDB"
    base_url = "https://www.iadb.org"
    country = "América Latina y Caribe"

    async def scrape(self) -> list[dict]:
        results = []
        url = f"{self.base_url}/en/procurement"
        html = await self.fetch_page(url)
        if not html:
            url = f"{self.base_url}/en/procurement/opportunities"
            html = await self.fetch_page(url)
        if not html:
            return results

        soup = self.parse_html(html)
        items = soup.select(
            "article, .views-row, .procurement-item, .card, .tender-item, "
            ".node--type-procurement, li.procurement, .list-item"
        )

        for item in items:
            try:
                title_el = item.select_one(
                    "h2 a, h3 a, .card-title a, .title a, a[href*='procurement'], a[href*='tender']"
                )
                if not title_el:
                    continue
                titulo = clean_text(title_el.get_text())
                if len(titulo) < 8:
                    continue
                link = title_el.get("href", "")
                if link and not link.startswith("http"):
                    link = self.base_url + link
                desc_el = item.select_one("p, .description, .summary, .card-text")
                descripcion = clean_text(desc_el.get_text()) if desc_el else ""
                date_el = item.select_one(".date, time, .deadline, .closing-date")
                fecha_cierre = None
                if date_el:
                    fecha_cierre = parse_date(
                        date_el.get("datetime") or clean_text(date_el.get_text())
                    )
                results.append({
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "entidad": "Banco Interamericano de Desarrollo (BID)",
                    "pais": "América Latina y Caribe",
                    "region": "América Latina",
                    "sector": "Desarrollo",
                    "tipo": "desarrollo",
                    "estado": "abierta",
                    "fecha_cierre": fecha_cierre,
                    "url_fuente": link or url,
                    "fuente_scraping": self.name,
                    "tags": "BID,IDB,LAC,desarrollo,financiamiento,procurement",
                })
            except Exception:
                continue
        return results
