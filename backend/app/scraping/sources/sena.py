from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class SenaScraper(BaseScraper):
    name = "SENA Fondo Emprender"
    base_url = "https://www.fondoemprender.com"
    country = "Colombia"

    async def scrape(self) -> list[dict]:
        results = []
        url = f"{self.base_url}/SitePages/Convocatorias.aspx"
        html = await self.fetch_page(url)
        if not html:
            url = "https://www.sena.edu.co/es-co/trabajo/Paginas/convocatorias.aspx"
            html = await self.fetch_page(url)
            if not html:
                return results

        soup = self.parse_html(html)
        items = soup.select("article, .ms-rtestate-field a, .views-row, tr, .card, li.item")

        for item in items:
            try:
                title_el = item.select_one("h2, h3, a, .title, td:first-child")
                if not title_el:
                    continue

                titulo = clean_text(title_el.get_text())
                if len(titulo) < 10:
                    continue

                link_el = item.select_one("a[href]") or (title_el if title_el.name == "a" else None)
                link = ""
                if link_el and link_el.get("href"):
                    link = link_el["href"]
                    if not link.startswith("http"):
                        link = self.base_url + link

                desc_el = item.select_one("p, .description, td:nth-child(2)")
                descripcion = clean_text(desc_el.get_text()) if desc_el else ""

                results.append({
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "entidad": "SENA - Fondo Emprender",
                    "pais": self.country,
                    "region": "América Latina",
                    "sector": "Emprendimiento",
                    "tipo": "emprendimiento",
                    "estado": "abierta",
                    "url_fuente": link or url,
                    "fuente_scraping": self.name,
                    "tags": "emprendimiento,sena,fondo_emprender,Colombia",
                })
            except Exception:
                continue

        return results
