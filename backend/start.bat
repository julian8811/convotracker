@echo off
cd /d "%~dp0"
title ConvoTracker Backend

if not exist "venv\Scripts\activate.bat" (
  echo Creando entorno virtual de Python...
  py -3 -m venv venv
  if errorlevel 1 (
    echo No se encontro Python. Instala Python 3.11+ o usa "python -m venv venv"
    pause
    exit /b 1
  )
)

call venv\Scripts\activate.bat

echo Instalando dependencias si hace falta...
pip install -r requirements.txt -q

if not exist "convotracker.db" (
  echo Cargando datos de ejemplo...
  python seed_data.py
)

echo.
echo ========================================
echo  Backend en http://localhost:8000
echo  Documentacion: http://localhost:8000/docs
echo ========================================
echo.
python run.py
pause
