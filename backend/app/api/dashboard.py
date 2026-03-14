from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from collections import defaultdict

from app.database import get_db
from app.models.convocatoria import Convocatoria
from app.schemas.convocatoria import DashboardStats, ConvocatoriaResponse

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    base = select(Convocatoria).where(Convocatoria.activa == True)

    total_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = total_result.scalar() or 0

    abiertas_r = await db.execute(
        select(func.count()).select_from(
            base.where(Convocatoria.estado == "abierta").subquery()
        )
    )
    abiertas = abiertas_r.scalar() or 0

    cerradas_r = await db.execute(
        select(func.count()).select_from(
            base.where(Convocatoria.estado == "cerrada").subquery()
        )
    )
    cerradas = cerradas_r.scalar() or 0

    proximas_r = await db.execute(
        select(func.count()).select_from(
            base.where(Convocatoria.estado == "próxima").subquery()
        )
    )
    proximas = proximas_r.scalar() or 0

    pais_r = await db.execute(
        select(Convocatoria.pais, func.count())
        .where(Convocatoria.activa == True)
        .group_by(Convocatoria.pais)
    )
    por_pais = {row[0]: row[1] for row in pais_r.all()}

    tipo_r = await db.execute(
        select(Convocatoria.tipo, func.count())
        .where(Convocatoria.activa == True)
        .group_by(Convocatoria.tipo)
    )
    por_tipo = {row[0]: row[1] for row in tipo_r.all()}

    sector_r = await db.execute(
        select(Convocatoria.sector, func.count())
        .where(Convocatoria.activa == True, Convocatoria.sector.isnot(None))
        .group_by(Convocatoria.sector)
    )
    por_sector = {row[0]: row[1] for row in sector_r.all()}

    entidad_r = await db.execute(
        select(Convocatoria.entidad, func.count())
        .where(Convocatoria.activa == True)
        .group_by(Convocatoria.entidad)
        .order_by(func.count().desc())
        .limit(15)
    )
    por_entidad = {row[0]: row[1] for row in entidad_r.all()}

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

    avg_r = await db.execute(
        select(func.avg(Convocatoria.monto_maximo)).where(
            Convocatoria.activa == True, Convocatoria.monto_maximo.isnot(None)
        )
    )
    monto_promedio = avg_r.scalar()

    ultimas_r = await db.execute(
        base.order_by(Convocatoria.created_at.desc()).limit(5)
    )
    ultimas = ultimas_r.scalars().all()

    return DashboardStats(
        total_convocatorias=total,
        abiertas=abiertas,
        cerradas=cerradas,
        proximas=proximas,
        por_pais=por_pais,
        por_tipo=por_tipo,
        por_sector=por_sector,
        por_entidad=por_entidad,
        por_mes=por_mes,
        monto_promedio=round(monto_promedio, 2) if monto_promedio else None,
        ultimas_agregadas=ultimas,
    )
