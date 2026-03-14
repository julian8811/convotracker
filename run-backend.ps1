# ConvoTracker - Iniciar Backend (FastAPI)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $root "backend")

if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
    py -3 -m venv venv
    & ".\venv\Scripts\Activate.ps1"
    pip install -r requirements.txt
    Write-Host "Ejecutando seed de datos de ejemplo..." -ForegroundColor Yellow
    python seed_data.py
} else {
    & ".\venv\Scripts\Activate.ps1"
}

Write-Host "Backend ConvoTracker en http://localhost:8000" -ForegroundColor Green
Write-Host "Documentacion API: http://localhost:8000/docs" -ForegroundColor Cyan
python run.py
