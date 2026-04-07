#!/usr/bin/env bash
# Script de inicio para desarrollo local
# Uso: ./run-dev.sh

set -e

# Detectar ruta del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Crear venv si no existe
if [ ! -d ".venv" ]; then
    echo "📦 Creando entorno virtual..."
    /usr/bin/python3 -m venv .venv
    source .venv/bin/activate
    pip install --quiet -r backend/requirements.txt
    echo "✅ Entorno virtual creado"
fi

# Activar venv
source .venv/bin/activate

# Verificar que sqlite funciona
echo "🔍 Verificando SQLite..."
python3 -c "import sqlite3; sqlite3.connect(':memory:'); print('✅ SQLite OK')"

# Iniciar backend
echo "🚀 Iniciando backend en http://localhost:8000"
echo "📖 Documentación: http://localhost:8000/docs"
echo ""
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
