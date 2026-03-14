from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class WorldBankScraper(BaseScraper):
    name = "Banco Mundial"
    base_url = "https://www.worldbank.org"
    country = "Internacional"

    async def scrape(self) -> list[dict]:
        results = []
        url = f"{self.base_url}/en/projects-operations/projects-list"
        html = await self.fetch_page(url)
        if not html:
            return results

        soup = self.parse_html(html)
        items = soup.select(".project-card, .result-item, article, .views-row, .project-list-item")

        for item in items:
            try:
                title_el = item.select_one("h3 a, h2 a, .project-title a, a.title")
                if not title_el:
                    continue

                titulo = clean_text(title_el.get_text())
                link = title_el.get("href", "")
                if link and not link.startswith("http"):
                    link = self.base_url + link

                desc_el = item.select_one("p, .description, .project-description")
                descripcion = clean_text(desc_el.get_text()) if desc_el else ""

                country_el = item.select_one(".country, .region")
                pais = clean_text(country_el.get_text()) if country_el else "Internacional"

                results.append({
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "entidad": "Banco Mundial",
                    "pais": pais,
                    "region": "Internacional",
                    "sector": "Desarrollo",
                    "tipo": "desarrollo",
                    "estado": "abierta",
                    "url_fuente": link or url,
                    "fuente_scraping": self.name,
                    "tags": "desarrollo,banco_mundial,internacional,financiamiento",
                })
            except Exception:
                continue

        return results
