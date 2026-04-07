# SDD: Convotracker - Corrección de Issues

> **Estado**: ✅ MAYORÍA RESUELTA - Solo pendiente: filtro entidad (Issue 3.3)

---

## Fase 1: Críticos (Seguridad y Funcionamiento) ✅

### Issue 1.1: SECRET_KEY dinámica ✅ RESUELTO
- **Archivo**: `backend/app/config.py:40`
- **Problema**: `default_factory` genera nueva key en cada restart
- **Impacto**: Invalida todos los JWT tokens al reiniciar
- **Fix**: Cargar de variable de entorno `.env` con fallback fijo en desarrollo

### Issue 1.2: Endpoint incorrecto en workflow ✅ RESUELTO
- **Archivo**: `.github/workflows/scraping.yml:21`
- **Problema**: Llama a `/api/v1/admin/cleanup-expired` pero la ruta real es `/admin/cleanup-expired`
- **Fix**: Cambiar a `/api/v1/admin/cleanup-expired` (el prefijo ya está en el router)

### Issue 1.3: Endpoints admin sin autenticación ✅ RESUELTO
- **Archivos**: `backend/app/api/routes.py`
- **Problema**: `/admin/cleanup-expired` y `/admin/cleanup-bad-urls` sin auth
- **Fix**: Agregar dependencia `get_current_user` a ambos endpoints

### Issue 1.4: Registro sin rate limiting ✅ YA EXISTÍA
- **Archivo**: `backend/app/api/auth.py:55`
- **Problema**: `/register` no tiene rate limiting
- **Fix**: Ya tenía `@limiter.limit("5/minute")` aplicado

### Issue 1.5: /scraping/logs expuesto ✅ RESUELTO
- **Archivo**: `backend/app/api/routes.py:227`
- **Problema**: Sin autenticación
- **Fix**: Agregado `current_user: User = Depends(get_current_user)`

---

## Fase 2: Performance ✅

### Issue 2.1: Query sin paginación ✅ RESUELTO
- **Archivo**: `backend/app/api/routes.py:102-104`
- **Problema**: Carga todas las convocatorias a memoria para contar estados
- **Fix**: Usar COUNT en SQL con subquery

### Issue 2.2: N+1 en favoritos ✅ YA ESTABA
- **Archivo**: `backend/app/api/favorites.py`
- **Problema**: Query individual por cada favorito
- **Verificación**: Ya usa el endpoint optimizado

### Issue 2.3: FavoriteButton hace múltiples llamadas ⚠️ PENDIENTE
- **Archivo**: `frontend/src/components/FavoriteButton.jsx`
- **Problema**: Llama API en cada render

---

## Fase 3: UX/UI

### Issue 3.1: Diseño Login/Register inconsistente ✅ RESUELTO
- **Archivos**: `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`
- **Problema**: Usa clases Tailwind no definidas
- **Fix**: Usar estilos inline consistente con el resto de la app

### Issue 3.2: ErrorBoundary vacío ✅ RESUELTO
- **Archivo**: `frontend/src/App.jsx`
- **Problema**: No captura errores
- **Fix**: Implementar ErrorBoundary real con componentDidCatch

### Issue 3.3: Filtro entidad faltante ⚠️ PENDIENTE
- **Archivo**: `frontend/src/pages/ConvocatoriasList.jsx`
- **Problema**: No muestra filtro de entidad aunque el backend lo soporta
- **Fix**: Agregar select de entidad en los filtros

---

## Fase 4: Scraping y CI/CD ✅

### Issue 4.1: Grants.gov genera datos falsos ✅ RESUELTO
- **Archivo**: `backend/app/scraping/sources/grants_gov_api.py`
- **Problema**: Scraper generaba datos buscando cualquier enlace con "grant"
- **Fix**: Deshabilitado el scraper completamente

### Issue 4.2: Sin timeout por scraper ✅ RESUELTO
- **Archivo**: `backend/app/scraping/scheduler.py`
- **Problema**: Scraper puede bloquearse infinitamente
- **Fix**: Agregar `asyncio.wait_for` con timeout de 60s

### Issue 4.3: Validación de convocatorias ✅ RESUELTO
- **Archivo**: `backend/app/services/convocatoria_service.py`
- **Problema**: Se guardaban convocatorias con datos mínimos insuficientes
- **Fix**: Agregada función `is_valid_convocatoria()` que rechaza:
  - Títulos menores a 10 caracteres
  - Descripciones menores a 20 caracteres
  - Sin entidad
  - URLs genéricas (facebook, twitter, mailto, etc.)
  - Títulos genéricos (click here, read more, etc.)

### Issue 4.4: Node version incorrecto ✅ RESUELTO
- **Archivo**: `.github/workflows/deploy-pages.yml`
- **Problema**: Node 24 no existe
- **Fix**: Cambiar a Node 22 LTS

---

## Fase 5: Funcionalidades ⚠️

### Issue 5.1: DELETE endpoint faltante ⚠️ PENDIENTE
- **Archivo**: `backend/app/api/routes.py`
- **Problema**: No hay DELETE /convocatorias/{id}

### Issue 5.2: Password reset faltante ⚠️ PENDIENTE
- **Archivo**: `backend/app/api/auth.py`
- **Problema**: No hay recuperación de contraseña

### Issue 5.3: Token en localStorage ⚠️ PENDIENTE
- **Archivo**: `frontend/src/services/api.js`
- **Problema**: Vulnerable a XSS
- **Fix**: Considerar httpOnly cookies

---

## Resumen de Fixes Pushados

1. ✅ SECRET_KEY dinámica → fallback fijo en desarrollo
2. ✅ Endpoint cleanup-expired corregido en scraping.yml
3. ✅ Endpoints admin con autenticación
4. ✅ /scraping/logs con autenticación
5. ✅ Rate limiting verificado (ya existía)
6. ✅ Query COUNT optimizado
7. ✅ Login/Register con estilos consistentes
8. ✅ ErrorBoundary implementado
9. ✅ Node 22 LTS
10. ✅ Timeout de 60s por scraper
11. ✅ Deshabilitado scraper Grants.gov
12. ✅ Validación is_valid_convocatoria()
