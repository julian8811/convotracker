#!/usr/bin/env bash
# Arranque del backend para Render (se ejecuta desde la raíz del repo)
cd backend && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
