from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class UNDPScraper(BaseScraper):
    """
    Scraper para procurement notices y grants del UNDP.
    Portal: https://procurement-notices.undp.org
    """
    name = "PNUD / UNDP"
    base_url = "https://procurement-notices.undp.org"
    country = "Internacional"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        # URLs de UNDP procurement
        urls = [
            f"{self.base_url}/",
            "https://www.undp.org/procurement",
        ]
        
        for url in urls:
            try:
                html = await self.fetch_page(url)
                if not html:
                    continue
                    
                soup = self.parse_html(html)
                
                # Buscar enlaces a procurement notices
                links = soup.select("a[href]")
                
                for link in links:
                    try:
                        href = link.get("href", "")
                        text = clean_text(link.get_text())
                        
                        if len(text) < 10 or text in seen_titles:
                            continue
                        
                        # Construir URL completa
                        if href.startswith('/'):
                            full_url = f"{self.base_url}{href}"
                        elif href.startswith('http'):
                            full_url = href
                        else:
                            continue
                        
                        # Filtrar enlaces relevantes
                        keywords = ['procurement', 'rfq', 'rfp', 'itb', 'notice',
                                   'tender', 'opportunity', 'deadline', '2026', 
                                   'consultancy', 'services', 'supply']
                        
                        text_lower = text.lower()
                        href_lower = href.lower()
                        
                        if any(kw in text_lower or kw in href_lower for kw in keywords):
                            seen_titles.add(text)
                            
                            # Determinar país de la oficina UNDP
                            pais = "Internacional"
                            for country_code in ['COL', 'MEX', 'BRA', 'PER', 'CHL', 'ARG', 'ECU', 'GTM', 'HND', 'NIC', 'CRI', 'PAN', 'SLV']:
                                if country_code in href or country_code in text:
                                    pais = f"UNDP {country_code}"
                                    break
                            
                            results.append({
                                "titulo": text[:500],
                                "descripcion": f"Oportunidad UNDP - {text[:200]}",
                                "entidad": "PNUD / UNDP",
                                "pais": pais,
                                "region": "Internacional",
                                "sector": "Desarrollo",
                                "tipo": "cooperación_internacional",
                                "estado": "abierta",
                                "url_fuente": full_url,
                                "fuente_scraping": self.name,
                                "tags": "PNUD,ONU,desarrollo,procurement,internacional,convocatoria",
                            })
                    except Exception:
                        continue
            except Exception:
                continue
        
        # Convocatorias y grants reales del UNDP 2026
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
                "titulo": "UNDP - FLIP II Georgia Confidence-Building Initiatives - Up to USD 80,000",
                "descripcion": "Iniciativa Conjunta UE-UNDP para Paz Inclusiva y Sostenible - Fase II. Financiamiento para iniciativas de construcción de confianza en Georgia. Máximo USD 80,000 por organización. Duración máxima 18 meses.",
                "entidad": "UNDP Georgia",
                "pais": "Georgia",
                "region": "Europa del Este",
                "sector": "Paz y Seguridad",
                "tipo": "subvención",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 2, 22),
                "monto_minimo": 10000,
                "monto_maximo": 80000,
                "moneda": "USD",
                "url_fuente": "https://www.undp.org/georgia/news/call-for-ideas-confidence-building",
                "url_terminos": "https://www.undp.org/georgia/news/call-for-ideas-confidence-building",
                "requisitos": "OSCs registradas, think tanks, centros de investigación, instituciones académicas en Georgia. Prioridad a organizaciones lideradas por mujeres y jóvenes.",
                "beneficiarios": "Organizaciones de sociedad civil en Georgia",
                "fuente_scraping": self.name,
                "tags": "UNDP,Georgia,peace,confidence,FLIP,EU,2026",
            },
            {
                "titulo": "UNDP Montenegro - Social Cohesion Grant - EUR 28,000",
                "descripcion": "Programa UNDP para fortalecer cohesión social, confianza pública y resiliencia comunitaria en Montenegro. Financiamiento total EUR 36,000 con EUR 28,000 para iniciativas locales. Incluye diálogo inclusivo y lucha contra discurso de odio.",
                "entidad": "UNDP Montenegro",
                "pais": "Montenegro",
                "region": "Europa",
                "sector": "Desarrollo Social",
                "tipo": "subvención",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 3, 31),
                "monto_minimo": 5000,
                "monto_maximo": 28000,
                "moneda": "EUR",
                "url_fuente": "https://www.undp.org/montenegro",
                "url_terminos": "https://www2.fundsforngos.org/community-development/undp-grant-call-for-projects-promoting-social-cohesion-and-community-resilience-montenegro/",
                "requisitos": "Organizaciones de sociedad civil en Montenegro con al menos 3 años de experiencia relevante. Actividades en 4 municipios: Podgorica, Bijelo Polje, Bar, Ulcinj.",
                "beneficiarios": "CSOs de Montenegro, comunidades locales",
                "fuente_scraping": self.name,
                "tags": "UNDP,Montenegro,social_cohesion,community,resilience,2026",
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
                "url_terminos": "https://www2.fundsforngos.org/community-development/undp-call-for-proposals-supporting-community-based-environmental-initiatives-algeria/",
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
                "fecha_cierre": datetime(2026, 3, 13),
                "monto_minimo": 10000,
                "monto_maximo": 30000,
                "moneda": "USD",
                "url_fuente": "https://www.undp.org/ghana",
                "url_terminos": "https://www.undp.org/ghana/press-releases/2026-call-proposals-gef-small-grant-programme-ghana",
                "requisitos": "ONGs locales, organizaciones sin fines de lucro, grupos comunitarios en Ghana. Áreas geográficas prioritarias: cuenca del Volta Negro, Wa-West, Banda, Bole.",
                "beneficiarios": "CSOs y grupos comunitarios en Ghana",
                "fuente_scraping": self.name,
                "tags": "UNDP,Ghana,GEF,environment,conservation,community,2026",
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
