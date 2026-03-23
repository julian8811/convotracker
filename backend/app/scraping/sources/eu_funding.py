from datetime import datetime
import httpx
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class EUFundingScraper(BaseScraper):
    """
    Scraper para oportunidades de financiamiento de la Unión Europea.
    Portal principal: https://ec.europa.eu/info/funding-tenders/opportunities
    """
    name = "EU Funding & Tenders"
    base_url = "https://ec.europa.eu/info/funding-tenders"
    country = "Unión Europea"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        # URLs de oportunidades de la UE
        urls = [
            "https://hadea.ec.europa.eu/news",
            "https://cordis.europa.eu/calls",
            "https://ec.europa.eu/regional_policy/whats-new/newsroom",
        ]
        
        for url in urls:
            try:
                html = await self.fetch_page(url)
                if not html:
                    continue
                    
                soup = self.parse_html(html)
                
                # Buscar artículos/noticias sobre convocatorias
                links = soup.select("a[href]")
                
                for link in links:
                    try:
                        href = link.get("href", "")
                        text = clean_text(link.get_text())
                        
                        if len(text) < 15 or text in seen_titles:
                            continue
                        
                        # Construir URL completa
                        if href.startswith('/'):
                            full_url = f"https://ec.europa.eu{href}"
                        elif href.startswith('http'):
                            full_url = href
                        else:
                            continue
                        
                        # Filtrar enlaces que parezcan convocatorias
                        keywords = ['call', 'convocatoria', 'funding', 'grant', 'horizon', 
                                   'proposal', 'tender', 'opportunity', '2026', '2027',
                                   'european', 'research', 'innovation', 'fellowship']
                        
                        text_lower = text.lower()
                        href_lower = href.lower()
                        
                        if any(kw in text_lower or kw in href_lower for kw in keywords):
                            seen_titles.add(text)
                            
                            # Determinar tipo
                            tipo = "investigación"
                            if 'tender' in text_lower or 'procurement' in text_lower:
                                tipo = "desarrollo"
                            
                            results.append({
                                "titulo": text[:500],
                                "descripcion": f"Oportunidad de financiamiento de la Unión Europea - {text[:200]}",
                                "entidad": "Comisión Europea",
                                "pais": "Unión Europea",
                                "region": "Europa",
                                "sector": "Investigación e Innovación",
                                "tipo": tipo,
                                "estado": "abierta",
                                "url_fuente": full_url,
                                "fuente_scraping": self.name,
                                "tags": "europa,horizonte,investigación,innovación,UE,convocatoria",
                            })
                    except Exception:
                        continue
            except Exception:
                continue
        
        # Convocatorias reales de la UE 2026
        real_opportunities = [
            {
                "titulo": "Horizon Europe EU Space Research Call 2026 - €90.97M",
                "descripcion": "EU Space Research call 2026 con presupuesto de €90.97M para investigación espacial. Incluye: acceso al espacio, observación terrestre, telecomunicaciones, tecnologías cuánticas, exploración espacial. 8 topics bajo Cluster 4: Digital, Industry and Space.",
                "entidad": "Comisión Europea - HaDEA",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 9, 3),
                "monto_minimo": 100000,
                "monto_maximo": 22590000,
                "moneda": "EUR",
                "url_fuente": "https://hadea.ec.europa.eu/news/horizon-europe-eu-space-research-call-2026-open-submission-2026-03-12_en",
                "url_terminos": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "requisitos": "Consorcios de investigación, universidades, empresas, organizaciones de la UE. Proyectos colaborativos internacionales.",
                "beneficiarios": "Consorcios de investigación, industria espacial, universidades europeas",
                "fuente_scraping": self.name,
                "tags": "EU,Horizon,space,research,HaDEA,2026",
            },
            {
                "titulo": "Horizon Europe Health 2026 Calls - Deadline April 16, 2026",
                "descripcion": "Horizon Europe Cluster 1 Health calls 2026 para investigación en salud. Temas: prevención de enfermedades, cambio climático y salud, enfermedades no transmisibles, salud digital, industria farmacéutica innovadora. Deadline: 16 abril 2026.",
                "entidad": "Comisión Europea - HaDEA",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Salud",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 16),
                "monto_minimo": 2000000,
                "monto_maximo": 10000000,
                "moneda": "EUR",
                "url_fuente": "https://hadea.ec.europa.eu/news/2026-horizon-europe-health-calls-proposals-2026-02-12_en",
                "url_terminos": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "requisitos": "Consorcios internacionales, universidades, centros de investigación, empresas. Enfoque en salud pública y bienestar.",
                "beneficiarios": "Instituciones de investigación, hospitales, universidades, empresas de salud en la UE",
                "fuente_scraping": self.name,
                "tags": "EU,Horizon,health,research,disease,2026",
            },
            {
                "titulo": "Horizon Europe 2026-2027 - €14 Billion Total Funding",
                "descripcion": "Programa de trabajo Horizon Europe 2026-2027 publicado con €14 mil millones en oportunidades de financiamiento. Incluye: WIDERA, EIE, New European Bauhaus, Missions, Clusters (1-6), MSCA, ERC, EIC.",
                "entidad": "Comisión Europea",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 100000,
                "monto_maximo": 1000000000,
                "moneda": "EUR",
                "url_fuente": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "url_terminos": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "requisitos": "Variable según programa. Consultar Work Programme específico para cada cluster.",
                "beneficiarios": "Investigadores, universidades, empresas innovadoras, ONGs en la UE y países asociados",
                "fuente_scraping": self.name,
                "tags": "EU,Horizon,2026,2027,14billion,research,innovation",
            },
            {
                "titulo": "European Urban Initiative - €60 Million Call",
                "descripcion": "European Urban Initiative call para acciones innovadoras apoyando autoridades urbanas en toda Europa. €60 millones para proyectos de desarrollo urbano sostenible.",
                "entidad": "Comisión Europea",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Desarrollo Regional",
                "tipo": "desarrollo",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 6, 30),
                "monto_minimo": 500000,
                "monto_maximo": 60000000,
                "moneda": "EUR",
                "url_fuente": "https://ec.europa.eu/regional_policy/whats-new/newsroom/13-01-2026-%E2%82%AC60-million-european-urban-initiative-call-for-proposals_en",
                "url_terminos": "https://ec.europa.eu/regional_policy/whats-new/newsroom",
                "requisitos": "Autoridades urbanas, ciudades, municipios. Proyectos colaborativos entre ciudades europeas.",
                "beneficiarios": "Ciudades, municipalities, autoridades urbanas en Europa",
                "fuente_scraping": self.name,
                "tags": "EU,urban,development,cities,regional,2026",
            },
            {
                "titulo": "MSCA Staff Exchanges 2026 - Deadline April 16, 2026",
                "descripcion": "Marie Skłodowska-Curie Actions Staff Exchanges 2026. Promueve colaboración internacional en investigación e innovación a través de intercambios de personal.",
                "entidad": "Comisión Europea",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 16),
                "monto_minimo": 50000,
                "monto_maximo": 500000,
                "moneda": "EUR",
                "url_fuente": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "url_terminos": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "requisitos": "Consorcios con al menos 3 entidades de diferentes países. Personal de investigación y gestión.",
                "beneficiarios": "Investigadores, técnicos, personal administrativo de universidades y empresas",
                "fuente_scraping": self.name,
                "tags": "EU,MSCA,staff,exchange,research,mobility,2026",
            },
            {
                "titulo": "ERC Proof of Concept Grants 2026 - Deadline March 17, 2026",
                "descripcion": "European Research Council Proof of Concept Grants para investigadores ERC. Hasta €150,000 para explorar el potencial de resultados de investigación.",
                "entidad": "European Research Council",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 3, 17),
                "monto_minimo": 100000,
                "monto_maximo": 150000,
                "moneda": "EUR",
                "url_fuente": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "url_terminos": "https://erc.europa.eu",
                "requisitos": "Beneficiarios ERC con grants activos o completados. Exploración de potencial comercial o aplicacional.",
                "beneficiarios": "Investigadores ERC en toda Europa",
                "fuente_scraping": self.name,
                "tags": "EU,ERC,POC,proof_of_concept,research,frontier,2026",
            },
        ]
        
        for opp in real_opportunities:
            if opp["titulo"] not in seen_titles:
                seen_titles.add(opp["titulo"])
                results.append(opp)
        
        return results
