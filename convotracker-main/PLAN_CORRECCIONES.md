# SDD: Convotracker - Corrección de Issues

## Fase 1: Críticos (Seguridad y Funcionamiento)

### Issue 1.1: SECRET_KEY dinámica
- **Archivo**: `backend/app/config.py:40`
- **Problema**: `default_factory` genera nueva key en cada restart
- **Impacto**: Invalida todos los JWT tokens al reiniciar
- **Fix**: Cargar de variable de entorno `.env`

### Issue 1.2: Endpoint incorrecto en workflow
- **Archivo**: `.github/workflows/scraping.yml:21`
- **Problema**: Llama a `/api/v1/admin/cleanup-expired` pero la ruta real es `/admin/cleanup-expired`
- **Impacto**: Retorna 404, el cleanup nunca se ejecuta
- **Fix**: Cambiar a `/api/v1/admin/cleanup-expired` (el prefijo ya está en el router)

### Issue 1.3: Endpoints admin sin autenticación
- **Archivos**: `backend/app/api/routes.py`
- **Problema**: `/admin/cleanup-expired` y `/admin/cleanup-bad-urls` sin auth
- **Impacto**: Cualquier persona puede ejecutar cleanup
- **Fix**: Agregar dependencia de admin

### Issue 1.4: Registro sin rate limiting
- **Archivo**: `backend/app/api/auth.py`
- **Problema**: `/register` no tiene rate limiting
- **Impacto**: Fuerza bruta posible
- **Fix**: Aplicar rate limiter existente

### Issue 1.5: /scraping/logs expuesto
- **Archivo**: `backend/app/api/routes.py:215`
- **Problema**: Sin autenticación
- **Impacto**: Expone metadatos internos
- **Fix**: Agregar requires_auth

---

## Fase 2: Performance

### Issue 2.1: Query sin paginación
- **Archivo**: `backend/app/api/routes.py:126-144`
- **Problema**: Carga todas las convocatorias a memoria para contar estados
- **Impacto**: Consumo excesivo de memoria
- **Fix**: Usar COUNT en SQL

### Issue 2.2: N+1 en favoritos
- **Archivo**: `backend/app/api/favorites.py`
- **Problema**: Query individual por cada favorito
- **Fix**: Usar joinedload

### Issue 2.3: FavoriteButton hace múltiples llamadas
- **Archivo**: `frontend/src/components/FavoriteButton.jsx`
- **Problema**: Llama API en cada render
- **Fix**: Cachear estado de favorito

---

## Fase 3: UX/UI

### Issue 3.1: Diseño Login/Register inconsistente
- **Archivos**: `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`
- **Problema**: Usa clases Tailwind no definidas
- **Fix**: Usar los mismos estilos del resto de la app

### Issue 3.2: ErrorBoundary vacío
- **Archivo**: `frontend/src/App.jsx`
- **Problema**: No captura errores
- **Fix**: Implementar ErrorBoundary real

### Issue 3.3: Filtro entidad faltante
- **Archivo**: `frontend/src/pages/ConvocatoriasList.jsx`
- **Problema**: No muestra filtro de entidad
- **Fix**: Agregar select de entidad

---

## Fase 4: Scraping y CI/CD

### Issue 4.1: Formato grants_gov_api incorrecto
- **Archivo**: `backend/app/scraping/sources/grants_gov_api.py`
- **Problema**: Retorna dict en lugar de lista
- **Fix**: Normalizar formato de retorno

### Issue 4.2: Sin timeout por scraper
- **Archivo**: `backend/app/scraping/scheduler.py`
- **Problema**: Scraper puede bloquearse infinitamente
- **Fix**: Agregar asyncio.wait_for

### Issue 4.3: URLs obsoletas
- **Archivos**: Múltiples scrapers
- **Problema**: URLs que retornan 404
- **Fix**: Actualizar URLs

### Issue 4.4: Node version incorrecto
- **Archivo**: `.github/workflows/deploy-pages.yml`
- **Problema**: Node 24 no existe
- **Fix**: Cambiar a Node 22

---

## Fase 5: Funcionalidades

### Issue 5.1: DELETE endpoint faltante
- **Archivo**: `backend/app/api/routes.py`
- **Problema**: No hay DELETE /convocatorias/{id}
- **Fix**: Agregar endpoint

### Issue 5.2: Password reset faltante
- **Archivo**: `backend/app/api/auth.py`
- **Problema**: No hay recuperación de contraseña
- **Fix**: Agregar endpoint

### Issue 5.3: Token en localStorage
- **Archivo**: `frontend/src/services/api.js`
- **Problema**: Vulnerable a XSS
- **Fix**: Considerar httpOnly cookies
