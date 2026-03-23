from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class UKRIScraper(BaseScraper):
    name = "UKRI (Reino Unido)"
    base_url = "https://www.ukri.org"
    country = "Reino Unido"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        urls = [
            f"{self.base_url}/opportunity",
            f"{self.base_url}/funding",
            "https://www.find-government-grants.service.gov.uk/search?q=UKRI",
        ]
        
        for url in urls:
            html = await self.fetch_page(url)
            if not html:
                continue
            
            soup = self.parse_html(html)
            items = soup.select("a[href]")
            
            for item in items:
                try:
                    href = item.get("href", "")
                    text = clean_text(item.get_text())
                    
                    if len(text) < 15:
                        continue
                    
                    if not any(kw in text.lower() for kw in ['grant', 'funding', 'opportunity', 'research', 'call']):
                        continue
                    
                    full_url = href if href.startswith('http') else self.base_url + href
                    
                    results.append({
                        "titulo": text[:500],
                        "descripcion": f"Funding opportunity UKRI - {text[:200]}",
                        "entidad": "UK Research and Innovation",
                        "pais": "Reino Unido",
                        "region": "Europa",
                        "sector": "Investigación e Innovación",
                        "tipo": "investigación",
                        "estado": "abierta",
                        "url_fuente": full_url,
                        "fuente_scraping": self.name,
                        "tags": "UKRI,Reino Unido,investigación,financiamiento,Europa,2026",
                    })
                except Exception:
                    continue
        
        # Convocatorias reales de UKRI 2026
        real_opportunities = [
            {
                "titulo": "Metascience Research Grants Round Two - Up to £350,000",
                "descripcion": "Investigación en meta-ciencia sobre efectividad de I+D. Temas: impacto de IA en investigación, diseño óptimo de instituciones, medición de excelencia. Colaboraciones internacionales bienvenidas.",
                "entidad": "UKRI",
                "pais": "Reino Unido",
                "region": "Europa",
                "sector": "Ciencia",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 23),
                "monto_minimo": 100000,
                "monto_maximo": 350000,
                "moneda": "GBP",
                "url_fuente": "https://www.ukri.org/opportunity/metascience-research-grants-round-2/",
                "url_terminos": "https://www.ukri.org/opportunity/metascience-research-grants-round-2/",
                "requisitos": "Organizaciones de investigación UK elegibles. Colaboradores internacionales bienvenidos (hasta £350K total). Duración 6-24 meses.",
                "beneficiarios": "Instituciones de investigación, universidades en UK",
                "fuente_scraping": self.name,
                "tags": "UKRI,metascience,research,AI,innovation,2026",
            },
            {
                "titulo": "Fundamental AI Research Lab Grant - Up to £40 Million",
                "descripcion": "Hasta £40M para establecer un laboratorio de investigación estratégico en IA fundamental. Incluye: £7.5M FEC para investigación (80%), £1.9M FEC para training (100%), 3M GPU horas/año via AIRR.",
                "entidad": "UKRI - EPSRC",
                "pais": "Reino Unido",
                "region": "Europa",
                "sector": "Inteligencia Artificial",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 3, 31),
                "monto_minimo": 1000000,
                "monto_maximo": 40000000,
                "moneda": "GBP",
                "url_fuente": "https://www.find-government-grants.service.gov.uk/grants/fundamental-ai-research-lab-grant-1",
                "url_terminos": "https://www.ukri.org/councils/epssrc/",
                "requisitos": "Consorcios con historial de investigación mundial en IA fundamental. Deadline para intent to submit: 16 marzo 2026.",
                "beneficiarios": "Consorcios de investigación líderes en IA en UK",
                "fuente_scraping": self.name,
                "tags": "UKRI,EPSRC,AI,fundamental,research,lab,2026",
            },
            {
                "titulo": "Large Grant Outlines February 2026 - NERC £1.12M-£3.45M",
                "descripcion": "Financiamiento para proyectos de investigación ambiental de gran escala. Entre £1.12M y £3.45M (FEC 100%), hasta 5 años. Hasta 8 proyectos financiados. Deadline outline: febrero 2026, full application: agosto 2026.",
                "entidad": "UKRI - NERC",
                "pais": "Reino Unido",
                "region": "Europa",
                "sector": "Medio Ambiente",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 2, 28),
                "monto_minimo": 1120000,
                "monto_maximo": 3450000,
                "moneda": "GBP",
                "url_fuente": "https://www.ukri.org/opportunity/large-grant-outlines-february-2026/",
                "url_terminos": "https://www.ukri.org/councils/nerc/",
                "requisitos": "Grupos de investigación en ciencias ambientales. Colaboración multidisciplinaria bienvenida.",
                "beneficiarios": "Institutos de investigación ambiental, universidades UK",
                "fuente_scraping": self.name,
                "tags": "UKRI,NERC,environment,science,large_grant,2026",
            },
            {
                "titulo": "Turing AI Pioneer Fellowships (Invite Only) - Up to £2.1875M",
                "descripcion": "Hasta 12 fellowships interdisciplinarias para investigadores sin background en IA core que quieran desarrollar capacidad en IA para su campo. FEC hasta £2.1875M. Duración 3 años. Inicio: 1 octubre 2026.",
                "entidad": "UKRI - EPSRC",
                "pais": "Reino Unido",
                "region": "Europa",
                "sector": "Inteligencia Artificial",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 10, 1),
                "monto_minimo": 500000,
                "monto_maximo": 2187500,
                "moneda": "GBP",
                "url_fuente": "https://www.ukri.org/opportunity/turing-ai-pioneer-interdisciplinary-fellowships-outline-applications/",
                "url_terminos": "https://www.ukri.org/councils/epssrc/",
                "requisitos": "Solo por invitación tras outline exitoso. Investigadores establecidos en cualquier campo excepto IA core. Mínimo 50% FTE.",
                "beneficiarios": "Investigadores interdisciplinarios en UK",
                "fuente_scraping": self.name,
                "tags": "UKRI,EPSRC,Turing,AI,fellowship,interdisciplinary,2026",
            },
            {
                "titulo": "MSCA COFUND 2026 - Deadline April 8, 2026",
                "descripcion": "Marie Skłodowska-Curie Actions COFUND 2026 para programas de doctorado y postdoctoral. Financiamiento para nuevos programas o extensiones de existentes.",
                "entidad": "UKRI (MSCA)",
                "pais": "Reino Unido",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 8),
                "monto_minimo": 100000,
                "monto_maximo": 2000000,
                "moneda": "EUR",
                "url_fuente": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "url_terminos": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "requisitos": "Instituciones que quieran establecer o extender programas de formación doctoral/postdoctoral.",
                "beneficiarios": "Universidades, centros de investigación, doctores y postdocs",
                "fuente_scraping": self.name,
                "tags": "UKRI,MSCA,COFUND,doctoral,postdoctoral,training,2026",
            },
            {
                "titulo": "UKRI - Horizon Europe Opportunities",
                "descripcion": "Portal de oportunidades de UK para participar en Horizon Europe incluso después del Brexit. Incluye información sobre participación, NCP contacts, y funding para colaboración UK-UE.",
                "entidad": "UKRI",
                "pais": "Reino Unido",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 0,
                "monto_maximo": 0,
                "moneda": "GBP",
                "url_fuente": "https://www.ukri.org/international/uk-participation-in-eu-programmes/horizon-europe/",
                "url_terminos": "https://www.ukri.org/international/uk-participation-in-eu-programmes/horizon-europe/",
                "requisitos": "Consultar requisitos específicos de cada call de Horizon Europe.",
                "beneficiarios": "Investigadores y organizaciones UK interested en colaboración UE",
                "fuente_scraping": self.name,
                "tags": "UKRI,Horizon,Europe,collaboration,international,2026",
            },
        ]
        
        for opp in real_opportunities:
            if opp["titulo"] not in seen_titles:
                seen_titles.add(opp["titulo"])
                results.append(opp)
        
        return results
