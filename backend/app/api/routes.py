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
        query = query.where(Convocatoria.fecha_cierre >= datetime.fromisoformat(fecha_desde))
    if fecha_hasta:
        query = query.where(Convocatoria.fecha_cierre <= datetime.fromisoformat(fecha_hasta))
    if monto_min is not None:
        query = query.where(Convocatoria.monto_maximo >= monto_min)
    if monto_max is not None:
        query = query.where(Convocatoria.monto_minimo <= monto_max)

    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total = result.scalar()

    sort_column = getattr(Convocatoria, sort_by, Convocatoria.created_at)
    order = desc(sort_column) if sort_order == "desc" else asc(sort_column)
    query = query.order_by(order)

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    items = result.scalars().all()

    return ConvocatoriaListResponse(
        total=total, page=page, page_size=page_size, items=items
    )


@router.get("/convocatorias/{convocatoria_id}", response_model=ConvocatoriaResponse)
async def get_convocatoria(convocatoria_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Convocatoria).where(Convocatoria.id == convocatoria_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")
    return conv


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
