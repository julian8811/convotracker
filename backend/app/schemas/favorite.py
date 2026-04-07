from pydantic import BaseModel
from datetime import datetime


class FavoriteCreate(BaseModel):
    convocatoria_id: int


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    convocatoria_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FavoriteWithConvocatoria(FavoriteResponse):
    """Favorite response that includes the convocatoria details."""
    titulo: str
    entidad: str
    pais: str
    estado: str
    fecha_cierre: datetime | None
    url_fuente: str
