from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.convocatoria import Convocatoria
from app.schemas.convocatoria import ConvocatoriaCreate
from app.utils.helpers import generate_hash
import logging

logger = logging.getLogger(__name__)

# Fuentes conocidas y válidas ( whitelist )
VALID_SOURCES = {
    "Minciencias Colombia": "minciencias.gov.co",
    "iNNpulsa Colombia": "innpulsa",
    "SENA": "sena.gov.co",
    "MinTIC Colombia": "mintic.gov.co",
    "Bancoldex": "bancoldex.com",
    "BID / IDB": "bidlab.org",
    "Banco Mundial": "worldbank.org",
    "UNESCO": "unesco.org",
    "UNDP": "undp.org",
    "CAF": "caf.com",
    "GIZ": "giz.de",
    "UKRI": "ukri.org",
    "CONACYT México": "conacyt.mx",
    "EU Funding": "europa.eu",
    "CORDIS": "cordis.europa.eu",
}


def is_valid_convocatoria(data: dict) -> bool:
    """
    Valida que una convocatoria tenga los datos mínimos requeridos.
    Returns True si es válida, False si debe ignorarse.
    """
    titulo = data.get("titulo", "").strip()
    descripcion = data.get("descripcion", "").strip()
    entidad = data.get("entidad", "").strip()
    url_fuente = data.get("url_fuente", "").strip()
    
    # Validar título mínimo
    if not titulo or len(titulo) < 10:
        logger.warning(f"Convocatoria rechazada: título muy corto '{titulo}'")
        return False
    
    # Validar descripción mínima
    if not descripcion or len(descripcion) < 20:
        logger.warning(f"Convocatoria rechazada: descripción muy corta para '{titulo}'")
        return False
    
    # Validar que tenga entidad
    if not entidad:
        logger.warning(f"Convocatoria rechazada: sin entidad para '{titulo}'")
        return False
    
    # Validar URL si existe
    if url_fuente:
        # Verificar que la URL sea válida y no sea genérica
        if not url_fuente.startswith("http"):
            logger.warning(f"Convocatoria rechazada: URL inválida '{url_fuente}'")
            return False
        
        # URLs muy genéricas que no son convocatorias específicas
        generic_patterns = [
            "facebook.com/sharer",
            "twitter.com/intent",
            "linkedin.com/share",
            "mailto:",
            "tel:",
        ]
        for pattern in generic_patterns:
            if pattern in url_fuente.lower():
                logger.warning(f"Convocatoria rechazada: URL genérica '{url_fuente}'")
                return False
    
    # Verificar que no sea "placeholder" o genérico
    generic_titles = [
        "click here",
        "read more",
        "learn more",
        "ver más",
        "más información",
        "saber más",
    ]
    if titulo.lower() in generic_titles:
        logger.warning(f"Convocatoria rechazada: título genérico '{titulo}'")
        return False
    
    return True


async def upsert_convocatoria(db: AsyncSession, data: dict) -> tuple[Convocatoria, bool]:
    # Primero validar que los datos sean suficientes
    if not is_valid_convocatoria(data):
        logger.info(f"Convocatoria ignorada por validación: {data.get('titulo', 'sin título')[:50]}...")
        return None, False
    
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
