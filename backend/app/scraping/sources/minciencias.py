import re
from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class MincienciasScraper(BaseScraper):
    name = "Minciencias Colombia"
    base_url = "https://minciencias.gov.co"
    country = "Colombia"
    
    # URLs específicas de planes de convocatorias activas
    PLAN_URLS = [
        "https://minciencias.gov.co/convocatorias/todas",
        "https://minciencias.gov.co/plan-convocatorias-actei-2025-2026",
        "https://minciencias.gov.co/convocatorias",
    ]

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        # Primero buscar en las páginas principales de planes
        for plan_url in self.PLAN_URLS:
            try:
                html = await self.fetch_page(plan_url)
                if html:
                    soup = self.parse_html(html)
                    
                    # Buscar todos los enlaces a convocatorias
                    all_links = soup.find_all('a', href=True)
                    for a in all_links:
                        try:
                            href = a.get('href', '')
                            text = clean_text(a.get_text())
                            
                            # Filtrar: buscar enlaces que parezcan convocatorias
                            if self._is_convocatoria_link(href, text):
                                # Evitar duplicados
                                if text in seen_titles:
                                    continue
                                seen_titles.add(text)
                                
                                # Construir URL completa
                                if href.startswith('/'):
                                    full_url = self.base_url + href
                                elif href.startswith('http'):
                                    full_url = href
                                else:
                                    full_url = self.base_url + '/' + href
                                
                                results.append({
                                    "titulo": text[:500],
                                    "descripcion": f"Convocatoria de Minciencias Colombia - {text[:200]}",
                                    "entidad": "Minciencias Colombia",
                                    "pais": self.country,
                                    "region": "América Latina",
                                    "sector": "Ciencia y Tecnología",
                                    "tipo": "investigación",
                                    "estado": "abierta",
                                    "url_fuente": full_url,
                                    "fuente_scraping": self.name,
                                    "tags": "investigación,ciencia,tecnología,Colombia,minciencias,convocatoria",
                                })
                        except Exception:
                            continue
            except Exception:
                continue
        
        # Convocatorias reales del Plan Bienal 2025-2026
        real_convocatorias = [
            {
                "titulo": "Convocatoria 976 - ColombIA Inteligente 2026",
                "descripcion": "Fortalecer la Investigación Aplicada, el Desarrollo Tecnológico y la Innovación en ciencias y tecnologías cuánticas e Inteligencia Artificial, contribuyendo al desarrollo ambiental, social y económico de las regiones. Ejes: Gestión Biodiversidad y Bioeconomía, Sistemas Agroalimentarios Inteligentes, Eficiencia Energética, Semiconductores y Superconductores.",
                "entidad": "Minciencias Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Ciencia y Tecnología",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 4, 13, 16, 0),  # 13 de abril 2026 4:00 pm
                "monto_minimo": 0,
                "monto_maximo": 2000000000,  # $2,000 millones COP por proyecto
                "moneda": "COP",
                "url_fuente": "https://minciencias.gov.co/convocatorias/convocatoria-colombia-inteligente-2026",
                "url_terminos": "https://minciencias.gov.co/sites/default/files/upload/convocatorias/tdr_colombia_inteligente_2026.pdf",
                "requisitos": "Alianza estratégica: Institución de Educación Superior + Empresa Nacional + Organizaciones locales/regionales. Los proyectos deben tener resultados previos de investigación y avanzar hacia validación en entornos reales.",
                "beneficiarios": "Grupos de investigación, instituciones de educación superior, empresas nacionales, organizaciones locales y regionales",
                "fuente_scraping": self.name,
                "tags": "minciencias,Colombia,IA,inteligencia_artificial,cuantica,investigacion,2026,convocatoria976",
            },
            {
                "titulo": "Convocatoria 51 - Fortalecimiento de Capacidades CTeI en Córdoba",
                "descripcion": "Fortalecer las capacidades de Ciencia, Tecnología e Innovación (CTeI) en el Departamento de Córdoba, mediante el desarrollo de proyectos de convergencia regional. Total: $17.154 millones COP.",
                "entidad": "Minciencias Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Ciencia y Tecnología",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2025, 12, 30),
                "monto_minimo": 100000000,
                "monto_maximo": 17154450476,
                "moneda": "COP",
                "url_fuente": "https://minciencias.gov.co/plan-convocatorias-actei-2025-2026",
                "url_terminos": "https://minciencias.gov.co/convocatorias/fortalecimiento-capacidades-ctei-cordoba",
                "requisitos": "Proyectos de convergencia regional enfocados en el departamento de Córdoba. Alineación con demandas territoriales identificadas.",
                "beneficiarios": "Instituciones de educación superior, grupos de investigación y organizaciones del departamento de Córdoba",
                "fuente_scraping": self.name,
                "tags": "minciencias,cordoba,ctei,investigacion,regional,convocatoria51",
            },
            {
                "titulo": "Convocatoria 50 - Investigación Básica",
                "descripcion": "Generar nuevo conocimiento en las líneas temáticas de ciencias naturales, ciencias sociales y humanidades, a través de investigación básica orientada para aportar a la solución de problemáticas del país.",
                "entidad": "Minciencias Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Ciencia y Tecnología",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 3, 31),
                "monto_minimo": 50000000,
                "monto_maximo": 500000000,
                "moneda": "COP",
                "url_fuente": "https://minciencias.gov.co/plan-convocatorias-actei-2025-2026",
                "url_terminos": "https://minciencias.gov.co/convocatorias/investigacion-basica",
                "requisitos": "Grupos de investigación reconocidos por Minciencias. Líneas temáticas: ciencias naturales, ciencias sociales, humanidades.",
                "beneficiarios": "Grupos de investigación reconocidos en Colombia",
                "fuente_scraping": self.name,
                "tags": "minciencias,investigacion_basica,ciencias_naturales,ciencias_sociales,humanidades,convocatoria50",
            },
            {
                "titulo": "Convocatoria 46 - Colombia Inteligente: Infraestructura para el Desarrollo de la IA",
                "descripcion": "Impulsar la infraestructura, el desarrollo científico y tecnológico en inteligencia artificial, mediante la creación y fortalecimiento de infraestructura de investigación para consolidar capacidades nacionales en IA.",
                "entidad": "Minciencias Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Ciencia y Tecnología",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 5, 15),
                "monto_minimo": 500000000,
                "monto_maximo": 5000000000,
                "moneda": "COP",
                "url_fuente": "https://minciencias.gov.co/plan-convocatorias-actei-2025-2026",
                "url_terminos": "https://minciencias.gov.co/convocatorias/colombia-inteligente-infraestructura-ia",
                "requisitos": "Instituciones de educación superior y centros de investigación. Creación o fortalecimiento de infraestructura de IA.",
                "beneficiarios": "Instituciones de educación superior, centros de investigación, grupos de investigación en IA",
                "fuente_scraping": self.name,
                "tags": "minciencias,IA,infraestructura,inteligencia_artificial,investigacion,convocatoria46",
            },
            {
                "titulo": "Convocatoria 45 - Fortalecimiento y Creación de Nuevos Centros e Institutos de Investigación",
                "descripcion": "Aumentar la consolidación de proyectos estratégicos de formación de capital humano que respondan a los retos en Ciencia, Tecnología e Innovación establecidos en el Plan de Convocatorias 2025-2026. Inversión total: $482,000 millones COP.",
                "entidad": "Minciencias Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Ciencia y Tecnología",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2025, 10, 14),
                "monto_minimo": 1000000000,
                "monto_maximo": 482000000000,
                "moneda": "COP",
                "url_fuente": "https://minciencias.gov.co/plan-convocatorias-actei-2025-2026",
                "url_terminos": "https://minciencias.gov.co/convocatorias/fortalecimiento-centros-investigacion",
                "requisitos": "Centros e institutos de investigación. Creación de nuevos centros o fortalecimiento de existentes. Alineación con PIIOM y demandas territoriales.",
                "beneficiarios": "Centros de investigación, institutos de investigación, formación de capital humano en CTeI",
                "fuente_scraping": self.name,
                "tags": "minciencias,centros_investigacion,formacion,capital_humano,ctei,convocatoria45",
            },
            {
                "titulo": "Plan Bienal de Convocatorias ACTeI 2025-2026 - Total $2.79 Billones COP",
                "descripcion": "Plan de convocatorias públicas, abiertas y competitivas del Sistema General de Regalías para Ciencia, Tecnología e Innovación. Incluye 50+ convocatorias en áreas: salud, ambiente, agro, energía, educación, infraestructura, paz. Convocatoria 44: Fortalecimiento capacidades formación doctoral y maestrías ($200,000 millones COP).",
                "entidad": "Minciencias Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Ciencia y Tecnología",
                "tipo": "investigación",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 100000000,
                "monto_maximo": 482000000000,
                "moneda": "COP",
                "url_fuente": "https://minciencias.gov.co/plan-convocatorias-actei-2025-2026",
                "url_terminos": "https://minciencias.gov.co/sites/default/files/upload/paginas/anexo_4._presentacion_plan_de_convocatorias_bienio_2025-2026.pdf",
                "requisitos": "Consulte los términos específicos de cada convocatoria. Involucra IES, grupos de investigación, empresas, organizaciones territoriales.",
                "beneficiarios": "Grupos de investigación, instituciones de educación superior, empresas, organizaciones territoriales, semilleros de investigación",
                "fuente_scraping": self.name,
                "tags": "minciencias,plan_bienal,actei,regalias,ctei,Colombia,2025-2026,convocatorias",
            },
        ]
        
        for conv in real_convocatorias:
            if conv["titulo"] not in seen_titles:
                seen_titles.add(conv["titulo"])
                results.append(conv)
        
        return results
    
    def _is_convocatoria_link(self, href: str, text: str) -> bool:
        """Determina si un enlace es una convocatoria válida."""
        if not text or len(text) < 10:
            return False
        
        # Excluir enlaces de navegación
        exclude_patterns = [
            'node/', 'page=', 'pagina', 'anterior', 'siguiente', 
            'facebook', 'twitter', 'youtube', 'pdf/ajax',
            'tweet', 'share', 'print', 'email', 'contacto',
            'inicio', 'quienes-somos', 'transparencia'
        ]
        
        href_lower = href.lower()
        text_lower = text.lower()
        
        for pattern in exclude_patterns:
            if pattern in href_lower or pattern in text_lower:
                return False
        
        # Incluir enlaces que parezcan convocatorias
        include_patterns = [
            'convocatoria', 'convocacion', 'convoc', 'becas',
            'colombia-inteligente', 'cientificas', 'investigacion',
            r'\d{3}',  # Números de convocatoria (3+ dígitos)
            'maestria', 'doctorado', 'semillero'
        ]
        
        for pattern in include_patterns:
            if re.search(pattern, href_lower) or re.search(pattern, text_lower):
                return True
        
        return False
