from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import async_session, get_db
from app.models import User, Favorite, Convocatoria
from app.schemas import FavoriteCreate, FavoriteResponse, FavoriteWithConvocatoria
from app.api.auth import get_current_user


router = APIRouter(prefix="/api/v1/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteWithConvocatoria])
async def list_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all favorites for the current user."""
    # Optimizado: Usar JOIN en lugar de N+1 queries
    # Esto hace 1 query en lugar de 1 + N queries (donde N = número de favoritos)
    result = await db.execute(
        select(Favorite)
        .where(Favorite.user_id == current_user.id)
        .options(selectinload(Favorite.convocatoria))  # Carga la relación en una sola query
        .order_by(Favorite.created_at.desc())
    )
    favorites = result.scalars().all()
    
    # Ahora cada favorito ya tiene la convocatoria cargada (sin query adicional)
    response = []
    for fav in favorites:
        if fav.convocatoria:  # La relación ya está cargada
            conv = fav.convocatoria
            response.append(FavoriteWithConvocatoria(
                id=fav.id,
                user_id=fav.user_id,
                convocatoria_id=fav.convocatoria_id,
                created_at=fav.created_at,
                titulo=conv.titulo,
                entidad=conv.entidad,
                pais=conv.pais,
                estado=conv.estado,
                fecha_cierre=conv.fecha_cierre,
                url_fuente=conv.url_fuente,
            ))
    
    return response


@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite_data: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a convocatoria to favorites."""
    # Check if convocatoria exists
    conv_result = await db.execute(
        select(Convocatoria).where(Convocatoria.id == favorite_data.convocatoria_id)
    )
    conv = conv_result.scalar_one_or_none()
    
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Convocatoria not found"
        )
    
    # Check if already favorited
    existing_result = await db.execute(
        select(Favorite).where(
            and_(
                Favorite.user_id == current_user.id,
                Favorite.convocatoria_id == favorite_data.convocatoria_id
            )
        )
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already in favorites"
        )
    
    # Create favorite
    new_favorite = Favorite(
        user_id=current_user.id,
        convocatoria_id=favorite_data.convocatoria_id
    )
    
    db.add(new_favorite)
    await db.commit()
    await db.refresh(new_favorite)
    
    return new_favorite


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a favorite."""
    result = await db.execute(
        select(Favorite).where(
            and_(
                Favorite.id == favorite_id,
                Favorite.user_id == current_user.id
            )
        )
    )
    favorite = result.scalar_one_or_none()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    await db.delete(favorite)
    await db.commit()
    
    return None
