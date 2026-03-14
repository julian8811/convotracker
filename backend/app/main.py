import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, desc, func

from app.config import settings
from app.database import init_db, get_db, async_session
from app.api.routes import router as api_router
from app.api.dashboard import router as dashboard_router
from app.scraping.scheduler import run_all_scrapers, run_single_scraper, SCRAPERS
from app.services.pdf_service import generate_convocatoria_pdf, generate_report_pdf
from app.models.convocatoria import Convocatoria

logging.basicConfig(level=settings.LOG_LEVEL, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info(f"{settings.APP_NAME} v{settings.APP_VERSION} started")

    # Si la BD está vacía (p. ej. primer despliegue en Render), cargar datos de ejemplo
    async with async_session() as db:
        r = await db.execute(select(func.count()).select_from(Convocatoria))
        if (r.scalar() or 0) == 0:
            try:
                from seed_data import seed
                await seed()
                logger.info("Seed de convocatorias ejecutado (BD vacía)")
            except Exception as e:
                logger.warning("Seed no ejecutado: %s", e)

    if settings.SCRAPING_ENABLED:
        scheduler.add_job(
            run_all_scrapers,
            "interval",
            hours=settings.SCRAPING_INTERVAL_HOURS,
            id="daily_scraping",
            name="Daily Scraping",
            replace_existing=True,
        )
        scheduler.start()
        logger.info(f"Scheduler started: scraping every {settings.SCRAPING_INTERVAL_HOURS}h")

    yield

    if scheduler.running:
        scheduler.shutdown()
    logger.info("Application shutdown")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Plataforma de vigilancia tecnológica y rastreo de convocatorias",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=settings.CORS_HEADERS,
    expose_headers=["Content-Disposition"],
)

app.include_router(api_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "running",
    }


@app.post("/api/v1/scraping/run")
async def trigger_scraping():
    result = await run_all_scrapers()
    return {"message": "Scraping completado", "result": result}


@app.post("/api/v1/scraping/run/{scraper_name}")
async def trigger_single_scraper(scraper_name: str):
    try:
        result = await run_single_scraper(scraper_name)
        return {"message": f"Scraping de {scraper_name} completado", "result": result}
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/v1/scraping/sources")
async def list_sources():
    return [
        {"name": getattr(s, "name", "Fuente"), "url": getattr(s, "base_url", ""), "country": getattr(s, "country", "")}
        for s in SCRAPERS
    ]


@app.get("/api/v1/reports/convocatoria/{convocatoria_id}")
async def download_convocatoria_pdf(convocatoria_id: int):
    async with async_session() as db:
        result = await db.execute(
            select(Convocatoria).where(Convocatoria.id == convocatoria_id)
        )
        conv = result.scalar_one_or_none()
        if not conv:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not found")

    buffer = generate_convocatoria_pdf(conv)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=convocatoria_{convocatoria_id}.pdf"},
    )


@app.get("/api/v1/reports/all")
async def download_all_pdf():
    async with async_session() as db:
        result = await db.execute(
            select(Convocatoria)
            .where(Convocatoria.activa == True)
            .order_by(desc(Convocatoria.created_at))
            .limit(100)
        )
        convocatorias = result.scalars().all()

    buffer = generate_report_pdf(convocatorias)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=reporte_convocatorias.pdf"},
    )


@app.get("/health")
async def health():
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.get("/api/v1/health")
async def api_health():
    """Comprueba que la API responde (útil para el frontend)."""
    return {"status": "ok", "version": settings.APP_VERSION}
