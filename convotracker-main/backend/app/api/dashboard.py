from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, case
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
    # Optimizado: Usar queries SQL para contar estados directamente
    now = datetime.now()
    now_aware = datetime.now(timezone.utc)
    
    # Query para contar estados usando SQL (mucho más eficiente)
    estado_query = select(
        func.count().label('total'),
        func.sum(
            case(
                (Convocatoria.fecha_cierre.is_(None), 1),
                (Convocatoria.fecha_cierre > (now + timedelta(days=7)), 1),
                else_=0
            )
        ).label('activas'),
        func.sum(
            case(
                (Convocatoria.fecha_cierre < now, 1),
                (Convocatoria.estado == 'cerrada', 1),
                else_=0
            )
        ).label('cerradas'),
        func.sum(
            case(
                (
                    Convocatoria.fecha_cierre.isnot(None) & 
                    (Convocatoria.fecha_cierre <= (now + timedelta(days=7))) &
                    (Convocatoria.fecha_cierre >= now),
                    1
                ),
                else_=0
            )
        ).label('por_vencer'),
    ).where(Convocatoria.activa == True)
    
    estado_result = await db.execute(estado_query)
    estado_row = estado_result.one()
    
    total = estado_row.total or 0
    abiertas = int(estado_row.activas or 0)
    cerradas = int(estado_row.cerradas or 0)
    por_vencer = int(estado_row.por_vencer or 0)
    
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
