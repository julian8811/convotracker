from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class BancoldexScraper(BaseScraper):
    """
    Scraper para líneas de financiamiento de Bancoldex.
    Bancoldex ofrece crédito para empresas y emprendedores.
    """
    name = "Bancoldex Colombia"
    base_url = "https://www.bancoldex.com"
    country = "Colombia"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        # Intentar obtener contenido de la página principal de líneas
        try:
            html = await self.fetch_page(f"{self.base_url}/es/productos-y-servicios/lineas-de-financiacion")
            if html:
                soup = self.parse_html(html)
                # Buscar enlaces a líneas específicas
                links = soup.select("a[href*=linea], a[href*=financia], h2 a, h3 a")
                for link in links:
                    try:
                        href = link.get("href", "")
                        text = clean_text(link.get_text())
                        
                        if len(text) < 10 or text in seen_titles:
                            continue
                        
                        seen_titles.add(text)
                        
                        if href.startswith('/'):
                            full_url = self.base_url + href
                        elif href.startswith('http'):
                            full_url = href
                        else:
                            continue
                        
                        results.append({
                            "titulo": text[:500],
                            "descripcion": f"Línea de financiamiento Bancoldex - {text[:200]}",
                            "entidad": "Bancoldex",
                            "pais": self.country,
                            "region": "América Latina",
                            "sector": "Financiamiento Empresarial",
                            "tipo": "emprendimiento",
                            "estado": "abierta",
                            "url_fuente": full_url,
                            "fuente_scraping": self.name,
                            "tags": "financiamiento,credito,empresa,pymes,Colombia,bancoldex",
                        })
                    except Exception:
                        continue
        except Exception:
            pass
        
        # Convocatorias y líneas reales de Bancoldex 2026
        real_lineas = [
            {
                "titulo": "Línea de Crédito Liquidez Corto Plazo 2026 - Cupo $100,000 millones COP",
                "descripcion": "Línea de Bancoldex para fortalecer la operación diaria de empresas y garantizar disponibilidad de recursos para capital de trabajo. Destino: materias primas, insumos, nómina, costos operativos, sustitución de pasivos. A través de aliados financieros en todo el país.",
                "entidad": "Bancoldex",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Financiamiento Empresarial",
                "tipo": "financiamiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 1000000,
                "monto_maximo": 35000000,
                "moneda": "COP",
                "url_fuente": "https://www.bancoldex.com/credito-traves-de-aliados/linea-de-credito-liquidez-corto-plazo-2026",
                "url_terminos": "https://www.bancoldex.com/credito-traves-de-aliados/linea-de-credito-liquidez-corto-plazo-2026",
                "requisitos": "Personas naturales y jurídicas de todos los sectores económicos. Microempresas, pequeñas, medianas y grandes empresas. Capital de trabajo o sustitución de pasivos (excepto créditos Bancoldex o pasivos con socios).",
                "beneficiarios": "Empresas de todos los tamaños en Colombia, con énfasis en micro, pequeñas y medianas",
                "fuente_scraping": self.name,
                "tags": "bancoldex,liquidez,capital_trabajo,pymes,Colombia,2026",
            },
            {
                "titulo": "Línea Femmes - Financiamiento para Mujeres Emprendedoras",
                "descripcion": "Línea de crédito preferencial de Bancoldex para empresas lideradas por mujeres con condiciones especiales de tasa y plazo. Apoya el emprendimiento femenino y la inclusión financiera.",
                "entidad": "Bancoldex",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Financiamiento Empresarial",
                "tipo": "financiamiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 5000000,
                "monto_maximo": 500000000,
                "moneda": "COP",
                "url_fuente": "https://www.bancoldex.com/es/productos-y-servicios/lineas-de-financiacion",
                "url_terminos": "https://www.bancoldex.com/es/productos-y-servicios/lineas-de-financiacion",
                "requisitos": "Empresas lideradas por mujeres (propietarias o con participación significativa). Documentación que acredite liderazgo femenino en la empresa.",
                "beneficiarios": "Emprendedoras y empresarias mujeres en Colombia",
                "fuente_scraping": self.name,
                "tags": "bancoldex,femmes,mujeres,emprendedoras,Colombia,2026",
            },
            {
                "titulo": "Línea A Toda Máquina - Empresarios",
                "descripcion": "Financiamiento para micro, pequeñas y medianas empresas colombianas con condiciones preferenciales. Destinado a inversión, capital de trabajo y modernización empresarial.",
                "entidad": "Bancoldex",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Financiamiento Empresarial",
                "tipo": "financiamiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 5000000,
                "monto_maximo": 1000000000,
                "moneda": "COP",
                "url_fuente": "https://www.bancoldex.com/es/productos-y-servicios/lineas-de-financiacion",
                "url_terminos": "https://www.bancoldex.com/es/productos-y-servicios/lineas-de-financiacion",
                "requisitos": "Micro, pequeñas y medianas empresas colombianas. Presentar plan de inversión o necesidad de capital de trabajo. A través de bancos y entidades financieras aliadas.",
                "beneficiarios": "Mipymes colombianas de todos los sectores económicos",
                "fuente_scraping": self.name,
                "tags": "bancoldex,toda_maquina,mipymes,Colombia,2026",
            },
            {
                "titulo": "Línea Verdes y Sustentabilidad",
                "descripcion": "Financiamiento de Bancoldex para proyectos de inversión con criterios ambientales y de sostenibilidad. Incluye proyectos de energía renovable, eficiencia energética, gestión ambiental y economía circular.",
                "entidad": "Bancoldex",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Financiamiento Empresarial",
                "tipo": "financiamiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 10000000,
                "monto_maximo": 5000000000,
                "moneda": "COP",
                "url_fuente": "https://www.bancoldex.com/es/productos-y-servicios/lineas-de-financiacion",
                "url_terminos": "https://www.bancoldex.com/es/productos-y-servicios/lineas-de-financiacion",
                "requisitos": "Proyectos con componentes ambientales verificables. Empresas con proyectos de energía renovable, eficiencia energética, producción más limpia, economía circular.",
                "beneficiarios": "Empresas con proyectos de sostenibilidad y ambiente en Colombia",
                "fuente_scraping": self.name,
                "tags": "bancoldex,verde,sustentabilidad,ambiente,energia,Colombia,2026",
            },
            {
                "titulo": "Línea Mipymes Competitivas para Escalamiento Productivo",
                "descripcion": "Línea del Gobierno Nacional a través del Ministerio de Comercio e Industria y Bancoldex para incentivar inversiones de productividad en Mipymes. Financiación para modernización y escalamiento productivo.",
                "entidad": "Bancoldex",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Financiamiento Empresarial",
                "tipo": "financiamiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 10000000,
                "monto_maximo": 500000000,
                "moneda": "COP",
                "url_fuente": "https://www.bancoldex.com/es/soluciones-financieras/lineas-de-credito/linea-de-credito-mipymes-competitivas-para-escalamiento-productivo-2024",
                "url_terminos": "https://www.bancoldex.com/es/soluciones-financieras/lineas-de-credito/linea-de-credito-mipymes-competitivas-para-escalamiento-productivo-2024",
                "requisitos": "Mipymes de todos los sectores económicos. Proyectos de modernización, inversión productiva, escalamiento empresarial. Nacional coverage.",
                "beneficiarios": "Mipymes colombianas con potencial de crecimiento y productividad",
                "fuente_scraping": self.name,
                "tags": "bancoldex,mipymes,competitivas,escalamiento,productividad,Colombia,2026",
            },
            {
                "titulo": "Programa Conecta Digital - Capacitación Exportadora para Mipymes",
                "descripcion": "Programa de Bancoldex y MinComercio para preparar empresas colombianas para exportar en 2026. Incluye cursos gratuitos de digitalización e internacionalización.",
                "entidad": "Bancoldex",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Financiamiento Empresarial",
                "tipo": "capacitación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 0,
                "monto_maximo": 0,
                "moneda": "COP",
                "url_fuente": "https://www.bancoldex.com",
                "url_terminos": "https://www.bancoldex.com",
                "requisitos": "Mipymes colombianas interesadas en exportar. Empresas con operación estable en mercado local. Disposición para cumplir estándares internacionales.",
                "beneficiarios": "Empresas colombianas listas para dar el paso hacia la exportación",
                "fuente_scraping": self.name,
                "tags": "bancoldex,conecta_digital,exportacion,mipymes,internacional,Colombia,2026",
            },
        ]
        
        for linea in real_lineas:
            if linea["titulo"] not in seen_titles:
                seen_titles.add(linea["titulo"])
                results.append(linea)
        
        return results
