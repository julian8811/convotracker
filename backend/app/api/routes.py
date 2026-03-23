from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc, asc
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models.convocatoria import Convocatoria, ScrapingLog
from app.schemas.convocatoria import (
    ConvocatoriaResponse,
    ConvocatoriaListResponse,
    ConvocatoriaUpdate,
    ScrapingLogResponse,
)

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
        query = query.where(Convocatoria.estado == estado)
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

    # Calcular resumen de contadores
    ahora = datetime.now()
    count_activas = 0
    count_vencidas = 0
    count_por_vencer = 0
    
    # Obtener todos para contar (sin paginación para el resumen)
    count_result = await db.execute(select(Convocatoria).where(Convocatoria.activa == True))
    all_items = count_result.scalars().all()
    
    for item in all_items:
        if item.fecha_cierre:
            if item.fecha_cierre.tzinfo:
                fc = item.fecha_cierre.replace(tzinfo=None)
            else:
                fc = item.fecha_cierre
            dias = (fc - ahora).days
            if dias < 0:
                count_vencidas += 1
            elif dias <= 7:
                count_por_vencer += 1
            else:
                count_activas += 1
        else:
            count_activas += 1
    
    resumen = {
        "total": total,
        "activas": count_activas,
        "vencidas": count_vencidas,
        "por_vencer": count_por_vencer,  # Vence en menos de 7 días
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
):
    result = await db.execute(
        select(ScrapingLog).order_by(desc(ScrapingLog.ejecutado_en)).limit(limit)
    )
    return result.scalars().all()


@router.post("/admin/cleanup-bad-urls")
async def cleanup_bad_urls(db: AsyncSession = Depends(get_db)):
    """Eliminar convocatorias con URLs problemáticas conocidas"""
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
