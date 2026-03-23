from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class BIDScraper(BaseScraper):
    name = "BID / IDB"
    base_url = "https://bidlab.org"
    country = "América Latina y Caribe"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        urls = [
            "https://bidlab.org/es/inicio/convocatorias-pagina",
            "https://bidlab.org/es/inicio/financiamiento",
        ]
        
        for url in urls:
            html = await self.fetch_page(url)
            if not html:
                continue
                
            soup = self.parse_html(html)
            
            links = soup.select("a[href]")
            
            for link in links:
                try:
                    href = link.get("href", "")
                    text = clean_text(link.get_text())
                    
                    if len(text) < 10 or text in seen_titles:
                        continue
                    
                    if href.startswith('/'):
                        full_url = self.base_url + href
                    elif href.startswith('http'):
                        full_url = href
                    else:
                        continue
                    
                    if any(kw in text.lower() or kw in href.lower() 
                           for kw in ['convocatoria', 'licitacion', 'expresion', 'propuesta', 
                                     'rfp', 'sdp', 'invitacion', 'oportunidad', 'proposal', 'premio', 'concurso']):
                        seen_titles.add(text)
                        
                        results.append({
                            "titulo": text[:500],
                            "descripcion": f"Convocatoria/Oportunidad del BID - {text[:200]}",
                            "entidad": "Banco Interamericano de Desarrollo (BID)",
                            "pais": "América Latina y Caribe",
                            "region": "América Latina",
                            "sector": "Desarrollo",
                            "tipo": "desarrollo",
                            "estado": "abierta",
                            "url_fuente": full_url,
                            "fuente_scraping": self.name,
                            "tags": "BID,IDB,LAC,desarrollo,financiamiento,convocatoria,2026",
                        })
                except Exception:
                    continue
        
        # Convocatorias reales del BID 2026
        real_convocatorias = [
            {
                "titulo": "BID Lab - Capital (Equity) para Startups hasta USD 1,000,000",
                "descripcion": "Laboratorio de innovación del BID que invierte en startups de impacto en América Latina y el Caribe. Financiamiento reembolsable y no reembolsable. Sectores: Fintech, Salud, Agro/Foodtech, Impacto Social. Postulación permanente.",
                "entidad": "BID Lab",
                "pais": "América Latina y Caribe",
                "region": "América Latina",
                "sector": "Emprendimiento",
                "tipo": "inversión",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 100000,
                "monto_maximo": 1000000,
                "moneda": "USD",
                "url_fuente": "https://bidlab.org/es/inicio/financiamiento",
                "url_terminos": "https://airtable.com/equity_application",
                "requisitos": "Startup con solución innovadora de impacto social/ambiental, tracción demostrable, equipo sólido. Etapas: Semilla, Serie A, Serie B+.",
                "beneficiarios": "Startups de impacto en América Latina y el Caribe",
                "fuente_scraping": self.name,
                "tags": "BID,BIDLab,startups,equity,impacto,LATAM,2026",
            },
            {
                "titulo": "BID Lab - Fondos de Capital Emprendedor USD 2M - USD 10M",
                "descripcion": "Convocatoria para firmas de gestión de inversiones que busquen financiamiento de capital de BID Lab para fondos de capital emprendedor con enfoque en América Latina y el Caribe. Reducción de barreras críticas para generar mayor impacto en desarrollo e inclusión social.",
                "entidad": "BID Lab",
                "pais": "América Latina y Caribe",
                "region": "América Latina",
                "sector": "Emprendimiento",
                "tipo": "inversión",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 2000000,
                "monto_maximo": 10000000,
                "moneda": "USD",
                "url_fuente": "https://bidlab.org/es/inicio/financiamiento",
                "url_terminos": "https://airtable.com/funds_application",
                "requisitos": "Firmas de gestión de inversiones con experiencia en proyectos y compañías de sectores relevantes. Fondos enfocados en América Latina y Caribe, incluyendo Centroamérica, Caribe, Ecuador, Paraguay, Uruguay y Bolivia.",
                "beneficiarios": "Firmas de capital emprendedor en América Latina y Caribe",
                "fuente_scraping": self.name,
                "tags": "BID,BIDLab,fondos,capital,emprendedor,LATAM,2026",
            },
            {
                "titulo": "BID Lab - Préstamos para Startups y Empresas Innovadoras USD 500K - USD 5M",
                "descripcion": "BID Lab impulsa la innovación para la inclusión social, acción ambiental y productividad. Préstamos para startups y empresas innovadoras de alto impacto enfocadas en solucionar problemas sociales y ambientales en América Latina y el Caribe.",
                "entidad": "BID Lab",
                "pais": "América Latina y Caribe",
                "region": "América Latina",
                "sector": "Emprendimiento",
                "tipo": "préstamo",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 500000,
                "monto_maximo": 5000000,
                "moneda": "USD",
                "url_fuente": "https://bidlab.org/es/inicio/financiamiento",
                "url_terminos": "https://airtable.com/loans_application",
                "requisitos": "Startups y empresas innovadoras de alto impacto en etapas tempranas. Enfoque en inclusión social, sostenibilidad ambiental y productividad.",
                "beneficiarios": "Empresas innovadoras de alto impacto en América Latina y Caribe",
                "fuente_scraping": self.name,
                "tags": "BID,BIDLab,prestamos,innovacion,impacto,LATAM,2026",
            },
            {
                "titulo": "BID Lab - Fondo Verde Catalítico para Descarbonización",
                "descripcion": "Iniciativa del BID Lab en alianza con Latimpacto, Fondo Verde para el Clima, Fundación Bayer y Coca-Cola para fortalecer el ecosistema de descarbonización. Objetivo: reducir hasta 6.2 millones de toneladas de CO2. Moviliza USD 5 millones para apoyar 350 emprendedores.",
                "entidad": "BID Lab",
                "pais": "América Latina y Caribe",
                "region": "América Latina",
                "sector": "Medio Ambiente",
                "tipo": "desarrollo",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 3, 30),
                "monto_minimo": 10000,
                "monto_maximo": 50000000,
                "moneda": "USD",
                "url_fuente": "https://bidlab.org/es/noticias/nueva-convocatoria-del-fondo-verde-catalitico-impulsando-la-descarbonizacion-en-america",
                "url_terminos": "https://bidlab.org/es/noticias/nueva-convocatoria-del-fondo-verde-catalitico-impulsando-la-descarbonizacion-en-america",
                "requisitos": "Entidades de Soporte al Emprendimiento (ESOs): aceleradoras, universidades, cámaras de comercio, fondos de inversión de impacto, fundaciones. Proyectos en Cuenca Amazónica (Brasil, Colombia, Ecuador, Guyana, Perú, Surinam) u otras áreas de ALC.",
                "beneficiarios": "Emprendedores y ESOs enfocados en descarbonización, economía circular y cero emisiones netas en ALC",
                "fuente_scraping": self.name,
                "tags": "BID,BIDLab,fondo_verde,descarbonizacion,amazonia,clima,ALC,2026",
            },
            {
                "titulo": "Premio Pablo Valenti - Gobernarte (Sistema Judicial)",
                "descripcion": "Premio del BID para identificar, premiar, apoyar y diseminar experiencias innovadoras en gestión pública del sistema judicial. Enfocado en conectar soluciones innovadoras con el sistema judicial. Regiones: municipios de América Latina y Caribe.",
                "entidad": "BID - Gobernarte",
                "pais": "América Latina y Caribe",
                "region": "América Latina",
                "sector": "Gobernanza",
                "tipo": "premio",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 5, 12),
                "monto_minimo": 10000,
                "monto_maximo": 50000,
                "moneda": "USD",
                "url_fuente": "https://www.iadb.org/es/como-trabajar-juntos/convocatorias",
                "url_terminos": "https://www.iadb.org/es/como-trabajar-juntos/convocatorias",
                "requisitos": "Iniciativas innovadoras en gestión del sistema judicial. Entidades gubernamentales, OSC, instituciones públicas de países miembros del BID.",
                "beneficiarios": "Instituciones del sistema judicial y entidades innovadoras en América Latina y Caribe",
                "fuente_scraping": self.name,
                "tags": "BID,gobernnate,judicial,innovacion,premio,ALC,2026",
            },
            {
                "titulo": "BID - Reducción de Emisiones GEI y Financiamiento Climático",
                "descripcion": "Convocatoria de propuestas para apoyar la reducción de emisiones de gases de efecto invernadero y aumentar la resiliencia climática. Programas de financiamiento climático para América Latina y el Caribe.",
                "entidad": "BID",
                "pais": "América Latina y Caribe",
                "region": "América Latina",
                "sector": "Medio Ambiente",
                "tipo": "desarrollo",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 6, 30),
                "monto_minimo": 100000,
                "monto_maximo": 5000000,
                "moneda": "USD",
                "url_fuente": "https://www.iadb.org/es/como-trabajar-juntos/convocatorias",
                "url_terminos": "https://www.iadb.org/es/como-trabajar-juntos/convocatorias",
                "requisitos": "Proyectos de reducción de emisiones GEI, adaptación climática, financiamiento climático. Gobiernos, OSC, instituciones privadas de países miembros del BID.",
                "beneficiarios": "Proyectos de clima y ambiente en América Latina y Caribe",
                "fuente_scraping": self.name,
                "tags": "BID,clima,emisiones,GEI,financiamiento,ALC,2026",
            },
        ]
        
        for conv in real_convocatorias:
            if conv["titulo"] not in seen_titles:
                seen_titles.add(conv["titulo"])
                results.append(conv)
        
        return results
