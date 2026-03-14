# Subir ConvoTracker a GitHub (julian8811)

## 1. Instalar Node.js (si falta)

- Descarga: https://nodejs.org/ (versión LTS)
- O en PowerShell **como administrador**:  
  `winget install OpenJS.NodeJS.LTS --accept-package-agreements`
- Cierra y vuelve a abrir la terminal para que `node` y `npm` estén en el PATH.

## 2. Crear el repositorio en GitHub

1. Entra con tu usuario **julian8811** en https://github.com
2. Clic en **+** → **New repository**
3. **Repository name:** `convotracker`
4. Deja el repo **vacío** (no marques "Add a README")
5. **Create repository**

## 3. Autenticación con GitHub

GitHub **no acepta la contraseña de la cuenta** para `git push`. Hay que usar un **Personal Access Token (PAT)**:

1. En GitHub: **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Nombre: `ConvoTracker`
4. Marca el permiso **repo**
5. **Generate token** y **copia el token** (solo se muestra una vez).

## 4. Subir el proyecto

En la carpeta del proyecto (donde está este archivo), abre PowerShell o CMD:

```powershell
# Asegúrate de estar en la carpeta del proyecto
cd "C:\Users\ASUS\OneDrive\Desktop\Aplicación convocatoria"

# Si el remoto no está configurado:
git remote add origin https://github.com/julian8811/convotracker.git

# Subir (te pedirá usuario y contraseña)
git push -u origin main
```

- **Usuario:** `julian8811`
- **Contraseña:** pega aquí el **Personal Access Token** (no la contraseña de la cuenta).

Si ya tienes el remoto y solo quieres subir cambios:

```powershell
git push origin main
```

## 5. Ejecutar la aplicación

**Backend:** doble clic en `run-backend.bat` o en PowerShell: `.\run-backend.ps1`  
**Frontend:** en otra ventana, doble clic en `run-frontend.bat` o: `.\run-frontend.ps1`

- Backend: http://localhost:8000 (API docs: http://localhost:8000/docs)
- Frontend: http://localhost:5173
