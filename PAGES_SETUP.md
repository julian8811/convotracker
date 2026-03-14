# Cómo activar GitHub Pages para ConvoTracker (evitar 404)

El mensaje **"There isn't a GitHub Pages site here"** aparece cuando Pages no está activado en el repositorio o la fuente no es **GitHub Actions**.

## Pasos (en el repositorio convotracker)

### 1. Abre el repositorio
https://github.com/julian8811/convotracker

### 2. Entra en Settings del repo
Pestaña **Settings** del repositorio (junto a Code, Issues, Pull requests…).

### 3. Abre la sección Pages
En el **menú izquierdo** (donde ves Branches, Tags, Actions, **Pages**…), haz clic en **Pages**.

### 4. Configura la fuente (panel derecho)
En la zona **derecha** de la pantalla deberías ver algo como **"Build and deployment"**:

- En **Source** (o "Origen") elige: **GitHub Actions**  
  (no "Deploy from a branch" ni una rama).

Si solo ves "None" o no aparece "GitHub Actions", primero hay que ejecutar el workflow una vez (paso 6) y luego volver aquí; a veces la opción aparece después del primer deploy.

### 5. Lanza o vuelve a lanzar el workflow
1. Ve a la pestaña **Actions** del mismo repo (arriba, junto a Pull requests).
2. En la lista, abre **"Deploy ConvoTracker to GitHub Pages"**.
3. Si el último run falló o quieres forzar un nuevo deploy: **Re-run all jobs**.
4. Espera a que **los dos jobs** (build y deploy) terminen en **verde** ✓.

Si el job **deploy** pide aprobación (botón "Review deployments"), aprueba el entorno **github-pages** la primera vez.

### 6. Abre la página
Cuando el workflow termine en verde, abre (puede tardar 1–2 minutos):

**https://julian8811.github.io/convotracker/**

---

## Si la URL sigue en 404

- **Revisa Actions:** el job **deploy** debe estar en verde. Si **build** está verde pero **deploy** falla, en Settings → Pages la fuente debe ser **GitHub Actions** (paso 4).
- **Espera 1–2 minutos** después de que el workflow termine; a veces la CDN tarda un poco.
- **Vuelve a comprobar Settings → Pages:** Source = **GitHub Actions**. Si estaba en "Deploy from a branch", cámbialo a **GitHub Actions** y guarda, luego en Actions → Re-run all jobs.

---

**Importante:** La sección **Pages** que necesitas es la del **repositorio** (menú izquierdo bajo "Code and automation"), no la de tu cuenta (Verified domains).
