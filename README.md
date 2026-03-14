# ConvoTracker - Plataforma de Vigilancia Tecnológica y Rastreo de Convocatorias

ConvoTracker es una aplicación web profesional para rastrear convocatorias nacionales e internacionales orientadas a emprendimiento, proyectos de investigación, innovación y transferencia tecnológica.

**Repositorio:** [github.com/julian8811/convotracker](https://github.com/julian8811/convotracker) · **Demo (GitHub Pages):** [julian8811.github.io/convotracker](https://julian8811.github.io/convotracker/) *(frontend; el backend debe ejecutarse en local para datos en vivo)*

## Descripción Funcional

- **Web scraping automatizado** diario de fuentes oficiales (Minciencias, iNNpulsa, Fondo Emprender, EU Funding & Tenders, Banco Mundial)
- **Clasificación inteligente** por sector, país, entidad, tipo, fechas y montos
- **Eliminación de duplicados** mediante hashing de contenido
- **Actualización automática** de estados (abierta, cerrada, próxima)
- **Interfaz moderna** con búsqueda avanzada, filtros y paginación
- **Dashboard analítico** con gráficos interactivos (Recharts)
- **Reportes PDF** profesionales individuales y consolidados
- **Gestión de scraping** con historial de ejecuciones y monitoreo

## Arquitectura Tecnológica

### Backend
- **Python 3.11+** con **FastAPI** (async)
- **SQLAlchemy 2.0** con SQLite (async, migrable a PostgreSQL)
- **APScheduler** para tareas programadas
- **BeautifulSoup4 + httpx** para web scraping
- **ReportLab** para generación de PDFs

### Frontend
- **React 18** con Vite
- **TailwindCSS** para estilos
- **Recharts** para visualizaciones
- **Lucide React** para iconografía
- **React Router** para navegación SPA

## Estructura del Proyecto

```
ConvoTracker/
├── run-backend.ps1    # Script para iniciar backend (Windows)
├── run-frontend.ps1   # Script para iniciar frontend (Windows)
├── run-backend.bat    # Alternativa .bat para backend
├── run-frontend.bat   # Alternativa .bat para frontend
├── backend/
│   ├── app/
│   │   ├── api/            # Endpoints REST
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Esquemas Pydantic
│   │   ├── scraping/       # Motor de scraping
│   │   │   └── sources/    # Scrapers por fuente
│   │   ├── services/       # Lógica de negocio y PDF
│   │   ├── utils/          # Utilidades
│   │   ├── config.py       # Configuración
│   │   ├── database.py     # Conexión BD
│   │   └── main.py         # App FastAPI
│   ├── requirements.txt
│   ├── seed_data.py        # Datos de demostración
│   └── run.py              # Script de inicio
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── services/       # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## Instalación y Ejecución

### Ejecución rápida (Windows)

1. **Backend:** doble clic en `run-backend.bat` o en PowerShell: `.\run-backend.ps1`  
   - Crea el venv, instala dependencias y carga datos de ejemplo si es la primera vez.  
   - Servidor en **http://localhost:8000** · API docs: **http://localhost:8000/docs**

2. **Frontend:** en otra terminal, doble clic en `run-frontend.bat` o: `.\run-frontend.ps1`  
   - Instala dependencias si hace falta y arranca Vite.  
   - App en **http://localhost:5173** (el backend debe estar corriendo en 8000).

### Requisitos
- Python 3.11 o superior (backend)
- Node.js 18 o superior y npm (frontend)

### 1. Backend (manual)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Cargar datos de demostración (opcional)
python seed_data.py

# Iniciar servidor
python run.py
```

El backend estará disponible en `http://localhost:8000`
- Documentación API: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Módulos Principales

### 1. Motor de Scraping
- Scrapers modulares por fuente (patrón Strategy)
- Clase base `BaseScraper` con fetch HTTP y parsing HTML
- Scheduler con APScheduler (cada 24h configurable)
- Deduplicación por hash SHA-256
- Logs de ejecución

### 2. API REST
- CRUD de convocatorias con filtros avanzados
- Dashboard con estadísticas agregadas
- Gestión de scraping (trigger manual, logs, fuentes)
- Generación de reportes PDF
- Paginación y ordenamiento

### 3. Frontend SPA
- Home con hero, estadísticas y últimas convocatorias
- Lista con búsqueda, filtros y paginación
- Detalle de convocatoria con toda la información
- Dashboard con gráficos interactivos
- Panel de scraping con monitoreo

### 4. Reportes PDF
- Reporte individual por convocatoria
- Reporte consolidado con tabla resumen
- Diseño profesional con ReportLab

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/convocatorias` | Listar con filtros |
| GET | `/api/v1/convocatorias/{id}` | Detalle |
| PATCH | `/api/v1/convocatorias/{id}` | Actualizar |
| GET | `/api/v1/filters/options` | Opciones de filtros |
| GET | `/api/v1/dashboard/stats` | Estadísticas |
| POST | `/api/v1/scraping/run` | Ejecutar scraping |
| GET | `/api/v1/scraping/logs` | Historial |
| GET | `/api/v1/scraping/sources` | Fuentes |
| GET | `/api/v1/reports/convocatoria/{id}` | PDF individual |
| GET | `/api/v1/reports/all` | PDF consolidado |

## Modelo de Datos

### Convocatoria
- `id`, `titulo`, `descripcion`, `entidad`, `pais`, `region`
- `sector`, `tipo`, `estado`, `fecha_publicacion`, `fecha_apertura`, `fecha_cierre`
- `monto_minimo`, `monto_maximo`, `moneda`
- `url_fuente`, `url_terminos`, `requisitos`, `beneficiarios`
- `tags`, `hash_contenido`, `fuente_scraping`, `activa`
- `created_at`, `updated_at`

### ScrapingLog
- `id`, `fuente`, `estado`, `registros_encontrados`
- `registros_nuevos`, `registros_actualizados`
- `error_mensaje`, `duracion_segundos`, `ejecutado_en`

## Roadmap de Desarrollo

### Fase 1 (Actual)
- [x] Backend FastAPI con API REST
- [x] Motor de scraping con 5 fuentes
- [x] Frontend React con dashboard
- [x] Reportes PDF
- [x] Búsqueda y filtros avanzados

### Fase 2
- [ ] Autenticación de usuarios (JWT)
- [ ] Notificaciones por email
- [ ] Más fuentes de scraping (COLCIENCIAS, BID, OEA)
- [ ] Alertas personalizadas por usuario
- [ ] Exportar a Excel/CSV

### Fase 3
- [ ] IA para clasificación automática de convocatorias
- [ ] Sistema de favoritos y seguimiento
- [ ] API pública con API keys
- [ ] Deploy en la nube (AWS/GCP/Azure)
- [ ] App móvil (React Native)

## Seguridad y Mantenimiento

- CORS configurado para orígenes permitidos
- Rate limiting en endpoints de scraping
- Validación de entrada con Pydantic
- Hash de contenido para integridad
- Variables de entorno para configuración sensible
- Logs estructurados para monitoreo
- Respaldos periódicos de base de datos recomendados

## Tecnologías

| Componente | Tecnología |
|------------|------------|
| Backend | FastAPI, Python 3.11+ |
| Base de datos | SQLite / PostgreSQL |
| ORM | SQLAlchemy 2.0 (async) |
| Scraping | BeautifulSoup4, httpx |
| Scheduling | APScheduler |
| Frontend | React 18, Vite |
| Estilos | TailwindCSS |
| Gráficos | Recharts |
| PDFs | ReportLab |
| Iconos | Lucide React |

## Despliegue en GitHub

El proyecto está preparado para subirse a tu cuenta **julian8811**:

1. **Crea un repositorio nuevo** en GitHub:
   - Ve a [github.com/new](https://github.com/new)
   - Nombre sugerido: `convotracker`
   - Deja el repo vacío (sin README, sin .gitignore)

2. **Sube el código** (en la carpeta del proyecto):
   ```bash
   git remote add origin https://github.com/julian8811/convotracker.git
   git branch -M main
   git push -u origin main
   ```
   Si ya añadiste el `remote`, solo ejecuta: `git push -u origin main`

3. Si GitHub te pide autenticación, usa un **Personal Access Token** (Settings → Developer settings → Personal access tokens) como contraseña.

### Si el workflow de Pages falla con "Get Pages site failed"

1. Entra en el repo → **Settings** → **Pages**.
2. En **Build and deployment**, **Source** debe ser **GitHub Actions**.
3. Si no aparece esa opción, elige **Deploy from a branch** y luego vuelve a **GitHub Actions** cuando esté disponible. Guarda.
4. Vuelve a ejecutar el workflow (Actions → Deploy ConvoTracker to GitHub Pages → Re-run all jobs).

---

Desarrollado con ConvoTracker v1.0
