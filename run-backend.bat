@echo off
cd /d "%~dp0backend"
title ConvoTracker Backend

:: Crear venv si no existe
if not exist "venv\Scripts\activate.bat" (
    echo Creando entorno virtual...
    py -3 -m venv venv
    if errorlevel 1 (
        echo ERROR: No se encontro Python. Instala Python 3.11+ desde python.org
        pause
        exit /b 1
    )
)

:: Activar venv
call venv\Scripts\activate.bat

:: Instalar/actualizar dependencias
echo Instalando dependencias...
pip install -r requirements.txt -q

:: Sembrar datos de ejemplo si la base de datos no existe
if not exist "convotracker.db" (
    echo Cargando datos de ejemplo...
    python seed_data.py
)

echo.
echo =========================================
echo  Backend en http://127.0.0.1:8000
echo  Docs:    http://127.0.0.1:8000/docs
echo =========================================
echo.
python run.py
pause
