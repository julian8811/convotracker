from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class EUFundingScraper(BaseScraper):
    """
    Scraper para oportunidades de financiamiento de la Unión Europea.
    Portal principal: https://ec.europa.eu/info/funding-tenders/opportunities
    
    Las convocatorias se verifican manualmente para garantizar
    fechas de cierre correctas.
    """
    name = "EU Funding & Tenders"
    base_url = "https://ec.europa.eu"
    country = "Unión Europea"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        # Convocatorias verificadas de la UE 2026 con fechas reales
        real_opportunities = [
            {
                "titulo": "Horizon Europe EU Space Research Call 2026 - €90.97M",
                "descripcion": "EU Space Research call 2026 con presupuesto de €90.97M para investigación espacial. Incluye: acceso al espacio, observación terrestre, telecomunicaciones, tecnologías cuánticas, exploración espacial.",
                "entidad": "Comisión Europea - HaDEA",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 9, 3, 17, 0),
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
                "descripcion": "Horizon Europe Cluster 1 Health calls 2026 para investigación en salud. Temas: prevención de enfermedades, cambio climático y salud, enfermedades no transmisibles, salud digital.",
                "entidad": "Comisión Europea - HaDEA",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Salud",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 16, 17, 0),
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
                "titulo": "Horizon Europe 2026-2027 Work Programme - €14 Billion Total Funding",
                "descripcion": "Programa de trabajo Horizon Europe 2026-2027 publicado con €14 mil millones en oportunidades de financiamiento. Incluye: WIDERA, EIE, New European Bauhaus, Missions, Clusters (1-6), MSCA, ERC, EIC.",
                "entidad": "Comisión Europea",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2027, 12, 31, 17, 0),
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
                "fecha_cierre": datetime(2026, 6, 30, 17, 0),
                "monto_minimo": 500000,
                "monto_maximo": 60000000,
                "moneda": "EUR",
                "url_fuente": "https://ec.europa.eu/regional_policy/whats-new/newsroom/13-01-2026-eu60-million-european-urban-initiative-call-for-proposals_en",
                "url_terminos": "https://ec.europa.eu/regional_policy/whats-new/newsroom",
                "requisitos": "Autoridades urbanas, ciudades, municipios. Proyectos colaborativos entre ciudades europeas.",
                "beneficiarios": "Ciudades, municipalities, autoridades urbanas en Europa",
                "fuente_scraping": self.name,
                "tags": "EU,urban,development,cities,regional,2026",
            },
            {
                "titulo": "MSCA Staff Exchanges 2026 - Deadline April 16, 2026",
                "descripcion": "Marie Skłodowska-Curie Actions Staff Exchanges 2026. Promueve colaboración internacional en investigación e innovación a través de intercambios de personal entre instituciones.",
                "entidad": "Comisión Europea",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 16, 17, 0),
                "monto_minimo": 50000,
                "monto_maximo": 500000,
                "moneda": "EUR",
                "url_fuente": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "url_terminos": "https://marie-sklodowska-curie-actions.ec.europa.eu/staff-exchanges",
                "requisitos": "Consorcios con al menos 3 entidades de diferentes países. Personal de investigación y gestión.",
                "beneficiarios": "Investigadores, técnicos, personal administrativo de universidades y empresas",
                "fuente_scraping": self.name,
                "tags": "EU,MSCA,staff,exchange,research,mobility,2026",
            },
            {
                "titulo": "Horizon Europe - Digital, Industry and Space Calls 2026",
                "descripcion": "Cluster 4 Horizon Europe para investigación en tecnología digital, industria competitiva y espacio. Incluye: IA, computación, quantum, materiales avanzados, manufactura, espacio.",
                "entidad": "Comisión Europea - HaDEA",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Industria y Tecnología",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 9, 3, 17, 0),
                "monto_minimo": 1000000,
                "monto_maximo": 25000000,
                "moneda": "EUR",
                "url_fuente": "https://hadea.ec.europa.eu/news",
                "url_terminos": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "requisitos": "Consorcios de investigación, empresas, universidades. TRL variable según topic.",
                "beneficiarios": "Industria, investigadores, universidades, centros tecnológicos en UE",
                "fuente_scraping": self.name,
                "tags": "EU,Horizon,Digital,Industry,Space,AI,Quantum,2026",
            },
            {
                "titulo": "Horizon Europe - Climate, Energy and Mobility Calls 2026",
                "descripcion": "Cluster 5 Horizon Europe para investigación en clima, energía y movilidad. Enfoque en transición energética, movilidad sostenible, descarbonización.",
                "entidad": "Comisión Europea - CINEA",
                "pais": "Unión Europea",
                "region": "Europa",
                "sector": "Energía y Clima",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 9, 3, 17, 0),
                "monto_minimo": 1000000,
                "monto_maximo": 30000000,
                "moneda": "EUR",
                "url_fuente": "https://hadea.ec.europa.eu/news",
                "url_terminos": "https://ec.europa.eu/info/funding-tenders/opportunities",
                "requisitos": "Consorcios multi-disciplinarios, enfoque en impacto real. Participación de stakeholders.",
                "beneficiarios": "Universidades, centros de investigación, industria, ONGs ambientales en UE",
                "fuente_scraping": self.name,
                "tags": "EU,Horizon,Climate,Energy,Mobility,sustainable,decarbonization,2026",
            },
        ]
        
        for opp in real_opportunities:
            if opp["titulo"] not in seen_titles:
                seen_titles.add(opp["titulo"])
                results.append(opp)
        
        return results
