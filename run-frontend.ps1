# ConvoTracker - Iniciar Frontend (React + Vite)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $root "frontend")

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
    npm install
}

Write-Host "Frontend ConvoTracker en http://localhost:5173" -ForegroundColor Green
Write-Host "Asegurate de tener el backend en http://localhost:8000" -ForegroundColor Cyan
npm run dev
