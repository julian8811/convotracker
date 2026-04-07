from pydantic import BaseModel, Field, computed_field
from datetime import datetime, timedelta
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
    
    # Campos calculados (no se guardan en BD pero se incluyen en respuesta)
    dias_restantes: Optional[int] = None
    estado_calculado: Optional[str] = None
    monto_formateado: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_calculated_fields(cls, conv):
        """Convierte el modelo ORM incluyendo campos calculados"""
        data = {
            "id": conv.id,
            "titulo": conv.titulo,
            "descripcion": conv.descripcion,
            "entidad": conv.entidad,
            "pais": conv.pais,
            "region": conv.region,
            "sector": conv.sector,
            "tipo": conv.tipo,
            "estado": conv.estado,
            "fecha_publicacion": conv.fecha_publicacion,
            "fecha_apertura": conv.fecha_apertura,
            "fecha_cierre": conv.fecha_cierre,
            "monto_minimo": conv.monto_minimo,
            "monto_maximo": conv.monto_maximo,
            "moneda": conv.moneda or "USD",
            "url_fuente": conv.url_fuente,
            "url_terminos": conv.url_terminos,
            "requisitos": conv.requisitos,
            "beneficiarios": conv.beneficiarios,
            "tags": conv.tags,
            "hash_contenido": conv.hash_contenido,
            "fuente_scraping": conv.fuente_scraping,
            "activa": conv.activa,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
        }
        
        # Calcular días restantes
        if conv.fecha_cierre:
            ahora = datetime.now()
            if conv.fecha_cierre.tzinfo:
                # Remover timezone para comparar
                fecha_cierre = conv.fecha_cierre.replace(tzinfo=None)
            else:
                fecha_cierre = conv.fecha_cierre
            
            dias = (fecha_cierre - ahora).days
            data["dias_restantes"] = max(dias, 0) if dias >= 0 else dias
            
            # Calcular estado basado en fecha
            if dias < 0:
                data["estado_calculado"] = "cerrada"
            elif dias <= 7:
                data["estado_calculado"] = "por_vencer"
            elif dias <= 30:
                data["estado_calculado"] = "activa"
            else:
                data["estado_calculado"] = "activa"
        else:
            data["dias_restantes"] = None
            data["estado_calculado"] = conv.estado
        
        # Formatear monto
        if conv.monto_maximo:
            monto = conv.monto_maximo
            moneda = conv.moneda or "USD"
            if monto >= 1000000:
                data["monto_formateado"] = f"${monto/1000000:.1f}M {moneda}"
            else:
                data["monto_formateado"] = f"${monto:,.0f} {moneda}"
        elif conv.monto_minimo:
            monto = conv.monto_minimo
            moneda = conv.moneda or "USD"
            data["monto_formateado"] = f"Desde ${monto:,.0f} {moneda}"
        else:
            data["monto_formateado"] = None
        
        return cls(**data)


class ConvocatoriaListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[ConvocatoriaResponse]
    resumen: Optional[dict] = None  # Resumen de contadores


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
    por_vencer: int
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
