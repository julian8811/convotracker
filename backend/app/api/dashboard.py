from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, update
from collections import defaultdict

from app.database import get_db
from app.models.convocatoria import Convocatoria
from app.schemas.convocatoria import DashboardStats, ConvocatoriaResponse

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


def calcular_estado(fecha_cierre: datetime | None) -> str | None:
    """
    Calcula el estado de una convocatoria basado en fecha_cierre.
    Coincide con la lógica del schema ConvocatoriaResponse.
    """
    if not fecha_cierre:
        return None
    
    ahora = datetime.now(timezone.utc)
    # Remover timezone para comparar
    if fecha_cierre.tzinfo:
        fecha_cierre = fecha_cierre.replace(tzinfo=None)
    ahora = ahora.replace(tzinfo=None)
    
    dias = (fecha_cierre - ahora).days
    
    if dias < 0:
        return "cerrada"
    elif dias <= 7:
        return "por_vencer"
    else:
        return "activa"


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """
    Obtiene estadísticas del dashboard.
    
    Usa lógica basada en fecha_cierre para calcular estados,
    consistente con el schema ConvocatoriaResponse.
    """
    # Primero, contar por estado usando fecha_cierre
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    
    # Query para obtener todas las convocatorias con fecha_cierre
    result = await db.execute(
        select(Convocatoria.fecha_cierre)
        .where(Convocatoria.activa == True)
    )
    fechas = result.scalars().all()
    
    # Calcular estados basados en fecha
    conteo_estados = {"activa": 0, "por_vencer": 0, "cerrada": 0}
    sin_fecha = 0
    
    for fecha in fechas:
        if fecha:
            if fecha.tzinfo:
                fecha = fecha.replace(tzinfo=None)
            dias = (fecha - now).days
            if dias < 0:
                conteo_estados["cerrada"] += 1
            elif dias <= 7:
                conteo_estados["por_vencer"] += 1
            else:
                conteo_estados["activa"] += 1
        else:
            sin_fecha += 1
    
    # Total y abiertas (consideramos activas + por_vencer como "abiertas" para el usuario)
    total = len(fechas) + sin_fecha
    abiertas = conteo_estados["activa"] + conteo_estados["por_vencer"]
    cerradas = conteo_estados["cerrada"]
    por_vencer = conteo_estados["por_vencer"]
    
    # Stats por país
    pais_r = await db.execute(
        select(Convocatoria.pais, func.count())
        .where(Convocatoria.activa == True)
        .group_by(Convocatoria.pais)
    )
    por_pais = {row[0]: row[1] for row in pais_r.all()}

    # Stats por tipo
    tipo_r = await db.execute(
        select(Convocatoria.tipo, func.count())
        .where(Convocatoria.activa == True)
        .group_by(Convocatoria.tipo)
    )
    por_tipo = {row[0]: row[1] for row in tipo_r.all()}

    # Stats por sector
    sector_r = await db.execute(
        select(Convocatoria.sector, func.count())
        .where(Convocatoria.activa == True, Convocatoria.sector.isnot(None))
        .group_by(Convocatoria.sector)
    )
    por_sector = {row[0]: row[1] for row in sector_r.all()}

    # Stats por entidad
    entidad_r = await db.execute(
        select(Convocatoria.entidad, func.count())
        .where(Convocatoria.activa == True)
        .group_by(Convocatoria.entidad)
        .order_by(func.count().desc())
        .limit(15)
    )
    por_entidad = {row[0]: row[1] for row in entidad_r.all()}

    # Stats por mes
    mes_r = await db.execute(
        select(
            extract("year", Convocatoria.created_at),
            extract("month", Convocatoria.created_at),
            func.count(),
        )
        .where(Convocatoria.activa == True)
        .group_by(
            extract("year", Convocatoria.created_at),
            extract("month", Convocatoria.created_at),
        )
        .order_by(
            extract("year", Convocatoria.created_at),
            extract("month", Convocatoria.created_at),
        )
    )
    por_mes = {}
    for row in mes_r.all():
        if row[0] and row[1]:
            key = f"{int(row[0])}-{int(row[1]):02d}"
            por_mes[key] = row[2]

    # Monto promedio
    avg_r = await db.execute(
        select(func.avg(Convocatoria.monto_maximo)).where(
            Convocatoria.activa == True, Convocatoria.monto_maximo.isnot(None)
        )
    )
    monto_promedio = avg_r.scalar()

    # Últimas agregadas
    ultimas_r = await db.execute(
        select(Convocatoria)
        .where(Convocatoria.activa == True)
        .order_by(Convocatoria.created_at.desc())
        .limit(5)
    )
    ultimas = ultimas_r.scalars().all()

    return DashboardStats(
        total_convocatorias=total,
        abiertas=abiertas,
        cerradas=cerradas,
        por_vencer=por_vencer,
        por_pais=por_pais,
        por_tipo=por_tipo,
        por_sector=por_sector,
        por_entidad=por_entidad,
        por_mes=por_mes,
        monto_promedio=round(monto_promedio, 2) if monto_promedio else None,
        ultimas_agregadas=ultimas,
    )
