from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ConvocatoriaBase(BaseModel):
    titulo: str = Field(..., max_length=500)
    descripcion: Optional[str] = None
    entidad: str = Field(..., max_length=300)
    pais: str = Field(..., max_length=100)
    region: Optional[str] = None
    sector: Optional[str] = None
    tipo: str = "otro"
    estado: str = "abierta"
    fecha_publicacion: Optional[datetime] = None
    fecha_apertura: Optional[datetime] = None
    fecha_cierre: Optional[datetime] = None
    monto_minimo: Optional[float] = None
    monto_maximo: Optional[float] = None
    moneda: Optional[str] = "USD"
    url_fuente: str
    url_terminos: Optional[str] = None
    requisitos: Optional[str] = None
    beneficiarios: Optional[str] = None
    tags: Optional[str] = None

class ConvocatoriaCreate(ConvocatoriaBase):
    hash_contenido: str
    fuente_scraping: str

class ConvocatoriaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    fecha_cierre: Optional[datetime] = None
    monto_minimo: Optional[float] = None
    monto_maximo: Optional[float] = None
    activa: Optional[bool] = None

class ConvocatoriaResponse(ConvocatoriaBase):
    id: int
    hash_contenido: str
    fuente_scraping: str
    activa: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConvocatoriaListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[ConvocatoriaResponse]

class FilterParams(BaseModel):
    search: Optional[str] = None
    pais: Optional[str] = None
    tipo: Optional[str] = None
    estado: Optional[str] = None
    sector: Optional[str] = None
    entidad: Optional[str] = None
    fecha_desde: Optional[datetime] = None
    fecha_hasta: Optional[datetime] = None
    monto_min: Optional[float] = None
    monto_max: Optional[float] = None
    page: int = 1
    page_size: int = 20
    sort_by: str = "fecha_cierre"
    sort_order: str = "desc"

class DashboardStats(BaseModel):
    total_convocatorias: int
    abiertas: int
    cerradas: int
    proximas: int
    por_pais: dict
    por_tipo: dict
    por_sector: dict
    por_entidad: dict
    por_mes: dict
    monto_promedio: Optional[float]
    ultimas_agregadas: list[ConvocatoriaResponse]

class ScrapingLogResponse(BaseModel):
    id: int
    fuente: str
    estado: str
    registros_encontrados: int
    registros_nuevos: int
    registros_actualizados: int
    error_mensaje: Optional[str] = None
    duracion_segundos: Optional[float] = None
    ejecutado_en: datetime

    class Config:
        from_attributes = True
