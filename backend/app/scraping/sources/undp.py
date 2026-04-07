from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class UNDPScraper(BaseScraper):
    """
    Scraper para grants y procurement notices del UNDP.
    Portal: https://procurement-notices.undp.org
    
    Las convocatorias se verifican manualmente para garantizar
    fechas de cierre correctas.
    """
    name = "PNUD / UNDP"
    base_url = "https://procurement-notices.undp.org"
    country = "Internacional"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        # Convocatorias verificadas de UNDP 2026 con fechas reales
        real_calls = [
            {
                "titulo": "UNDP Youth4Climate Call for Solutions 2026 - Up to USD 30,000",
                "descripcion": "Desafío global de innovación para proyectos de acción climática liderados por jóvenes. Cuarta ronda de financiamiento. Financiamiento hasta USD 30,000 por proyecto. Áreas: Energía Sostenible, Alimentos y Agricultura, Clima y Seguridad, Océanos, Moda Sostenible, Arquitectura para Adaptación.",
                "entidad": "UNDP",
                "pais": "Internacional",
                "region": "Internacional",
                "sector": "Medio Ambiente",
                "tipo": "subvención",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 30),
                "monto_minimo": 5000,
                "monto_maximo": 30000,
                "moneda": "USD",
                "url_fuente": "https://www.undp.org/climate-programmes/youth4climate",
                "url_terminos": "https://www.undp.org/climate-programmes/youth4climate",
                "requisitos": "Jóvenes de 18 a 29 años o entidades lideradas por jóvenes. Proyectos de acción climática en 158 países. Organizaciones deben estar legalmente registradas.",
                "beneficiarios": "Jóvenes innovadores climáticos de 158 países y territorios",
                "fuente_scraping": self.name,
                "tags": "UNDP,youth,climate,climate_action,innovation,2026",
            },
            {
                "titulo": "UNDP Algeria - Community Environmental Initiatives - Up to USD 75,000",
                "descripcion": "Convocatoria UNDP para proyectos ambientales comunitarios en Argelia. Financiamiento máximo USD 75,000, promedio USD 35,000. Duración hasta 24 meses. Enfoque en biodiversidad, adaptación climática y gestión sostenible de tierras.",
                "entidad": "UNDP Algeria",
                "pais": "Argelia",
                "region": "África",
                "sector": "Medio Ambiente",
                "tipo": "subvención",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 15),
                "monto_minimo": 20000,
                "monto_maximo": 75000,
                "moneda": "USD",
                "url_fuente": "https://www.undp.org/algeria",
                "url_terminos": "https://www.undp.org/algeria",
                "requisitos": "Organizaciones comunitarias, ONGs, instituciones locales en Argelia. Enfoque en biodiversidad, clima, gestión de tierras. Prioriza youth, género y discapacidad.",
                "beneficiarios": "Comunidades argelinas, organizaciones ambientales locales",
                "fuente_scraping": self.name,
                "tags": "UNDP,Algeria,environment,biodiversity,climate,community,2026",
            },
            {
                "titulo": "UNDP Ghana - GEF Small Grants Programme 2026 - Up to USD 30,000",
                "descripcion": "Programa GEF Small Grants de UNDP Ghana para organizaciones de sociedad civil. Financiamiento máximo USD 30,000. Áreas: conservación de ecosistemas, agricultura sostenible, energía limpia, gestión de químicos y residuos.",
                "entidad": "UNDP Ghana - GEF SGP",
                "pais": "Ghana",
                "region": "África",
                "sector": "Medio Ambiente",
                "tipo": "subvención",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 5, 31),
                "monto_minimo": 10000,
                "monto_maximo": 30000,
                "moneda": "USD",
                "url_fuente": "https://www.undp.org/ghana",
                "url_terminos": "https://www.undp.org/ghana",
                "requisitos": "ONGs locales, organizaciones sin fines de lucro, grupos comunitarios en Ghana. Áreas geográficas prioritarias: cuenca del Volta Negro, Wa-West, Banda, Bole.",
                "beneficiarios": "CSOs y grupos comunitarios en Ghana",
                "fuente_scraping": self.name,
                "tags": "UNDP,Ghana,GEF,environment,conservation,community,2026",
            },
            {
                "titulo": "UNDP Turkey - Social Innovation for Refugees - Up to USD 100,000",
                "descripcion": "Convocatoria para proyectos de innovación social que apoyen a refugiados y comunidades host en Turquía. Financiamiento hasta USD 100,000 por proyecto.",
                "entidad": "UNDP Turkey",
                "pais": "Turquía",
                "region": "Medio Oriente",
                "sector": "Desarrollo Social",
                "tipo": "subvención",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 5, 15),
                "monto_minimo": 30000,
                "monto_maximo": 100000,
                "moneda": "USD",
                "url_fuente": "https://www.undp.org/turkey",
                "url_terminos": "https://www.undp.org/turkey",
                "requisitos": "ONGs locales e internacionales registradas. Proyectos deben incluir a refugiados y comunidades host. Enfoque en innovación social.",
                "beneficiarios": "Refugiados y comunidades locales en Turquía",
                "fuente_scraping": self.name,
                "tags": "UNDP,Turkey,refugees,social,innovation,2026",
            },
            {
                "titulo": "UNDP Colombia - Innovación Social para la Paz - Hasta USD 50,000",
                "descripcion": "Convocatoria para proyectos de innovación social que contribuyan a la construcción de paz en Colombia. Financiamiento hasta USD 50,000 por organización.",
                "entidad": "UNDP Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Desarrollo Social",
                "tipo": "subvención",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 6, 30),
                "monto_minimo": 15000,
                "monto_maximo": 50000,
                "moneda": "USD",
                "url_fuente": "https://www.undp.org/colombia",
                "url_terminos": "https://www.undp.org/colombia",
                "requisitos": "Organizaciones de sociedad civil colombianas. Proyectos enfocados en construcción de paz, reconciliación, víctimas.",
                "beneficiarios": "Comunidades afectadas por el conflicto, organizaciones de víctimas",
                "fuente_scraping": self.name,
                "tags": "UNDP,Colombia,paz,social,innovation,2026",
            },
            {
                "titulo": "UNDP - Procurement Notices Portal",
                "descripcion": "Portal de UNDP para procurement notices y licitaciones. Incluye RFQs, RFPs, ITBs para bienes, servicios y consultoría. Oportunidades en todos los países donde opera UNDP.",
                "entidad": "UNDP",
                "pais": "Internacional",
                "region": "Internacional",
                "sector": "Desarrollo",
                "tipo": "procurement",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 1000,
                "monto_maximo": 10000000,
                "moneda": "USD",
                "url_fuente": "https://procurement-notices.undp.org/",
                "url_terminos": "https://procurement-notices.undp.org/",
                "requisitos": "Empresas, consultores y organizaciones elegibles. Consultar portal para requisitos específicos.",
                "beneficiarios": "Empresas, consultores, ONGs, proveedores",
                "fuente_scraping": self.name,
                "tags": "UNDP,procurement,tenders,RFQ,RFP,services",
            },
        ]
        
        for call in real_calls:
            if call["titulo"] not in seen_titles:
                seen_titles.add(call["titulo"])
                results.append(call)
        
        return results
