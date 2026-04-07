import os
import secrets
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings

# Ruta absoluta de la BD para que funcione igual desde cualquier directorio de ejecución
_db_path = Path(__file__).resolve().parent.parent / "convotracker.db"


def _cors_origins() -> list[str]:
    base = [
        "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173",
        "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000",
        "https://julian8811.github.io",
    ]
    extra = os.environ.get("CORS_ORIGINS_EXTRA", "")
    if extra:
        base.extend(s.strip() for s in extra.split(",") if s.strip())
    return base


def _get_secret_key() -> str:
    """Obtiene SECRET_KEY de forma segura.
    
    En producción DEBE estar configurada en .env.
    Si no existe y we're en modo producción (DEBUG=False), falla.
    """
    env_key = os.environ.get("SECRET_KEY")
    if env_key:
        return env_key
    
    # Si hay .env con SECRET_KEY vacio o no existe, usar fallback solo en desarrollo
    is_production = os.environ.get("DEBUG", "true").lower() == "false"
    if is_production:
        raise ValueError(
            "SECRET_KEY must be configured in .env for production. "
            "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
        )
    # En desarrollo, usar key fija (no regenera en cada restart)
    return "dev-secret-key-change-in-production"


class Settings(BaseSettings):
    APP_NAME: str = "ConvoTracker"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = f"sqlite+aiosqlite:///{_db_path.as_posix()}"
    SCRAPING_INTERVAL_HOURS: int = 24
    SCRAPING_ENABLED: bool = True
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: list[str] = Field(default_factory=_cors_origins)
    # Headers CORS explícitos (wildcard "*" no es compatible con credentials en algunos browsers)
    CORS_HEADERS: list[str] = [
        "Content-Type", "Authorization", "Accept", "Origin",
        "X-Requested-With", "Cache-Control",
    ]
    PDF_OUTPUT_DIR: str = str(Path(__file__).parent.parent / "reports")
    
    # JWT Configuration
    SECRET_KEY: str = Field(default_factory=_get_secret_key)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
