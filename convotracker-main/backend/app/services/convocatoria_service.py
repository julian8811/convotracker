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
        # NO actualizar estado si ya está cerrada (evita que scraper reabra convocatorias vencidas)
        if existing.estado == "cerrada":
            # Si ya está cerrada, no permitir que se reabra
            data.pop("estado", None)
        
        for key in ["fecha_cierre", "monto_minimo", "monto_maximo", "descripcion"]:
            new_val = data.get(key)
            if new_val and getattr(existing, key) != new_val:
                setattr(existing, key, new_val)
                changed = True
        # Solo actualizar estado si no existe o si el nuevo estado no es "abierta" 
        # (permite cambios de "abierta" a otros estados, pero no de "cerrada" a "abierta")
        new_estado = data.get("estado")
        if new_estado and new_estado != "abierta" and existing.estado != "cerrada":
            if existing.estado != new_estado:
                existing.estado = new_estado
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


async def deactivate_expired(db: AsyncSession) -> int:
    """
    Desactiva convocatorias vencidas (fecha_cierre pasada).
    Retorna el número de convocatorias desactivadas.
    """
    from datetime import datetime, timezone
    
    ahora = datetime.now(timezone.utc)
    # Buscar convocatorias activas cuya fecha_cierre ya pasó
    result = await db.execute(
        select(Convocatoria).where(
            Convocatoria.activa == True,
            Convocatoria.fecha_cierre.isnot(None),
            Convocatoria.estado != "cerrada",  # No reprogramar si ya está cerrada
        )
    )
    expired = result.scalars().all()
    
    count = 0
    for conv in expired:
        # Verificar si realmente está vencida
        fecha = conv.fecha_cierre
        if fecha.tzinfo:
            fecha = fecha.replace(tzinfo=None)
        ahora_naive = ahora.replace(tzinfo=None)
        
        if fecha < ahora_naive:
            conv.estado = "cerrada"
            count += 1
    
    if count > 0:
        await db.commit()
    
    return count
