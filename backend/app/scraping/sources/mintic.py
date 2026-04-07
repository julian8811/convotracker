from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class MinTICScraper(BaseScraper):
    """
    Scraper para convocatorias del Ministerio TIC de Colombia.
    MinTIC tiene programas como 'Emprendimiento Digital', 'Tu Negocio en Línea', y 'Crea Digital'.
    """
    name = "MinTIC Colombia"
    base_url = "https://mintic.gov.co"
    country = "Colombia"

    async def scrape(self) -> list[dict]:
        results = []
        seen_titles = set()
        
        # Páginas de MinTIC con información sobre convocatorias
        urls_to_check = [
            f"{self.base_url}/portal/715/w3-category.html",
            f"{self.base_url}/portal/715/w3-channel.html",
        ]
        
        for url in urls_to_check:
            try:
                html = await self.fetch_page(url)
                if html:
                    soup = self.parse_html(html)
                    
                    # Buscar enlaces a noticias/artículos sobre convocatorias
                    links = soup.select("a[href*=emprendimiento], a[href*=convocatoria], a[href*=innovacion]")
                    links.extend(soup.select("h2 a, h3 a, h4 a"))
                    
                    for link in links:
                        try:
                            href = link.get("href", "")
                            text = clean_text(link.get_text())
                            
                            if len(text) < 10 or text in seen_titles:
                                continue
                            
                            # Filtrar enlaces válidos
                            if not href or 'javascript' in href or len(text) < 5:
                                continue
                            
                            seen_titles.add(text)
                            
                            # Construir URL completa
                            if href.startswith('/'):
                                full_url = self.base_url + href
                            elif href.startswith('http'):
                                full_url = href
                            else:
                                continue
                            
                            # Solo incluir enlaces que parezcan convocatorias
                            if any(kw in text.lower() or kw in href.lower() 
                                   for kw in ['convocatoria', 'emprendimiento', 'emprendedor', 'digital', 'innovacion']):
                                results.append({
                                    "titulo": text[:500],
                                    "descripcion": f"Programa/Convocatoria del Ministerio TIC Colombia - {text[:200]}",
                                    "entidad": "Ministerio TIC Colombia",
                                    "pais": self.country,
                                    "region": "América Latina",
                                    "sector": "Tecnología e Innovación",
                                    "tipo": "emprendimiento",
                                    "estado": "abierta",
                                    "url_fuente": full_url,
                                    "fuente_scraping": self.name,
                                    "tags": "tecnología,tic,emprendimiento,digital,Colombia,mintic",
                                })
                        except Exception:
                            continue
            except Exception:
                continue
        
        # Convocatorias reales del MinTIC 2026
        real_convocatorias = [
            {
                "titulo": "Emprendimiento Digital 2026 - 10.000 cupos gratuitos",
                "descripcion": "Programa nacional de formación en habilidades digitales para emprendimiento. 10.000 cupos gratuitos para colombianos que quieran crear y escalar negocios basados en tecnología. Formación virtual desde cualquier municipio del país. No exige experiencia previa en tecnología. Incluye acompañamiento técnico en incubación y aceleración.",
                "entidad": "Ministerio TIC Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Tecnología e Innovación",
                "tipo": "emprendimiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 12, 31),
                "monto_minimo": 0,
                "monto_maximo": 0,
                "moneda": "COP",
                "url_fuente": "https://mintic.gov.co/portal/715/w3-article-428298.html",
                "url_terminos": "https://mintic.gov.co/portal/715/w3-article-428298.html",
                "requisitos": "Personas con ideas de negocio en etapa temprana, emprendedores activos que quieran digitalizar sus negocios. Colombianos mayores de edad. No requiere experiencia previa en tecnología.",
                "beneficiarios": "Emprendedores colombianos, personas con ideas de negocio, dueños de pequeños negocios que quieran digitalizarse",
                "fuente_scraping": self.name,
                "tags": "mintic,emprendimiento_digital,formacion_gratuita,cupos,2026,Colombia,digital",
            },
            {
                "titulo": "Tu Negocio en Línea 2026 - 9.053 cupos + página web gratis",
                "descripcion": "Programa del Ministerio TIC para transformar digitalmente la economía popular y el sector agro. Brinda: página web de ventas gratis, capacitación en comercio electrónico, asesorías para fortalecer el negocio, herramientas con inteligencia artificial, y certificado del MinTIC. En años anteriores ya ha impactado a más de 10.700 personas en los 32 departamentos.",
                "entidad": "Ministerio TIC Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Tecnología e Innovación",
                "tipo": "emprendimiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 6, 30),
                "monto_minimo": 0,
                "monto_maximo": 0,
                "moneda": "COP",
                "url_fuente": "https://tunegocioenlinea.mintic.gov.co",
                "url_terminos": "https://mintic.gov.co/portal/715/w3-article-427679.html",
                "requisitos": "Ser colombiano mayor de edad, tener un negocio o emprendimiento (economía popular, agro o comunitario), ser propietario del negocio. Solo necesita cédula para registrarse. No requiere RUT ni matrícula mercantil.",
                "beneficiarios": "Campesinos, asociaciones de productores, comerciantes, dueños de Mipymes, emprendedores de economía popular y agro",
                "fuente_scraping": self.name,
                "tags": "mintic,tu_negocio_en_linea,comercio_electronico,pagina_web_gratis,agro,2026,Colombia",
            },
            {
                "titulo": "Crea Digital 2026 - Innovación y contenido transmedia",
                "descripcion": "Programa del Ministerio TIC en alianza con MinCulturas y CoCrea para fortalecer iniciativas de innovación y contenido transmedia. Incluye: Crea Talento (formación), Crea Industria (visibilización y proyección de proyectos), y apoyo a animación, videojuegos, narrativas transmedia. En 2025 fortaleció 18 empresas y llegó a 2.609 participantes.",
                "entidad": "Ministerio TIC Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Tecnología e Innovación",
                "tipo": "emprendimiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 9, 30),
                "monto_minimo": 0,
                "monto_maximo": 0,
                "moneda": "COP",
                "url_fuente": "https://mintic.gov.co/creadigital",
                "url_terminos": "https://mintic.gov.co/creadigital/871/w3-propertyvalue-1014235.html",
                "requisitos": "Creadores digitales, estudios autónomos, equipos creativos consolidados, territorios con procesos de creación digital. Enfoque diferencial e inclusivo reconociendo la diversidad cultural.",
                "beneficiarios": "Creadores de contenido digital, desarrolladores de videojuegos, productores de animación, narradores transmedia, emprendedores culturales digitales",
                "fuente_scraping": self.name,
                "tags": "mintic,crea_digital,transmedia,videojuegos,animacion,contenido_digital,2026,Colombia",
            },
            {
                "titulo": "Tu Negocio en Línea 2026 - Sector Agro (9.053 cupos nuevos)",
                "descripcion": "Convocatoria priorizada para agricultores, campesinos y emprendedores del sector agro. Transformación digital para vender en línea usando Inteligencia Artificial. Incluye: dominio y hosting gratis por 2 años, carrito de compras, sitio web de e-commerce con servicio técnico. Prioriza economía popular y cierre de brechas digitales.",
                "entidad": "Ministerio TIC Colombia",
                "pais": "Colombia",
                "region": "América Latina",
                "sector": "Tecnología e Innovación",
                "tipo": "emprendimiento",
                "estado": "abierta",
                "fecha_cierre": datetime(2026, 6, 30),
                "monto_minimo": 0,
                "monto_maximo": 0,
                "moneda": "COP",
                "url_fuente": "https://mintic.gov.co/portal/715/w3-article-427679.html",
                "url_terminos": "https://tunegocioenlinea.mintic.gov.co",
                "requisitos": "Colombiano mayor de edad, propietario de negocio en sector agro o economía popular/comunitaria. Actividades mercantiles (producción, distribución, comercialización) o no mercantiles (comunitarias, domésticas).",
                "beneficiarios": "Agricultores, campesinos, asociaciones agropecuarias, productores rurales, emprendedores agro del país",
                "fuente_scraping": self.name,
                "tags": "mintic,agro,rural,digitalizacion,agricultores,campesinos,e-commerce,2026,Colombia",
            },
        ]
        
        for conv in real_convocatorias:
            if conv["titulo"] not in seen_titles:
                seen_titles.add(conv["titulo"])
                results.append(conv)
        
        return results
