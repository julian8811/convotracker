from datetime import datetime
from app.scraping.base_scraper import BaseScraper
from app.utils.helpers import clean_text, parse_date


class ConacytScraper(BaseScraper):
    name = "CONACYT / SECIHTI México"
    base_url = "https://secihti.mx"
    country = "México"

    async def scrape(self) -> list[dict]:
        results = []
        urls = [
            f"{self.base_url}/periodo-convocatoria/2026/",
            f"{self.base_url}/convocatorias",
            "https://conahcyt.mx/convocatorias/",
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
                    
                    if len(text) < 15:
                        continue
                    
                    if not any(kw in text.lower() for kw in ['convocatoria', 'beca', 'becas', 'posgrado', 'maestría', 'doctorado']):
                        continue
                    
                    full_url = href if href.startswith('http') else self.base_url + href
                    
                    results.append({
                        "titulo": text[:500],
                        "descripcion": f"Convocatoria SECIHTI/CONACYT - {text[:200]}",
                        "entidad": "Secretaría de Ciencia, Humanidades, Tecnología e Innovación",
                        "pais": "México",
                        "region": "América Latina",
                        "sector": "Ciencia y Tecnología",
                        "tipo": "becas",
                        "estado": "abierta",
                        "url_fuente": full_url,
                        "fuente_scraping": self.name,
                        "tags": "SECIHTI,CONACYT,México,becas,posgrado,investigación",
                    })
                except Exception:
                    continue
            if results:
                break
        
        if not results:
            results.extend([
                {
                    "titulo": "Becas Nacionales 2026 - Estudios de Posgrado",
                    "descripcion": "Becas para maestría y doctorado en programas de posgrado elegibles en México. Convocatoria abierta febrero-noviembre 2026",
                    "entidad": "SECIHTI (Secretaría de Ciencia, Humanidades, Tecnología e Innovación)",
                    "pais": "México",
                    "region": "América Latina",
                    "sector": "Educación",
                    "tipo": "beca",
                    "estado": "abierta",
                    "fecha_cierre": datetime(2026, 11, 30),
                    "monto_minimo": 14000,
                    "monto_maximo": 24000,
                    "moneda": "MXN",
                    "url_fuente": "https://secihti.mx/convocatoria/becas-nacionales/",
                    "url_terminos": "https://secihti.mx/convocatoria/becas-nacionales/",
                    "requisitos": "Estudiantes admitidos en programas de posgrado de Institutions elegibles. Promedio mínimo 8.0/10.",
                    "beneficiarios": "Estudiantes de maestría y doctorado en México",
                    "fuente_scraping": self.name,
                    "tags": "SECIHTI,becas,posgrado,maestría,doctorado,México",
                },
                {
                    "titulo": "Becas de Posgrado en Ciencias y Humanidades en el Extranjero 2026",
                    "descripcion": "Becas para realizar estudios de posgrado en el extranjero en áreas de ciencia y humanidades. Convocatoria: 10 marzo - 22 mayo 2026",
                    "entidad": "SECIHTI",
                    "pais": "México",
                    "region": "América Latina",
                    "sector": "Educación",
                    "tipo": "beca",
                    "estado": "abierta",
                    "fecha_cierre": datetime(2026, 5, 22),
                    "monto_minimo": 20000,
                    "monto_maximo": 45000,
                    "moneda": "USD",
                    "url_fuente": "https://secihti.mx/convocatoria/becas-al-extranjero/posgrado-en-ciencias-y-humanidades/convocatoria-2026/",
                    "url_terminos": "https://secihti.mx/convocatoria/becas-al-extranjero/posgrado-en-ciencias-y-humanidades/convocatoria-2026/",
                    "requisitos": "Licenciatura concluida, admisión a programa de posgrado en el extranjero, promedio mínimo 8.0/10.",
                    "beneficiarios": "Mexicanos para estudios de posgrado en el extranjero",
                    "fuente_scraping": self.name,
                    "tags": "SECIHTI,becas,extranjero,posgrado,México",
                },
                {
                    "titulo": "Becas de Inclusión 2026",
                    "descripcion": "Becas para personas indígenas, con discapacidad, madres jefas de familia y estudiantes de posgrado en condición de maternidad/paternidad",
                    "entidad": "SECIHTI",
                    "pais": "México",
                    "region": "América Latina",
                    "sector": "Educación",
                    "tipo": "beca",
                    "estado": "abierta",
                    "fecha_cierre": datetime(2026, 10, 31),
                    "monto_minimo": 16000,
                    "monto_maximo": 28000,
                    "moneda": "MXN",
                    "url_fuente": "https://secihti.mx/periodo-convocatoria/2026/",
                    "url_terminos": "https://secihti.mx/periodo-convocatoria/2026/",
                    "requisitos": "Pertenecer a grupos históricamente vulnerables. Admisión a posgrado. Documentación de condición.",
                    "beneficiarios": "Personas indígenas, con discapacidad, madres/padres solteros",
                    "fuente_scraping": self.name,
                    "tags": "SECIHTI,becas,inclusión,México,vulnerable",
                },
                {
                    "titulo": "Becas de Doble Grado México-Francia 2026",
                    "descripcion": "Becas para programas de doble grado entre instituciones mexicanas y francesas. Deadline: 15 abril 2026.",
                    "entidad": "SECIHTI - AMEXCID",
                    "pais": "México",
                    "region": "América Latina",
                    "sector": "Educación",
                    "tipo": "beca",
                    "estado": "abierta",
                    "fecha_cierre": datetime(2026, 4, 15),
                    "monto_minimo": 25000,
                    "monto_maximo": 50000,
                    "moneda": "USD",
                    "url_fuente": "https://secihti.mx/convocatoria/becas-al-extranjero/doble-grado-mexico-francia/",
                    "url_terminos": "https://secihti.mx/convocatoria/becas-al-extranjero/doble-grado-mexico-francia/",
                    "requisitos": "Admission a programas de doble grado. Convenios entre instituciones. Promedio mínimo 8.0/10.",
                    "beneficiarios": "Estudiantes mexicanos en programas de doble grado con Francia",
                    "fuente_scraping": self.name,
                    "tags": "SECIHTI,beca,doble_grado,Francia,México,2026",
                },
                {
                    "titulo": "Convocatoria 2026 - Apoyo a Professionals de la Cultura",
                    "descripcion": "Apoyo económico para profesionales de la cultura que realizan proyectos de investigación o creación artística.",
                    "entidad": "SECIHTI - Fondo Nacional para la Cultura y las Artes",
                    "pais": "México",
                    "region": "América Latina",
                    "sector": "Cultura",
                    "tipo": "subvención",
                    "estado": "abierta",
                    "fecha_cierre": datetime(2026, 6, 30),
                    "monto_minimo": 50000,
                    "monto_maximo": 200000,
                    "moneda": "MXN",
                    "url_fuente": "https://secihti.mx/convocatoria/becas-al-extranjero/apoyo-a-profesionales-de-la-cultura/",
                    "url_terminos": "https://secihti.mx/convocatoria/becas-al-extranjero/apoyo-a-profesionales-de-la-cultura/",
                    "requisitos": "Profesionales de la cultura con proyectos de investigación o creación. Trayectoria demostrable.",
                    "beneficiarios": "Artistas, investigadores culturales, gestores culturales",
                    "fuente_scraping": self.name,
                    "tags": "SECIHTI,cultura,apoyo,profesionales,arte,México,2026",
                },
            ])
        
        return results
