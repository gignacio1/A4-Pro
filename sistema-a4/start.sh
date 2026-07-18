#!/bin/bash
# Inicia api-server na porta 5001 e sistema-a4 (Vite) na porta 5002
set -e

# Caminhos absolutos
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/artifacts/api-server"
SISTEMA_DIR="$ROOT_DIR/artifacts/sistema-a4"

# api-server
cd "$API_DIR"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sistema_a4" \
PORT=5001 \
DIST=./dist \
node ./dist/index.mjs &

API_PID=$!
echo "api-server started (PID: $API_PID)"

# Aguarda api-server ficar pronto
sleep 3

# sistema-a4 (Vite)
cd "$SISTEMA_DIR"
PORT=5002 \
BASE_PATH=/ \
npx vite --config "$SISTEMA_DIR/vite.config.ts" --host 0.0.0.0 --port 5002 &

VITE_PID=$!
echo "sistema-a4 started (PID: $VITE_PID)"

# Trap para matar ambos ao encerrar
trap "kill $API_PID $VITE_PID 2>/dev/null" EXIT

# Mantém rodando
wait
