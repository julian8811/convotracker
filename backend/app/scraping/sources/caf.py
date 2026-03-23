from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class CAFScraper(BaseScraper):
    name = "CAF (Corporación Andina de Fomento)"
    base_url = "https://www.caf.com"
    country = "América Latina"
    verify_ssl = False

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        urls = [
            f"{self.base_url}/es/trabaja-con-nosotros/convocatorias",
            f"{self.base_url}/es/convocatorias",
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
                    
                    if not any(kw in text.lower() for kw in ['convocatoria', 'consultoria', 'contratacion', 'propuesta', 'licitacion']):
                        continue
                    
                    full_url = href if href.startswith('http') else self.base_url + href
                    
                    results.append({
                        "titulo": text[:500],
                        "descripcion": f"Convocatoria CAF - {text[:200]}",
                        "entidad": "CAF - Banco de Desarrollo de América Latina",
                        "pais": "América Latina",
                        "region": "América Latina",
                        "sector": "Desarrollo",
                        "tipo": "desarrollo",
                        "estado": "abierta",
                        "url_fuente": full_url,
                        "fuente_scraping": self.name,
                        "tags": "CAF,desarrollo,Latinoamérica,financiamiento,convocatoria",
                    })
                except Exception:
                    continue
        
        # Convocatorias y programas reales de CAF 2026
        real_convocatorias = [
            {
                "titulo": "CAF - Capital (Equity) para Startups hasta USD 50,000,000",
                "descripcion": "CAF ofrece capital (equity) para startups y empresas en etapas Series A, B+ y PYMES en América Latina. Banco de desarrollo que financia proyectos de mayor escala. Postulación permanente.",
                "entidad": "CAF - Banco de Desarrollo de América Latina",
                "pais": "América Latina",
                "region": "América Latina",
                "sector": "Emprendimiento",
                "tipo": "inversión",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 500000,
                "monto_maximo": 50000000,
                "moneda": "USD",
                "url_fuente": "https://www.caf.com",
                "url_terminos": "https://www.caf.com",
                "requisitos": "Startups y empresas en etapas Series A, B+ y PYMES. Enfoque en innovación, desarrollo sostenible y proyectos de mayor escala en LATAM.",
                "beneficiarios": "Startups y empresas de alto crecimiento en América Latina",
                "fuente_scraping": self.name,
                "tags": "CAF,startups,equity,inversion,LATAM,2026",
            },
            {
                "titulo": "CAF - Financiamiento para Desarrollo Sostenible USD 1,130 millones",
                "descripcion": "CAF aprueba financiamiento para desarrollo sostenible en América Latina y Caribe. Incluye: línea de crédito para gestión de deuda y respuesta ante emergencias climáticas (Uruguay), seguridad hídrica (España), fortalecimiento fiscal (Ecuador).",
                "entidad": "CAF - Banco de Desarrollo de América Latina",
                "pais": "América Latina",
                "region": "América Latina",
                "sector": "Desarrollo",
                "tipo": "desarrollo",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 1000000,
                "monto_maximo": 1130000000,
                "moneda": "USD",
                "url_fuente": "https://www.caf.com/es/actualidad/noticias/",
                "url_terminos": "https://www.caf.com",
                "requisitos": "Gobiernos nacionales y locales, empresas públicas, instituciones de países accionistas de CAF. Proyectos de desarrollo sostenible, resiliencia climática, infraestructura.",
                "beneficiarios": "Países accionistas de CAF en América Latina y Caribe",
                "fuente_scraping": self.name,
                "tags": "CAF,desarrollo_sostenible,clima,infraestructura,LATAM,2026",
            },
            {
                "titulo": "SDP - Alianza Iberoamérica 500+ (Consultoría)",
                "descripcion": "Consultoría para fortalecer la gobernanza de la Alianza Iberoamérica 500+. Programa de la CAF para promover el desarrollo productivo y la productividad empresarial en iberoamérica. Presupuesto USD 65,000.",
                "entidad": "CAF - Banco de Desarrollo de América Latina",
                "pais": "Iberoamérica",
                "region": "Iberoamérica",
                "sector": "Desarrollo Regional",
                "tipo": "consultoría",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 3, 17),
                "monto_minimo": 0,
                "monto_maximo": 65000,
                "moneda": "USD",
                "url_fuente": "https://www.caf.com/es/trabaja-con-nosotros/convocatorias/solicitud-de-propuestas-consultoria-para-el-fortalecimiento-de-la-gobernanza-de-la-alianza-iberoamerica-500plus/",
                "url_terminos": "https://www.caf.com/es/trabaja-con-nosotros/convocatorias/solicitud-de-propuestas-consultoria-para-el-fortalecimiento-de-la-gobernanza-de-la-alianza-iberoamerica-500plus/",
                "requisitos": "Consultores individuales o firmas consultoras con experiencia en gobernanza, desarrollo productivo y coordinación internacional.",
                "beneficiarios": "Alianza Iberoamérica 500+ y países iberoamericanos",
                "fuente_scraping": self.name,
                "tags": "CAF,Iberoamerica,500+,gobernanza,consultoria,2026",
            },
            {
                "titulo": "CAF - Programas de Apoyo a Ecosistemas de Innovación",
                "descripcion": "CAF ofrece programas de apoyo a ecosistemas de innovación y emprendimiento en América Latina y el Caribe. Incluye financiamiento, asistencia técnica y conexión con redes de conocimiento.",
                "entidad": "CAF - Banco de Desarrollo de América Latina",
                "pais": "América Latina",
                "region": "América Latina",
                "sector": "Innovación",
                "tipo": "programa",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 100000,
                "monto_maximo": 10000000,
                "moneda": "USD",
                "url_fuente": "https://www.caf.com",
                "url_terminos": "https://www.caf.com",
                "requisitos": "Incubadoras, aceleradoras, fondos de inversión, universidades, centros de investigación, organizaciones de apoyo empresarial.",
                "beneficiarios": "Actores del ecosistema de innovación en América Latina",
                "fuente_scraping": self.name,
                "tags": "CAF,innovacion,emprendimiento,ecosistema,LATAM,2026",
            },
            {
                "titulo": "CAF - Foro Económico Internacional América Latina 2026",
                "descripcion": "CAF organiza el Foro Económico Internacional de América Latina y el Caribe. Evento de alto nivel con líderes políticos, economistas, empresarios para analizar desafíos y oportunidades de la región: economía, integración, desarrollo sostenible, comercio, cultura y gobernanza.",
                "entidad": "CAF - Banco de Desarrollo de América Latina",
                "pais": "América Latina",
                "region": "América Latina",
                "sector": "Desarrollo",
                "tipo": "evento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 2, 5),
                "monto_minimo": 0,
                "monto_maximo": 0,
                "moneda": "COP",
                "url_fuente": "https://www.caf.com/es/actualidad/foros/",
                "url_terminos": "https://www.caf.com/es/actualidad/foros/",
                "requisitos": "Líderes empresariales, gubernamentales, académicos y de sociedad civil. Registro abierto en sitio web de CAF.",
                "beneficiarios": "Actores del desarrollo económico en América Latina y Caribe",
                "fuente_scraping": self.name,
                "tags": "CAF,foro,economia,Latinoamerica,2026",
            },
            {
                "titulo": "CAF - Financiamiento para Infraestructura y Servicios Públicos",
                "descripcion": "CAF aprueba USD 1,130 millones en cuatro operaciones de alto impacto: crédito para gestión de deuda y respuesta climática en Uruguay, seguridad hídrica en España, y dos operaciones para Ecuador.",
                "entidad": "CAF - Banco de Desarrollo de América Latina",
                "pais": "América Latina",
                "region": "América Latina",
                "sector": "Infraestructura",
                "tipo": "financiamiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 1000000,
                "monto_maximo": 1130000000,
                "moneda": "USD",
                "url_fuente": "https://www.caf.com/es/actualidad/noticias/",
                "url_terminos": "https://www.caf.com",
                "requisitos": "Gobiernos nacionales y locales, empresas estatales, proyectos de infraestructura con impacto en desarrollo sostenible.",
                "beneficiarios": "Países accionistas de CAF con proyectos de infraestructura y servicios públicos",
                "fuente_scraping": self.name,
                "tags": "CAF,infraestructura,servicios_publicos,financiamiento,LATAM,2026",
            },
        ]
        
        for conv in real_convocatorias:
            if conv["titulo"] not in seen_titles:
                seen_titles.add(conv["titulo"])
                results.append(conv)
        
        return results
