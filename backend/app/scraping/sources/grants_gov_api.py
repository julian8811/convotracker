"""
Fuente de datos desde la API pública de Grants.gov (EE.UU.).
No requiere API key. Documentación: https://www.grants.gov/api/api-guide
"""
import logging
import time
from datetime import datetime

import httpx

logger = logging.getLogger(__name__)

SEARCH2_URL = "https://api.grants.gov/v1/api/search2"
FETCH_OPP_URL = "https://api.grants.gov/v1/api/fetchopportunity"


class GrantsGovAPIFetcher:
    """Obtiene convocatorias desde la API pública de Grants.gov."""
    name = "Grants.gov (API EE.UU.)"
    base_url = "https://www.grants.gov"
    country = "Estados Unidos"

    def _map_opportunity_to_convocatoria(self, opp: dict) -> dict | None:
        """Convierte un resultado de la API al formato interno de convocatoria."""
        try:
            opp_id = opp.get("opportunityId") or opp.get("opportunityNumber") or ""
            title = (opp.get("title") or opp.get("opportunityTitle") or "Sin título").strip()
            if not title or len(title) < 3:
                return None
            agency = (opp.get("agency") or opp.get("agencyName") or "Agency").strip()
            if isinstance(agency, dict):
                agency = agency.get("name", agency.get("agencyName", "Agency"))
            desc = opp.get("description") or opp.get("synopsis") or ""
            if isinstance(desc, str) and len(desc) > 2000:
                desc = desc[:2000] + "..."
            post_date = opp.get("postDate") or opp.get("postedDate")
            close_date = opp.get("closeDate") or opp.get("closeDate")
            for key in ("closeDate", "postDate", "postedDate", "lastUpdatedDate"):
                if key in opp and not close_date and "close" in key.lower():
                    close_date = opp[key]
                if key in opp and not post_date and "post" in key.lower():
                    post_date = opp[key]
            fecha_publicacion = self._parse_date(post_date)
            fecha_cierre = self._parse_date(close_date)
            url_fuente = f"https://www.grants.gov/search-results-detail/{opp_id}" if opp_id else "https://www.grants.gov"
            status = (opp.get("status") or opp.get("opportunityStatus") or "").lower()
            estado = "abierta" if status in ("posted", "open", "forecasted") else "cerrada" if status == "closed" else "próxima"
            return {
                "titulo": title[:500],
                "descripcion": (desc or title)[:5000],
                "entidad": agency[:300],
                "pais": "Estados Unidos",
                "region": "América del Norte",
                "sector": "Investigación e Innovación",
                "tipo": "investigación",
                "estado": estado,
                "fecha_publicacion": fecha_publicacion,
                "fecha_cierre": fecha_cierre,
                "monto_minimo": None,
                "monto_maximo": None,
                "moneda": "USD",
                "url_fuente": url_fuente,
                "url_terminos": None,
                "requisitos": None,
                "beneficiarios": None,
                "tags": "grants.gov,EE.UU.,financiamiento,investigación",
                "fuente_scraping": self.name,
            }
        except Exception as e:
            logger.warning(f"[{self.name}] Error mapeando oportunidad: {e}")
            return None

    def _parse_date(self, value) -> datetime | None:
        if not value:
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, (int, float)):
            try:
                return datetime.fromtimestamp(value / 1000 if value > 1e12 else value)
            except (OSError, ValueError):
                return None
        s = str(value).strip()[:30]
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
            try:
                return datetime.strptime(s.split(".")[0].split("+")[0], fmt)
            except ValueError:
                continue
        return None

    async def run(self) -> dict:
        """Ejecuta la búsqueda en la API y devuelve el mismo formato que un scraper."""
        start = time.time()
        logger.info(f"[{self.name}] Starting API fetch...")
        results = []
        try:
            async with httpx.AsyncClient(timeout=45) as client:
                # Búsquedas por palabras clave para obtener variedad
                for keyword in ("research", "innovation", "education", "health", "technology"):
                    try:
                        body = {"keyword": keyword, "rows": 25}
                        resp = await client.post(SEARCH2_URL, json=body)
                        resp.raise_for_status()
                        data = resp.json()
                        # La API puede devolver { "hitCount": N, "opportunities": [...] } o estructura similar
                        items = data.get("opportunities") or data.get("results") or data.get("data") or []
                        if isinstance(data.get("opportunitiesList"), list):
                            items = data["opportunitiesList"]
                        if not items and isinstance(data, list):
                            items = data
                        for opp in items:
                            if isinstance(opp, dict):
                                conv = self._map_opportunity_to_convocatoria(opp)
                                if conv and not any(r.get("titulo") == conv["titulo"] and r.get("url_fuente") == conv["url_fuente"] for r in results):
                                    results.append(conv)
                    except (httpx.HTTPError, Exception) as e:
                        logger.warning(f"[{self.name}] Error en búsqueda '{keyword}': {e}")
                        continue
        except Exception as e:
            logger.error(f"[{self.name}] Error en API: {e}")
            duration = time.time() - start
            return {
                "fuente": self.name,
                "estado": "error",
                "registros_encontrados": 0,
                "duracion_segundos": round(duration, 2),
                "error_mensaje": str(e),
                "results": [],
            }
        duration = time.time() - start
        logger.info(f"[{self.name}] Found {len(results)} opportunities in {duration:.1f}s")
        return {
            "fuente": self.name,
            "estado": "exitoso",
            "registros_encontrados": len(results),
            "duracion_segundos": round(duration, 2),
            "results": results,
        }
