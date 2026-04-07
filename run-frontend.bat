@echo off
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)
echo Frontend en http://localhost:5173
npm run dev
pause
