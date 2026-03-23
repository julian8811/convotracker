# Plan de Completitud — ConvoTracker

> Documento de trabajo para completar la aplicación y llevarla a producción.

---

## Estado Actual

| Módulo | Completado |
|--------|------------|
| Backend API REST | 100% |
| Scraping (14 fuentes) | 100% |
| Frontend SPA | 100% |
| Dashboard | 100% |
| Reportes PDF | 100% |
| **Fase 2 Roadmap** | **0%** |
| **Fase 3 Roadmap** | **0%** |

---

## 🔴 Prioridad Alta — Funcionalidades Críticas

### 1. Autenticación de Usuarios (JWT)

**Por qué**: Necesario para favoritos, alertas personalizadas y usuario.

**Archivos a modificar:**
- `backend/app/models/` — crear `User` model
- `backend/app/schemas/` — crear `UserCreate`, `UserLogin`, `Token`
- `backend/app/api/` — crear `auth.py` routes (login, register, me)
- `backend/app/middleware/` — crear JWT verification middleware
- `backend/app/config.py` — agregar `SECRET_KEY`, `ALGORITHM`

**Pasos:**
1. Crear modelo `User` con campos: `id, email, password_hash, nombre, rol, created_at`
2. Crear endpoint `POST /api/v1/auth/register` — hash de contraseña con bcrypt
3. Crear endpoint `POST /api/v1/auth/login` — retorna JWT token
4. Crear endpoint `GET /api/v1/auth/me` — retorna datos del usuario actual
5. Crear middleware de autenticación para proteger rutas
6. Agregar al frontend: login page, registro, logout, storing JWT en localStorage

---

### 2. Sistema de Favoritos / Seguimiento

**Por qué**: Permite a usuarios guardar convocatorias de interés.

**Archivos a modificar:**
- `backend/app/models/` — crear `Favorite` model
- `backend/app/api/` — crear `favorites.py` routes

**Pasos:**
1. Crear modelo `Favorite`: `id, user_id, convocatoria_id, created_at`
2. Crear endpoints:
   - `GET /api/v1/favorites` — listar favoritos del usuario
   - `POST /api/v1/favorites` — agregar favorito
   - `DELETE /api/v1/favorites/{id}` — quitar favorito
3. Modificar frontend: agregar botón "★ Favorito" en lista y detalle

---

### 3. Rate Limiting

**Por qué**: Protege el backend de abuse en endpoints de scraping.

**Pasos:**
1. Instalar `slowapi`: `pip install slowapi`
2. Crear `backend/app/utils/rate_limit.py`:
   ```python
   from slowapi import Limiter
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   ```
3. Aplicar a endpoints de scraping:
   ```python
   @router.post("/scraping/run")
   @limiter.limit("5/minute")
   async def run_scraping(request: Request): ...
   ```

---

## 🟡 Prioridad Media — Hardening para Producción

### 4. Tests Unitarios y de Integración

**Por qué**: Garantiza estabilidad y facilita mantenimiento.

**Pasos:**
1. Instalación: `pip install pytest pytest-asyncio httpx`
2. Estructura:
   ```
   backend/tests/
   ├── test_api/
   │   ├── test_convocatorias.py
   │   └── test_auth.py
   ├── test_services/
   │   └── test_convocatoria_service.py
   └── conftest.py
   ```
3. Crear `conftest.py` con fixtures: `db_session`, `client`, `test_user`
4. Escribir tests para:
   - CRUD de convocatorias
   - Autenticación JWT
   - Scraping (usar responses mockeados)
   - Generación de PDF

---

### 5. Migraciones de Base de Datos (Alembic)

**Por qué**: SQLite con `create_all` no escala a producción.

**Pasos:**
1. Instalar: `pip install alembic`
2. Inicializar: `alembic init backend/alembic`
3. Configurar `alembic.ini` y `backend/alembic/env.py` para SQLAlchemy
4. Generar migración inicial: `alembic revision --autogenerate -m "initial"`
5. Aplicar: `alembic upgrade head`

---

### 6. Retry Logic en Scrapers

**Por qué**: Las páginas objetivo cambian y los scrapers fallan silenciosamente.

**Pasos:**
1. Instalar `tenacity`: `pip install tenacity`
2. Modificar `backend/app/scraping/base.py`:
   ```python
   from tenacity import retry, stop_after_attempt, wait_exponential
   
   @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
   async def fetch(self, url: str):
       # ... código actual
   ```
3. Agregar logging cuando hay retry

---

### 7. Exportación Excel/CSV

**Por qué**: Los usuarios prefieren Excel sobre PDF para análisis.

**Pasos:**
1. Instalar `openpyxl`: `pip install openpyxl`
2. Crear `backend/app/services/excel_service.py`:
   - `generate_convocatorias_xlsx(filters)` → bytes
   - `generate_convocatorias_csv(filters)` → bytes
3. Agregar endpoints:
   - `GET /api/v1/reports/convocatorias.xlsx`
   - `GET /api/v1/reports/convocatorias.csv`
4. Frontend: agregar botones de exportación en toolbar

---

## 🟢 Prioridad Baja — Mejoras de UX

### 8. Modo Dark/Light

**Pasos:**
1. Agregar `dark` al `tailwind.config.js`:
   ```js
   darkMode: 'class'
   ```
2. Crear componente `ThemeToggle.jsx`
3. Guardar preferencia en `localStorage`
4. Aplicar clase `dark` al elemento root

---

### 9. Skeleton Loaders

**Pasos:**
1. Crear `SkeletonCard.jsx`, `SkeletonTable.jsx`, `SkeletonChart.jsx`
2. Usar en componentes mientras cargan datos:
   ```jsx
   {loading ? <SkeletonCard /> : <ConvocatoriaCard data={data} />}
   ```

---

### 10. Notificaciones Toast

**Pasos:**
1. Instalar `react-hot-toast`: `npm install react-hot-toast`
2. Configurar en `App.jsx`: `<Toaster position="top-right" />`
3. Reemplazar `alert()` por `toast.success()` / `toast.error()`

---

## 📋 Resumen de Tareas por Fase

### Fase 2 — MVP Funcional (Semanas 1-2)

| # | Tarea | Archivos principales |
|---|-------|----------------------|
| 1 | Auth JWT | `models/user.py`, `api/auth.py`, `middleware/auth.py` |
| 2 | Login/Registro UI | `pages/Login.jsx`, `pages/Register.jsx` |
| 3 | Favoritos | `models/favorite.py`, `api/favorites.py` |
| 4 | Rate limiting | `utils/rate_limit.py` |
| 5 | Excel/CSV export | `services/excel_service.py` |

### Fase 3 — Producción (Semanas 3-4)

| # | Tarea | Archivos principales |
|---|-------|----------------------|
| 6 | Tests | `tests/test_*.py`, `conftest.py` |
| 7 | Alembic | `alembic/` |
| 8 | Retry logic | `scraping/base.py` |
| 9 | Dark mode | `components/ThemeToggle.jsx` |
| 10 | Toast notifications | `App.jsx`, `*Page.jsx` |

---

## 🎯 Orden Sugerido de Implementación

```
1. Auth JWT + Login UI
   ↓
2. Favoritos
   ↓
3. Rate Limiting
   ↓
4. Excel/CSV Export
   ↓
5. Tests + Alembic
   ↓
6. Retry Logic (scrapers)
   ↓
7. UX: Dark mode, Toasts, Skeletons
```

---

## ⚠️ Consideraciones Técnicas

### Scrapers con Problemas
Los siguientes scrapers usan selectores CSS genéricos que pueden fallar si las webs cambian:
- `sena.py`
- `innpulsa.py`
- `eu_funding.py`
- `giz.py`

**Recomendación**: Revisar cada scraper manualmente y usar selectores más específicos o XPath.

### Variables de Entorno Requeridas
Crear `.env.example`:
```
DATABASE_URL=sqlite+aiosqlite:///convotracker.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
VITE_API_URL=http://localhost:8000
```

---

## ✅ Checklist de Completitud

- [ ] Auth JWT implementado
- [ ] Login/Registro en frontend
- [ ] Sistema de favoritos
- [ ] Rate limiting activo
- [ ] Exportación Excel/CSV
- [ ] Tests passando (>80% coverage)
- [ ] Migraciones Alembic configuradas
- [ ] Retry logic en scrapers
- [ ] Dark mode
- [ ] Toast notifications
- [ ] Skeleton loaders

---

*Documento generado para planificación. Actualizar conforme avanza la implementación.*
