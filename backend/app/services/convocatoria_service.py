from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.convocatoria import Convocatoria
from app.schemas.convocatoria import ConvocatoriaCreate
from app.utils.helpers import generate_hash


async def upsert_convocatoria(db: AsyncSession, data: dict) -> tuple[Convocatoria, bool]:
    content_for_hash = f"{data.get('titulo', '')}{data.get('url_fuente', '')}{data.get('entidad', '')}"
    hash_val = generate_hash(content_for_hash)

    result = await db.execute(
        select(Convocatoria).where(Convocatoria.hash_contenido == hash_val)
    )
    existing = result.scalar_one_or_none()

    if existing:
        changed = False
        for key in ["estado", "fecha_cierre", "monto_minimo", "monto_maximo", "descripcion"]:
            new_val = data.get(key)
            if new_val and getattr(existing, key) != new_val:
                setattr(existing, key, new_val)
                changed = True
        if changed:
            await db.commit()
            await db.refresh(existing)
        return existing, False

    data["hash_contenido"] = hash_val
    conv = Convocatoria(**data)
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv, True


async def deactivate_expired(db: AsyncSession):
    from datetime import datetime
    result = await db.execute(
        select(Convocatoria).where(
            Convocatoria.activa == True,
            Convocatoria.fecha_cierre.isnot(None),
            Convocatoria.fecha_cierre < datetime.utcnow(),
        )
    )
    expired = result.scalars().all()
    for conv in expired:
        conv.estado = "cerrada"
    if expired:
        await db.commit()
    return len(expired)
