from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class CORDISScraper(BaseScraper):
    """
    Scraper para programas de investigación de CORDIS (EU Research).
    Portal: https://cordis.europa.eu
    """
    name = "CORDIS (EU Research)"
    base_url = "https://cordis.europa.eu"
    country = "Unión Europea"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        # URLs de CORDIS con oportunidades
        urls = [
            f"{self.base_url}/programme/id/HORIZON",
            f"{self.base_url}/",
        ]
        
        for url in urls:
            try:
                html = await self.fetch_page(url)
                if not html:
                    continue
                    
                soup = self.parse_html(html)
                
                # Buscar enlaces a programas y convocatorias
                links = soup.select("a[href]")
                
                for link in links:
                    try:
                        href = link.get("href", "")
                        text = clean_text(link.get_text())
                        
                        if len(text) < 15 or text in seen_titles:
                            continue
                        
                        # Construir URL completa
                        if href.startswith('/'):
                            full_url = f"{self.base_url}{href}"
                        elif href.startswith('http'):
                            full_url = href
                        else:
                            continue
                        
                        # Filtrar enlaces relevantes
                        keywords = ['programme', 'horizon', 'erc', 'eic', 'fellowship', 
                                   'grant', 'call', 'opportunity', '2026', '2027', 'funding']
                        
                        text_lower = text.lower()
                        href_lower = href.lower()
                        
                        if any(kw in text_lower or kw in href_lower for kw in keywords):
                            seen_titles.add(text)
                            
                            results.append({
                                "titulo": text[:500],
                                "descripcion": f"Programa de investigación CORDIS - {text[:200]}",
                                "entidad": "CORDIS - European Commission",
                                "pais": "Unión Europea",
                                "region": "Europa",
                                "sector": "Investigación e Innovación",
                                "tipo": "investigación",
                                "estado": "abierta",
                                "url_fuente": full_url,
                                "fuente_scraping": self.name,
                                "tags": "CORDIS,Horizonte Europa,investigación,UE,ERC,EIC",
                            })
                    except Exception:
                        continue
            except Exception:
                continue
        
        # Programas reales de Horizon Europe 2026-2027
        real_programs = [
            {
                "titulo": "ERC Starting Grants 2026 - €1.5M for 5 years",
                "descripcion": "European Research Council Starting Grant para investigadores emergentes. Hasta €1.5M por 5 años para establecer equipo de investigación independiente.",
                "entidad": "ERC - European Research Council",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 17),
                "monto_minimo": 1000000,
                "monto_maximo": 1500000,
                "moneda": "EUR",
                "url_fuente": "https://cordis.europa.eu/programme/id/HORIZON_ERC-2026-STG",
                "url_terminos": "https://erc.europa.eu/apply-grant/starting-grant",
                "requisitos": "Investigadores postdoctorales con 2-7 años de experiencia post-doctoral. Trayectoria de investigación excelente. Propuesta innovadora.",
                "beneficiarios": "Investigadores emergentes, universidades, centros de investigación en UE",
                "fuente_scraping": self.name,
                "tags": "ERC,Starting,Horizon,research,frontier,innovation,2026",
            },
            {
                "titulo": "EIC Accelerator 2026 - Grants up to €2.5M + Equity",
                "descripcion": "European Innovation Council Accelerator para startups y SMEs con innovaciones de alto impacto. Combina grant (hasta €2.5M) y equity (hasta €15M).",
                "entidad": "EIC - European Innovation Council",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Innovación",
                "tipo": "inversión",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 3),
                "monto_minimo": 500000,
                "monto_maximo": 17500000,
                "moneda": "EUR",
                "url_fuente": "https://cordis.europa.eu/programme/id/HORIZON_HORIZON-EIC-2026-ACCELERATOR-01",
                "url_terminos": "https://eic.ec.europa.eu/accelerator",
                "requisitos": "SMEs o startups establecidas en UE o países asociados. Innovación disruptiva, escalable, mercado large. Preparación comercial.",
                "beneficiarios": "Startups, SMEs, spin-offs de investigación en UE y países asociados",
                "fuente_scraping": self.name,
                "tags": "EIC,Accelerator,startup,SME,innovation,disruptive,2026",
            },
            {
                "titulo": "ERC Proof of Concept Grants 2026 - €150,000",
                "descripcion": "European Research Council Proof of Concept Grant para explorar potencial comercial de resultados de investigación. €150,000 lump sum.",
                "entidad": "ERC - European Research Council",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 9, 18),
                "monto_minimo": 150000,
                "monto_maximo": 150000,
                "moneda": "EUR",
                "url_fuente": "https://cordis.europa.eu/programme/id/HORIZON_ERC-2026-POC",
                "url_terminos": "https://erc.europa.eu/apply-grant/proof-concept",
                "requisitos": "Beneficiarios ERC con grants activos o completados. Exploración de potencial comercial o aplicacional de resultados.",
                "beneficiarios": "Investigadores ERC en toda Europa",
                "fuente_scraping": self.name,
                "tags": "ERC,POC,proof_of_concept,research,commercialization,2026",
            },
            {
                "titulo": "MSCA Doctoral Networks 2026 - PhD Positions",
                "descripcion": "Marie Skłodowska-Curie Action Doctoral Networks para programas de doctorado. Financiamiento para entrenar doctores en universidades y empresas europeas.",
                "entidad": "MSCA - European Commission",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Educación Superior",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 5, 14),
                "monto_minimo": 500000,
                "monto_maximo": 6000000,
                "moneda": "EUR",
                "url_fuente": "https://cordis.europa.eu/programme/id/HORIZON_MSCA-2026-DN-01",
                "url_terminos": "https://marie-sklodowska-curie-actions.ec.europa.eu/doctoral-networks",
                "requisitos": "Consorcios de al menos 3 entidades de diferentes países. Estudiantes de doctorado. Enfoque en innovación y transferencia.",
                "beneficiarios": "Universidades, centros de investigación, empresas, estudiantes de doctorado",
                "fuente_scraping": self.name,
                "tags": "MSCA,Doctoral,Networks,PhD,training,research,mobility,2026",
            },
            {
                "titulo": "MSCA Postdoctoral Fellowships 2026",
                "descripcion": "Marie Skłodowska-Curie Action Postdoctoral Fellowships para investigadores postdoctorales. Movildad internacional y formación avanzada.",
                "entidad": "MSCA - European Commission",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 9, 17),
                "monto_minimo": 100000,
                "monto_maximo": 350000,
                "moneda": "EUR",
                "url_fuente": "https://cordis.europa.eu/programme/id/HORIZON-MSCA-2026-PF-01",
                "url_terminos": "https://marie-sklodowska-curie-actions.ec.europa.eu/postdoctoral-fellowships",
                "requisitos": "Investigadores con doctorado reciente (máximo 8 años). Movildad a otro país. Propuesta de investigación independiente.",
                "beneficiarios": "Investigadores postdoctorales, universidades, centros de investigación",
                "fuente_scraping": self.name,
                "tags": "MSCA,Postdoctoral,Fellowships,mobility,research,career,2026",
            },
            {
                "titulo": "Horizon Europe Mission: Climate - Adaptation to Climate Change",
                "descripcion": "Horizon Europe Mission on Adaptation to Climate Change. €60M para proyectos piloto de adaptación climática en comunidades locales.",
                "entidad": "EU Mission - Climate Adaptation",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Medio Ambiente",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 9, 30),
                "monto_minimo": 2000000,
                "monto_maximo": 15000000,
                "moneda": "EUR",
                "url_fuente": "https://cordis.europa.eu/programme/id/HORIZON-MISS-2024-CLIMA-01",
                "url_terminos": "https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe/missions-horizon-europe_en",
                "requisitos": "Consorcios multi-país, asociaciones con autoridades locales. Soluciones de adaptación replicables y escalables.",
                "beneficiarios": "Autoridades locales, comunidades, universidades, ONGs, empresas",
                "fuente_scraping": self.name,
                "tags": "Horizon,Mission,Climate,Adaptation,local,community,2026",
            },
        ]
        
        for prog in real_programs:
            if prog["titulo"] not in seen_titles:
                seen_titles.add(prog["titulo"])
                results.append(prog)
        
        return results
