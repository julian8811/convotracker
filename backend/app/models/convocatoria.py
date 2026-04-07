from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base
import enum

class ConvocatoriaStatus(str, enum.Enum):
    ABIERTA = "abierta"
    CERRADA = "cerrada"
    PROXIMA = "próxima"
    EN_EVALUACION = "en_evaluación"

class ConvocatoriaTipo(str, enum.Enum):
    EMPRENDIMIENTO = "emprendimiento"
    INVESTIGACION = "investigación"
    INNOVACION = "innovación"
    TRANSFERENCIA = "transferencia_tecnológica"
    DESARROLLO = "desarrollo"
    COOPERACION = "cooperación_internacional"
    OTRO = "otro"

class Convocatoria(Base):
    __tablename__ = "convocatorias"

    id = Column(Integer, primary_key=True, autoincrement=True)
    titulo = Column(String(500), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    entidad = Column(String(300), nullable=False, index=True)
    pais = Column(String(100), nullable=False, index=True)
    region = Column(String(100), nullable=True)
    sector = Column(String(200), nullable=True, index=True)
    tipo = Column(String(50), nullable=False, default=ConvocatoriaTipo.OTRO.value)
    estado = Column(String(30), nullable=False, default=ConvocatoriaStatus.ABIERTA.value)
    fecha_publicacion = Column(DateTime, nullable=True)
    fecha_apertura = Column(DateTime, nullable=True)
    fecha_cierre = Column(DateTime, nullable=True)
    monto_minimo = Column(Float, nullable=True)
    monto_maximo = Column(Float, nullable=True)
    moneda = Column(String(10), nullable=True, default="USD")
    url_fuente = Column(String(1000), nullable=False)
    url_terminos = Column(String(1000), nullable=True)
    requisitos = Column(Text, nullable=True)
    beneficiarios = Column(Text, nullable=True)
    tags = Column(String(500), nullable=True)
    hash_contenido = Column(String(64), unique=True, nullable=False)
    fuente_scraping = Column(String(200), nullable=False)
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Convocatoria {self.id}: {self.titulo[:50]}>"


class ScrapingLog(Base):
    __tablename__ = "scraping_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fuente = Column(String(200), nullable=False)
    estado = Column(String(30), nullable=False)
    registros_encontrados = Column(Integer, default=0)
    registros_nuevos = Column(Integer, default=0)
    registros_actualizados = Column(Integer, default=0)
    error_mensaje = Column(Text, nullable=True)
    duracion_segundos = Column(Float, nullable=True)
    ejecutado_en = Column(DateTime, server_default=func.now())
