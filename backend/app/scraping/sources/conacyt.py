from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class ConacytScraper(BaseScraper):
    name = "CONACYT México"
    base_url = "https://www.conacyt.gob.mx"
    country = "México"

    async def scrape(self) -> list[dict]:
        results = []
        urls = [
            f"{self.base_url}/convocatorias",
            f"{self.base_url}/convocatorias-abiertas",
            f"{self.base_url}/index.php/convocatorias",
        ]
        for url in urls:
            html = await self.fetch_page(url)
            if not html:
                continue
            soup = self.parse_html(html)
            items = soup.select(
                "article, .views-row, .convocatoria, .node--type-convocatoria, "
                ".item-list li, .listado-convocatorias .item, .card"
            )
            for item in items:
                try:
                    title_el = item.select_one(
                        "h2 a, h3 a, .title a, .field--name-title a, a.título"
                    )
                    if not title_el:
                        continue
                    titulo = clean_text(title_el.get_text())
                    if len(titulo) < 10:
                        continue
                    link = title_el.get("href", "")
                    if link and not link.startswith("http"):
                        link = self.base_url + link
                    desc_el = item.select_one("p, .description, .summary, .body")
                    descripcion = clean_text(desc_el.get_text()) if desc_el else ""
                    date_el = item.select_one(".date, .fecha, time")
                    fecha_cierre = None
                    if date_el:
                        fecha_cierre = parse_date(
                            date_el.get("datetime") or clean_text(date_el.get_text())
                        )
                    results.append({
                        "titulo": titulo,
                        "descripcion": descripcion,
                        "entidad": "CONACYT",
                        "pais": "México",
                        "region": "América Latina",
                        "sector": "Ciencia y Tecnología",
                        "tipo": "investigación",
                        "estado": "abierta",
                        "fecha_cierre": fecha_cierre,
                        "url_fuente": link or url,
                        "fuente_scraping": self.name,
                        "tags": "CONACYT,México,investigación,ciencia,tecnología",
                    })
                except Exception:
                    continue
            if results:
                break
        return results
