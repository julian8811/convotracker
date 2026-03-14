# Cómo activar el scraping en la demo (GitHub Pages)

Para que **Ejecutar Scraping** funcione en la demo en línea (sin usar tu PC), el backend debe estar desplegado en internet y la demo debe conocer su URL. Sigue estos pasos.

---

## Paso 1: Desplegar el backend en Render (gratis)

1. Entra en **https://render.com** e inicia sesión (o crea cuenta con GitHub).
2. Pulsa **New** → **Web Service**.
3. Conecta el repositorio **julian8811/convotracker** si aún no está conectado.
4. Configura el servicio así (**recomendado: dejar Root Directory vacío**):

   | Campo | Valor |
   |-------|--------|
   | **Name** | `convotracker-api` (o el que quieras) |
   | **Root Directory** | *(déjalo vacío)* |
   | **Runtime** | Python 3 |
   | **Build Command** | `cd backend && pip install -r requirements.txt` |
   | **Start Command** | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

   **Si el deploy falla** (por ejemplo "requirements.txt: No such file or directory"):  
   En Render → tu servicio → **Settings** → **Build & Deploy** → asegúrate de que **Root Directory** esté **vacío** y que **Build Command** y **Start Command** sean exactamente los de la tabla. Guarda y haz **Manual Deploy** → **Deploy latest commit**.

5. Pulsa **Create Web Service** (o **Save** si estabas editando). Render construirá y desplegará el backend.
6. Cuando termine, copia la **URL del servicio** (ej. `https://convotracker-api.onrender.com`). No incluyas barra final.

---

## Paso 2: Decirle a la demo dónde está el backend

1. En GitHub abre tu repositorio: **https://github.com/julian8811/convotracker**.
2. Ve a **Settings** → **Secrets and variables** → **Actions**.
3. Pulsa **New repository secret**.
4. **Name:** `VITE_API_URL`  
   **Value:** la URL que copiaste (ej. `https://convotracker-api.onrender.com`).
5. Guarda el secret.

---

## Paso 3: Volver a desplegar la demo (frontend)

1. En el repo ve a **Actions**.
2. Abre el workflow **Deploy ConvoTracker to GitHub Pages**.
3. Pulsa **Run workflow** → **Run workflow** (rama `main`).
4. Espera a que termine en verde. La demo se habrá construido de nuevo usando la URL del backend.

---

## Comprobar

- Abre **https://julian8811.github.io/convotracker/**.
- Entra en **Scraping**. Deberías ver “Backend conectado” y poder usar **Ejecutar Scraping**.

**Nota:** En el plan gratuito de Render el servicio puede tardar unos segundos en despertar si ha estado inactivo; si la primera vez falla, espera un poco y recarga la página.

---

## ¿Se puede usar Vercel para el backend?

**Vercel** está pensado sobre todo para frontends y funciones serverless (código que se ejecuta por petición, no 24/7). Este backend usa:

- **SQLite** y archivos persistentes (en Vercel el sistema de archivos es efímero).
- **APScheduler** (tareas en segundo plano cada 24 h), que no encaja con el modelo serverless.

Por eso **Render, Railway o Fly.io** son más adecuados para este backend. Si aun así quieres probar en Vercel, habría que adaptar el proyecto (por ejemplo base de datos externa y quitar el scheduler o moverlo a otro servicio).
