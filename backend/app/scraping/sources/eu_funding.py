from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class EUFundingScraper(BaseScraper):
    name = "EU Funding & Tenders"
    base_url = "https://ec.europa.eu/info/funding-tenders/opportunities/portal"
    country = "Unión Europea"

    async def scrape(self) -> list[dict]:
        results = []
        api_url = "https://api.tech.ec.europa.eu/search-api/prod/rest/search"
        params = {
            "apiKey": "SEDIA",
            "text": "innovation research entrepreneurship",
            "pageSize": "30",
            "pageNumber": "1",
        }

        html = await self.fetch_page(f"{self.base_url}/search/es", params=None)
        if not html:
            return results

        soup = self.parse_html(html)
        items = soup.select(".sedia-card, .result-item, article, .eui-card")

        for item in items:
            try:
                title_el = item.select_one("h3, h2, .card-title, .sedia-card-title, a.result-title")
                if not title_el:
                    continue

                titulo = clean_text(title_el.get_text())
                link_el = item.select_one("a[href]")
                link = ""
                if link_el:
                    href = link_el.get("href", "")
                    link = href if href.startswith("http") else f"https://ec.europa.eu{href}"

                desc_el = item.select_one("p, .card-text, .description")
                descripcion = clean_text(desc_el.get_text()) if desc_el else ""

                deadline_el = item.select_one(".deadline, .date, time")
                fecha_cierre = None
                if deadline_el:
                    fecha_cierre = parse_date(clean_text(deadline_el.get_text()))

                budget_el = item.select_one(".budget, .amount")
                monto = None
                if budget_el:
                    import re
                    nums = re.findall(r'[\d,.]+', budget_el.get_text())
                    if nums:
                        try:
                            monto = float(nums[-1].replace(",", ""))
                        except ValueError:
                            pass

                results.append({
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "entidad": "Comisión Europea",
                    "pais": "Unión Europea",
                    "region": "Europa",
                    "sector": "Investigación e Innovación",
                    "tipo": "investigación",
                    "estado": "abierta",
                    "fecha_cierre": fecha_cierre,
                    "monto_maximo": monto,
                    "moneda": "EUR",
                    "url_fuente": link or self.base_url,
                    "fuente_scraping": self.name,
                    "tags": "europa,horizonte,investigación,innovación",
                })
            except Exception:
                continue

        return results
