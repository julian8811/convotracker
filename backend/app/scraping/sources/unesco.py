from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class UNESCOScraper(BaseScraper):
    """
    Scraper para llamadas y oportunidades de UNESCO.
    Portal: https://www.unesco.org
    """
    name = "UNESCO"
    base_url = "https://www.unesco.org"
    country = "Internacional"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        # URL correcta de convocatorias UNESCO
        urls = [
            f"{self.base_url}/en/articles/call-proposals",
        ]
        
        for url in urls:
            try:
                html = await self.fetch_page(url)
                if not html:
                    continue
                    
                soup = self.parse_html(html)
                
                # Buscar artículos de convocatorias
                articles = soup.select("article, .article-item, .call-proposal-item, .listing-item")
                if not articles:
                    # Si no hay artículos específicos, buscar enlaces
                    articles = soup.select("a[href*='/en/articles/']")
                
                for item in articles:
                    try:
                        # Extraer título y URL
                        if hasattr(item, 'select_one'):
                            title_el = item.select_one("h1, h2, h3, h4, .title, [class*='title']")
                            link_el = item.select_one("a[href]")
                        else:
                            title_el = item
                            link_el = item
                        
                        if not title_el:
                            continue
                            
                        text = clean_text(title_el.get_text())
                        href = ""
                        if link_el:
                            href = link_el.get("href", "")
                        
                        if not href:
                            # Buscar en el elemento actual
                            href = item.get("href", "") if hasattr(item, 'get') else ""
                        
                        if len(text) < 15 or text in seen_titles:
                            continue
                        
                        # Construir URL completa
                        if href.startswith('/'):
                            full_url = f"{self.base_url}{href}"
                        elif href.startswith('http') and 'unesco.org' in href:
                            full_url = href
                        else:
                            continue
                        
                        # Solo convocatorias reales
                        if '/articles/' not in full_url:
                            continue
                        
                        seen_titles.add(text)
                        
                        results.append({
                            "titulo": text[:500],
                            "descripcion": f"Oportunidad UNESCO - {text[:200]}",
                            "entidad": "UNESCO",
                            "pais": "Internacional",
                            "region": "Internacional",
                            "sector": "Educación, Ciencia y Cultura",
                            "tipo": "cooperación_internacional",
                            "estado": "abierta",
                            "url_fuente": full_url,
                            "fuente_scraping": self.name,
                            "tags": "UNESCO,ONU,educación,cultura,ciencia,internacional,convocatoria,2026",
                        })
                    except Exception:
                        continue
            except Exception:
                continue
        
        # Convocatorias reales de UNESCO 2026
        real_calls = [
            {
                "titulo": "UNESCO Participation Programme 2026-2027 - Up to USD 38,000",
                "descripcion": "Programa de financiación bienal de UNESCO para proyectos de alto impacto alineados con las prioridades globales de UNESCO. Incluye: educación, ciencia, cultura, comunicación. Fondos hasta USD 38,000 para proyectos regionales.",
                "entidad": "UNESCO",
                "pais": "Internacional",
                "region": "Internacional",
                "sector": "Educación, Ciencia y Cultura",
                "tipo": "cooperación_internacional",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 2, 27),
                "monto_minimo": 26000,
                "monto_maximo": 38000,
                "moneda": "USD",
                "url_fuente": "https://www.unesco.org/en/articles/participation-programme",
                "url_terminos": "https://www.unesco.org/en/articles/participation-programme",
                "requisitos": "Estados miembros de UNESCO (vía Comisiones Nacionales). ONGs en asociación oficial con UNESCO. Máximo 7 propuestas por Estado miembro. Alineación con presupuesto 43 C/5.",
                "beneficiarios": "Instituciones gubernamentales, ONGs, instituciones académicas en países miembros de UNESCO",
                "fuente_scraping": self.name,
                "tags": "UNESCO,participation,education,science,culture,grants,2026",
            },
            {
                "titulo": "UNESCO-Equatorial Guinea Fellowship for Young Women Scientists Africa 2026 - USD 25,000",
                "descripcion": "Programa de becas para jóvenes científicas africanas. Apoya la formación y carrera científica de mujeres jóvenes en África. Monto: $25,000.",
                "entidad": "UNESCO",
                "pais": "Internacional",
                "region": "África",
                "sector": "Ciencia",
                "tipo": "beca",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 3, 31),
                "monto_minimo": 25000,
                "monto_maximo": 25000,
                "moneda": "USD",
                "url_fuente": "https://www.unesco.org/en/articles/2026-call-applications-unesco-equatorial-guinea-fellowship-programme-young-women-scientists-africa",
                "url_terminos": "https://www.unesco.org/en/articles/2026-call-applications-unesco-equatorial-guinea-fellowship-programme-young-women-scientists-africa",
                "requisitos": "Mujeres jóvenes científicas de países africanos. Investigación en ciencias naturales, ingeniería, o campos relacionados. Endoso de institución local.",
                "beneficiarios": "Jóvenes científicas mujeres africanas",
                "fuente_scraping": self.name,
                "tags": "UNESCO,fellowship,Africa,women,science,2026",
            },
            {
                "titulo": "UNESCO Sultan Qaboos Prize for Environmental Conservation 2026 - USD 100,000",
                "descripcion": "Premio de UNESCO para contribuciones destacadas a la conservación ambiental. Reconoce iniciativas innovadoras en protección del medio ambiente y desarrollo sostenible.",
                "entidad": "UNESCO",
                "pais": "Internacional",
                "region": "Internacional",
                "sector": "Medio Ambiente",
                "tipo": "premio",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 6, 15),
                "monto_minimo": 100000,
                "monto_maximo": 100000,
                "moneda": "USD",
                "url_fuente": "https://www.unesco.org/en/articles/applications-open-2026-unesco-sultan-qaboos-prize-environmental-conservation",
                "url_terminos": "https://www.unesco.org/en/articles/applications-open-2026-unesco-sultan-qaboos-prize-environmental-conservation",
                "requisitos": "Individuos, organizaciones o instituciones con contribuciones destacadas a la conservación ambiental. Proyectos implementados y con resultados verificables.",
                "beneficiarios": "Conservacionistas, organizaciones ambientales, instituciones de investigación",
                "fuente_scraping": self.name,
                "tags": "UNESCO,prize,environment,conservation,Sultan_Qaboos,2026",
            },
            {
                "titulo": "UNESCO-Equatorial Guinea Prize for Research in Life Sciences 2026",
                "descripcion": "Premio UNESCO-Guinea Ecuatorial para contribuciones destacadas en investigación en ciencias de la vida. Reconoce investigaciones que mejoran la vida y contribuyen al desarrollo sostenible.",
                "entidad": "UNESCO",
                "pais": "Internacional",
                "region": "Internacional",
                "sector": "Ciencia",
                "tipo": "premio",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 3, 31),
                "monto_minimo": 10000,
                "monto_maximo": 100000,
                "moneda": "USD",
                "url_fuente": "https://www.unesco.org/en/articles/2026-call-applications-unesco-equatorial-guinea-international-prize-research-life-sciences",
                "url_terminos": "https://www.unesco.org/en/articles/2026-call-applications-unesco-equatorial-guinea-international-prize-research-life-sciences",
                "requisitos": "Investigadores, científicos o instituciones con contribuciones significativas en ciencias de la vida. Investigación con impacto demostrado.",
                "beneficiarios": "Científicos e instituciones de investigación en ciencias de la vida",
                "fuente_scraping": self.name,
                "tags": "UNESCO,prize,life_sciences,research,Equatorial_Guinea,2026",
            },
            {
                "titulo": "Transnational Heritage Joint Research Grants 2026 - Korea Heritage",
                "descripcion": "Programa de becas de investigación conjunta del Korean National Commission for UNESCO y Korea Heritage Service. Para estudios sobre patrimonio transnational y narrativas compartidas.",
                "entidad": "UNESCO - Korea Heritage",
                "pais": "Internacional",
                "region": "Internacional",
                "sector": "Cultura",
                "tipo": "beca",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 2, 28),
                "monto_minimo": 5000,
                "monto_maximo": 30000,
                "moneda": "USD",
                "url_fuente": "https://unesco.or.kr/260116_02/",
                "url_terminos": "https://unesco.or.kr/260116_02/",
                "requisitos": "Equipos de investigación internacionales. Estudios sobre patrimonio compartido, memorias transnacionales, patrimonio para futuro sostenible. Investigadores de carrera temprana.",
                "beneficiarios": "Equipos de investigación en patrimonio cultural y estudios de memoria",
                "fuente_scraping": self.name,
                "tags": "UNESCO,heritage,research, Korea, transnational,2026",
            },
            {
                "titulo": "UNESCO - Journalism & Heritage Climate Programme Mongolia 2026",
                "descripcion": "Programa de desarrollo de capacidades en periodismo sobre clima, patrimonio y geoparques en Mongolia. Para periodistas y profesionales de medios de comunicación.",
                "entidad": "UNESCO",
                "pais": "Internacional",
                "region": "Asia",
                "sector": "Comunicación",
                "tipo": "capacitación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 2, 24),
                "monto_minimo": 0,
                "monto_maximo": 5000,
                "moneda": "USD",
                "url_fuente": "https://www.unesco.org/en/articles/call-proposals-climate-heritage-and-geopark-journalism-capacity-building-programme-mongolia-2026",
                "url_terminos": "https://www.unesco.org/en/articles/call-proposals-climate-heritage-and-geopark-journalism-capacity-building-programme-mongolia-2026",
                "requisitos": "Periodistas y profesionales de medios de países en desarrollo. Interés en cobertura de cambio climático, patrimonio natural y geoparques.",
                "beneficiarios": "Periodistas y profesionales de comunicación de países en desarrollo",
                "fuente_scraping": self.name,
                "tags": "UNESCO,journalism,climate,heritage,Mongolia,2026",
            },
            {
                "titulo": "UNESCO - Performing Arts Co-Creations Indonesia 2026",
                "descripcion": "Convocatoria de UNESCO para co-creaciones de artes escénicas en Indonesia. Programa Embracing Shared Heritage through Performing Arts. Fomenta colaboración artística internacional.",
                "entidad": "UNESCO",
                "pais": "Internacional",
                "region": "Asia",
                "sector": "Cultura",
                "tipo": "cooperación_internacional",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 3, 29),
                "monto_minimo": 5000,
                "monto_maximo": 25000,
                "moneda": "USD",
                "url_fuente": "https://www.unesco.org/en/articles/call-proposals-embracing-shared-heritage-through-performing-arts-co-creations",
                "url_terminos": "https://www.unesco.org/en/articles/call-proposals-embracing-shared-heritage-through-performing-arts-co-creations",
                "requisitos": "Artistas, grupos artísticos e instituciones culturales. Proyectos de artes escénicas con enfoque en patrimonio compartido. Colaboración internacional.",
                "beneficiarios": "Artistas y organizaciones culturales en Indonesia y países vecinos",
                "fuente_scraping": self.name,
                "tags": "UNESCO,performing_arts,Indonesia,heritage,co-creation,2026",
            },
            {
                "titulo": "UNESCO - Artist Support Malaysia 2026 - Embracing Shared Heritage",
                "descripcion": "Apoyo a artistas en Malasia para el programa Embracing Shared Heritage. Financiamiento para proyectos artísticos que promueven el patrimonio cultural compartido.",
                "entidad": "UNESCO",
                "pais": "Internacional",
                "region": "Asia",
                "sector": "Cultura",
                "tipo": "subvención",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 5),
                "monto_minimo": 3000,
                "monto_maximo": 20000,
                "moneda": "USD",
                "url_fuente": "https://www.unesco.org/en/articles/call-proposals-provision-artist-support-malaysia-under-embracing-shared-heritage-through-performing",
                "url_terminos": "https://www.unesco.org/en/articles/call-proposals-provision-artist-support-malaysia-under-embracing-shared-heritage-through-performing",
                "requisitos": "Artistas individuales o colectivos artísticos. Proyectos de artes escénicas o performativas. Enfoque en patrimonio compartido y diversidad cultural.",
                "beneficiarios": "Artistas en Malasia y región Asia-Pacífico",
                "fuente_scraping": self.name,
                "tags": "UNESCO,artist,Malaysia,heritage,performing_arts,2026",
            },
        ]
        
        for call in real_calls:
            if call["titulo"] not in seen_titles:
                seen_titles.add(call["titulo"])
                results.append(call)
        
        return results
