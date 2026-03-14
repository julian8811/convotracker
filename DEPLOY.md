# Despliegue ConvoTracker

## Frontend (GitHub Pages)

Cada push a `main` despliega automáticamente el frontend en GitHub Pages:

- **URL**: `https://julian8811.github.io/<nombre-repo>/` (o la configurada en el repo)

El workflow `.github/workflows/deploy-pages.yml` construye el frontend y lo publica.

---

## Backend (Render u otro PaaS)

GitHub Pages solo sirve archivos estáticos; el backend debe desplegarse por separado.

### Opción A: Render.com (recomendado, plan gratuito)

1. Entra en [render.com](https://render.com) y conecta tu cuenta de GitHub.
2. **New → Web Service** y elige este repositorio.
3. Configuración:
   - **Name**: `convotracker-api` (o el que quieras).
   - **Root Directory**: `backend`.
   - **Runtime**: Python 3.
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Crea el servicio. Render te dará una URL como `https://convotracker-api.onrender.com`.

Para que el frontend en GitHub Pages use ese backend:

5. En GitHub: **Settings → Secrets and variables → Actions**.
6. Añade un secret: nombre `VITE_API_URL`, valor `https://convotracker-api.onrender.com` (sin barra final).
7. Vuelve a ejecutar el workflow de deploy (o haz un push) para que el frontend se construya con esa API. La app en línea usará el backend desplegado.

**CORS**: El backend ya permite `https://julian8811.github.io`. Si usas otro dominio para el front, añade en Render la variable de entorno:

- `CORS_ORIGINS_EXTRA` = `https://tu-dominio-del-front.com`

---

### Opción B: Railway, Fly.io, etc.

- **Railway**: Conectar repo, raíz `backend`, comando de inicio `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Fly.io**: Crear `Dockerfile` en `backend` o usar `fly launch` y configurar el comando de inicio.

En todos los casos, define la variable `PORT` que proporcione el servicio; el backend ya la usa. Luego configura `VITE_API_URL` en GitHub Secrets con la URL pública del backend y vuelve a desplegar el frontend.

---

## Comprobar que todo funciona en línea

1. **Solo frontend**: Abre la URL de GitHub Pages. Verás la interfaz; scraping y datos no funcionarán hasta que el backend esté desplegado y `VITE_API_URL` configurado.
2. **Frontend + backend**: Tras desplegar el backend y poner `VITE_API_URL`, redeploy del frontend. Abre la URL de GitHub Pages: listado de convocatorias, dashboard y scraping (si el backend está activo) deberían funcionar.

**Nota**: En el plan gratuito de Render el servicio se “duerme” tras inactividad; la primera petición puede tardar unos segundos.
