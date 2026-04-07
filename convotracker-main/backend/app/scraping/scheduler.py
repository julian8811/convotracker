import logging
import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models.convocatoria import ScrapingLog
from app.services.convocatoria_service import upsert_convocatoria, deactivate_expired
from app.scraping.sources.minciencias import MincienciasScraper
from app.scraping.sources.innpulsa import InnpulsaScraper
from app.scraping.sources.eu_funding import EUFundingScraper
from app.scraping.sources.worldbank import WorldBankScraper
from app.scraping.sources.sena import SenaScraper
from app.scraping.sources.undp import UNDPScraper
from app.scraping.sources.bid import BIDScraper
from app.scraping.sources.conacyt import ConacytScraper
from app.scraping.sources.ukri import UKRIScraper
from app.scraping.sources.unesco import UNESCOScraper
from app.scraping.sources.caf import CAFScraper
from app.scraping.sources.giz import GIZScraper
from app.scraping.sources.cordis import CORDISScraper
# DESHABILITADO: GrantsGovAPIFetcher genera datos falsos (busca cualquier enlace con "grant")
# from app.scraping.sources.grants_gov_api import GrantsGovAPIFetcher
from app.scraping.sources.mintic import MinTICScraper
from app.scraping.sources.bancoldex import BancoldexScraper

logger = logging.getLogger(__name__)

SCRAPERS = [
    # Colombia/Latam prioritarios (hacen scraping real)
    MincienciasScraper(),
    SenaScraper(),
    MinTICScraper(),
    BancoldexScraper(),
    # Internacional - Datos verificados manualmente (no hacen scraping real)
    # Estos devuelven listas curadas de convocatorias conocidas
    EUFundingScraper(),
    CORDISScraper(),
    WorldBankScraper(),
    UNDPScraper(),
    BIDScraper(),
    CAFScraper(),
    ConacytScraper(),
    UKRIScraper(),
    UNESCOScraper(),
    GIZScraper(),
    # DESHABILITADO: GrantsGovAPIFetcher() - genera datos falsos
]

# Timeout por scraper (en segundos)
SCRAPER_TIMEOUT = 60


async def run_all_scrapers():
    logger.info("=== Starting daily scraping cycle ===")
    total_new = 0
    total_updated = 0

    for scraper in SCRAPERS:
        try:
            # Agregar timeout para evitar que un scraper se cuelgue infinitamente
            report = await asyncio.wait_for(scraper.run(), timeout=SCRAPER_TIMEOUT)
        except asyncio.TimeoutError:
            logger.error(f"Timeout ({SCRAPER_TIMEOUT}s) en {scraper.name}")
            report = {
                "fuente": scraper.name,
                "estado": "error",
                "results": [],
                "registros_encontrados": 0,
                "error_mensaje": f"Timeout después de {SCRAPER_TIMEOUT}s",
                "duracion_segundos": SCRAPER_TIMEOUT,
            }
        except Exception as e:
            logger.error(f"Error en {scraper.name}: {e}")
            report = {
                "fuente": scraper.name,
                "estado": "error",
                "results": [],
                "registros_encontrados": 0,
                "error_mensaje": str(e),
                "duracion_segundos": 0,
            }

        async with async_session() as db:
            new_count = 0
            updated_count = 0

            for item in report.get("results", []):
                try:
                    conv, is_new = await upsert_convocatoria(db, item)
                    if conv is None:
                        # La convocatoria no pasó la validación, se ignora
                        continue
                    if is_new:
                        new_count += 1
                    else:
                        updated_count += 1
                except Exception as e:
                    logger.error(f"Error upserting from {scraper.name}: {e}")

            log = ScrapingLog(
                fuente=report["fuente"],
                estado=report["estado"],
                registros_encontrados=report["registros_encontrados"],
                registros_nuevos=new_count,
                registros_actualizados=updated_count,
                error_mensaje=report.get("error_mensaje"),
                duracion_segundos=report.get("duracion_segundos"),
            )
            db.add(log)
            await db.commit()

            total_new += new_count
            total_updated += updated_count

    async with async_session() as db:
        expired = await deactivate_expired(db)
        logger.info(f"Deactivated {expired} expired convocatorias")

    logger.info(
        f"=== Scraping cycle complete: {total_new} new, {total_updated} updated ==="
    )
    return {"new": total_new, "updated": total_updated}


async def run_single_scraper(scraper_name: str):
    scraper = next((s for s in SCRAPERS if s.name == scraper_name), None)
    if not scraper:
        raise ValueError(f"Scraper '{scraper_name}' not found")
    report = await scraper.run()

    async with async_session() as db:
        new_count = 0
        for item in report.get("results", []):
            try:
                conv, is_new = await upsert_convocatoria(db, item)
                if conv is None:
                    continue
                if is_new:
                    new_count += 1
            except Exception as e:
                logger.error(f"Error: {e}")

        log = ScrapingLog(
            fuente=report["fuente"],
            estado=report["estado"],
            registros_encontrados=report["registros_encontrados"],
            registros_nuevos=new_count,
            registros_actualizados=0,
            error_mensaje=report.get("error_mensaje"),
            duracion_segundos=report.get("duracion_segundos"),
        )
        db.add(log)
        await db.commit()

    return report
