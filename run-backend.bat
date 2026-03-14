@echo off
cd /d "%~dp0backend"
if not exist "venv\Scripts\activate.bat" (
    echo Creando entorno virtual...
    py -3 -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    python seed_data.py
) else (
    call venv\Scripts\activate.bat
)
echo Backend en http://localhost:8000 - Docs: http://localhost:8000/docs
python run.py
pause
