from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class InnpulsaScraper(BaseScraper):
    name = "iNNpulsa Colombia"
    base_url = "https://www.innpulsa.gov.co"
    country = "Colombia"

    async def scrape(self) -> list[dict]:
        results = []
        url = f"{self.base_url}/convocatorias"
        html = await self.fetch_page(url)
        if not html:
            return results

        soup = self.parse_html(html)
        items = soup.select("article, .views-row, .node, .card, .convocatoria-item")

        for item in items:
            try:
                title_el = item.select_one("h2 a, h3 a, .card-title a, .title a, h2, h3")
                if not title_el:
                    continue

                titulo = clean_text(title_el.get_text())
                link_el = title_el if title_el.name == "a" else item.select_one("a")
                link = ""
                if link_el and link_el.get("href"):
                    link = link_el["href"]
                    if not link.startswith("http"):
                        link = self.base_url + link

                desc_el = item.select_one(".field--name-body, .card-text, .summary, p")
                descripcion = clean_text(desc_el.get_text()) if desc_el else ""

                results.append({
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "entidad": "iNNpulsa Colombia",
                    "pais": self.country,
                    "region": "América Latina",
                    "sector": "Emprendimiento",
                    "tipo": "emprendimiento",
                    "estado": "abierta",
                    "url_fuente": link or url,
                    "fuente_scraping": self.name,
                    "tags": "emprendimiento,innovación,Colombia,pymes",
                })
            except Exception:
                continue

        return results
