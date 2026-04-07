from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc, asc, case, literal_column
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.database import get_db
from app.models.convocatoria import Convocatoria, ScrapingLog
from app.models.user import User
from app.schemas.convocatoria import (
    ConvocatoriaResponse,
    ConvocatoriaListResponse,
    ConvocatoriaUpdate,
    ScrapingLogResponse,
)
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/v1", tags=["convocatorias"])


@router.get("/convocatorias", response_model=ConvocatoriaListResponse)
async def list_convocatorias(
    search: Optional[str] = Query(None),
    pais: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    entidad: Optional[str] = Query(None),
    fecha_desde: Optional[str] = Query(None),
    fecha_hasta: Optional[str] = Query(None),
    monto_min: Optional[float] = Query(None),
    monto_max: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Convocatoria).where(Convocatoria.activa == True)

    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(
                Convocatoria.titulo.ilike(pattern),
                Convocatoria.descripcion.ilike(pattern),
                Convocatoria.entidad.ilike(pattern),
                Convocatoria.tags.ilike(pattern),
            )
        )
    if pais:
        query = query.where(Convocatoria.pais == pais)
    if tipo:
        query = query.where(Convocatoria.tipo == tipo)
    if estado:
        ahora = datetime.now()
        if estado == 'abierta':
            # Solo activas con más de 7 días o sin fecha de cierre
            query = query.where(
                or_(
                    Convocatoria.fecha_cierre.is_(None),
                    Convocatoria.fecha_cierre > (ahora + timedelta(days=7))
                )
            )
        elif estado == 'por_vencer':
            # Vence en menos de 7 días (pero no vencida)
            query = query.where(
                Convocatoria.fecha_cierre <= (ahora + timedelta(days=7)),
                Convocatoria.fecha_cierre >= ahora
            )
        elif estado == 'cerrada':
            # Ya pasaron o estado stored es 'cerrada'
            query = query.where(
                or_(
                    Convocatoria.fecha_cierre < ahora,
                    Convocatoria.estado == 'cerrada'
                )
            )
        else:
            query = query.where(Convocatoria.estado == estado)
    else:
        # Por defecto, excluir las cerradas
        query = query.where(Convocatoria.estado != 'cerrada')
    if sector:
        query = query.where(Convocatoria.sector.ilike(f"%{sector}%"))
    if entidad:
        query = query.where(Convocatoria.entidad.ilike(f"%{entidad}%"))
    if fecha_desde:
        try:
            query = query.where(Convocatoria.fecha_cierre >= datetime.fromisoformat(fecha_desde))
        except:
            pass
    if fecha_hasta:
        try:
            query = query.where(Convocatoria.fecha_cierre <= datetime.fromisoformat(fecha_hasta))
        except:
            pass
    if monto_min is not None:
        query = query.where(Convocatoria.monto_maximo >= monto_min)
    if monto_max is not None:
        query = query.where(Convocatoria.monto_minimo <= monto_max)

    # Contar total
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total = result.scalar()

    # Ordenar
    sort_column = getattr(Convocatoria, sort_by, Convocatoria.created_at)
    order = desc(sort_column) if sort_order == "desc" else asc(sort_column)
    query = query.order_by(order)

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    items_raw = result.scalars().all()

    # Convertir con campos calculados
    items = [ConvocatoriaResponse.from_orm_with_calculated_fields(item) for item in items_raw]

    # Calcular resumen de contadores usando SQL (optimizado - sin cargar todos los registros a memoria)
    ahora = datetime.now()
    ahora_aware = datetime.now(timezone.utc)
    
    # Usar CASE de SQL para contar directamente en la base de datos
    # Esto es mucho más eficiente que cargar todos los registros a memoria
    resumen_query = select(
        func.count().label('total'),
        func.sum(
            case(
                (Convocatoria.fecha_cierre.is_(None), 1),  # Sin fecha de cierre = activa
                (Convocatoria.fecha_cierre > (ahora + timedelta(days=7)), 1),  # Más de 7 días = activa
                else_=0
            )
        ).label('activas'),
        func.sum(
            case(
                (Convocatoria.fecha_cierre < ahora, 1),  # Ya vencida
                (Convocatoria.estado == 'cerrada', 1),  # O marcada como cerrada
                else_=0
            )
        ).label('vencidas'),
        func.sum(
            case(
                (
                    Convocatoria.fecha_cierre.isnot(None) & 
                    (Convocatoria.fecha_cierre <= (ahora + timedelta(days=7))) &
                    (Convocatoria.fecha_cierre >= ahora),
                    1  # Por vencer (entre hoy y 7 días)
                ),
                else_=0
            )
        ).label('por_vencer'),
    ).where(Convocatoria.activa == True)
    
    resumen_result = await db.execute(resumen_query)
    resumen_row = resumen_result.one()
    
    resumen = {
        "total": resumen_row.total or 0,
        "activas": int(resumen_row.activas or 0),
        "vencidas": int(resumen_row.vencidas or 0),
        "por_vencer": int(resumen_row.por_vencer or 0),
    }

    return ConvocatoriaListResponse(
        total=total, page=page, page_size=page_size, items=items, resumen=resumen
    )


@router.get("/convocatorias/{convocatoria_id}", response_model=ConvocatoriaResponse)
async def get_convocatoria(convocatoria_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Convocatoria).where(Convocatoria.id == convocatoria_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")
    return ConvocatoriaResponse.from_orm_with_calculated_fields(conv)


@router.patch("/convocatorias/{convocatoria_id}", response_model=ConvocatoriaResponse)
async def update_convocatoria(
    convocatoria_id: int,
    data: ConvocatoriaUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Convocatoria).where(Convocatoria.id == convocatoria_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(conv, key, value)

    await db.commit()
    await db.refresh(conv)
    return conv


@router.delete("/convocatorias/{convocatoria_id}", status_code=204)
async def delete_convocatoria(
    convocatoria_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Requiere autenticación
):
    """Eliminar una convocatoria. Solo usuarios autenticados."""
    result = await db.execute(
        select(Convocatoria).where(Convocatoria.id == convocatoria_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")

    await db.delete(conv)
    await db.commit()
    return None


@router.get("/filters/options")
async def get_filter_options(db: AsyncSession = Depends(get_db)):
    paises = await db.execute(
        select(Convocatoria.pais).distinct().where(Convocatoria.activa == True)
    )
    tipos = await db.execute(
        select(Convocatoria.tipo).distinct().where(Convocatoria.activa == True)
    )
    sectores = await db.execute(
        select(Convocatoria.sector).distinct().where(
            Convocatoria.activa == True, Convocatoria.sector.isnot(None)
        )
    )
    entidades = await db.execute(
        select(Convocatoria.entidad).distinct().where(Convocatoria.activa == True)
    )
    return {
        "paises": sorted([r[0] for r in paises.all()]),
        "tipos": sorted([r[0] for r in tipos.all()]),
        "sectores": sorted([r[0] for r in sectores.all() if r[0]]),
        "entidades": sorted([r[0] for r in entidades.all()]),
    }


@router.get("/scraping/logs", response_model=list[ScrapingLogResponse])
async def get_scraping_logs(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Requiere autenticación
):
    """Obtener logs de scraping. Solo usuarios autenticados pueden acceder."""
    result = await db.execute(
        select(ScrapingLog).order_by(desc(ScrapingLog.ejecutado_en)).limit(limit)
    )
    return result.scalars().all()


@router.post("/admin/cleanup-bad-urls")
async def cleanup_bad_urls(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Requiere autenticación
):
    """Eliminar convocatorias con URLs problemáticas conocidas. Solo usuarios autenticados."""
    deleted_count = 0
    
    # Todas las URLs problemáticas conocidas
    bad_urls = [
        # UNESCO - secciones/noticias sin convocatoria específica
        "https://www.unesco.org/en/articles/global-water-crisis",
        "https://www.unesco.org/en/articles/unesco-designates-medellin",
        "https://www.unesco.org/en/articles/stronger-together",
        "https://www.unesco.org/en/articles/unesco-report-major-blind-spot",
        "https://www.unesco.org/en/articles/international-cities-gastronomy",
        "https://www.unesco.org/en/articles/colombia-ratifies",
        "https://www.unesco.org/en/articles/unesco-mobilizes-support",
        
        # CORDIS - portal general sin oportunidad específica
        "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home",
        "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/horizon-dashboard",
        "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-search",
        
        # EU Funding - páginas de contacto/info institucional
        "https://europa.eu/regions-and-cities/",
        "https://commission.europa.eu/about-european-commission/departments-and-executive-agencies/regional-and-urban-policy_en",
        "https://commission.europa.eu/about-european-commission/contact_en",
        "https://european-union.europa.eu/contact-eu/social-media-channels_en",
        
        # GIZ
        "https://www.giz.de/en/partner/contractor/services-construction-work",
        "https://ausschreibungen.giz.de/",
        "https://ted.europa.eu/de/search/result?FT=GIZ",
        
        # UKRI - página institucional
        "https://www.ukri.org/who-we-are/about-uk-research-and-innovation/",
        
        # Seed - páginas institucionales sin oportunidad
        "https://www.ilo.org/global/about-the-ilo/business-relationships/grants",
        "https://www.gatesfoundation.org/about/how-we-work/grant-opportunities",
    ]
    
    for url in bad_urls:
        result = await db.execute(
            select(Convocatoria).where(Convocatoria.url_fuente.like(f"%{url}%"))
        )
        records = result.scalars().all()
        for record in records:
            await db.delete(record)
            deleted_count += 1
    
    await db.commit()
    
    return {"deleted": deleted_count, "message": f"Se eliminaron {deleted_count} convocatorias con URLs incorrectas"}


# Import para scraping endpoint
from app.scraping.scheduler import run_all_scrapers
from app.services.convocatoria_service import deactivate_expired


@router.post("/admin/cleanup-expired")
async def cleanup_expired_convocatorias(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Requiere autenticación
):
    """
    Actualiza el estado de convocatorias vencidas a 'cerrada'.
    Este endpoint debe ejecutarse periódicamente (recomendado: cada hora o mediante cron).
    Solo usuarios autenticados pueden ejecutar esta acción.
    Retorna el número de convocatorias actualizadas.
    """
    count = await deactivate_expired(db)
    return {"updated": count, "message": f"Se actualizaron {count} convocatorias vencidas"}


@router.post("/scraping/run")
async def trigger_scraping(
    background_tasks: BackgroundTasks,
):
    """
    Endpoint para ejecutar el scraping manualmente o vía cron.
    GitHub Actions usa este endpoint para el scraping diario automatizado.
    """
    background_tasks.add_task(run_all_scrapers)
    return {"status": "started", "message": "Scraping cycle initiated"}

