#!/usr/bin/env bash
# ============================================================
# Sistema A4 PRO — script de start para VPS (linux/arm64 ou x64)
# Uso: bash start-vps.sh
# ============================================================
set -euo pipefail

# Carrega .env se existir
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
  echo "✔  .env carregado"
else
  echo "⚠  Arquivo .env não encontrado. Crie um a partir de .env.example"
  exit 1
fi

# Verifica dependências obrigatórias
: "${DATABASE_URL:?Variável DATABASE_URL não definida no .env}"
: "${SESSION_SECRET:?Variável SESSION_SECRET não definida no .env}"

PORT="${PORT:-3000}"

echo ""
echo "=== 1/4  Instalando dependências ==="
npm install

echo ""
echo "=== 2/4  Aplicando schema no banco ==="
npm run push -w @workspace/db

echo ""
echo "=== 3/4  Build do frontend ==="
PORT=9999 BASE_PATH=/ npm run build -w @workspace/sistema-a4

echo ""
echo "=== 4/4  Build da API ==="
npm run build -w @workspace/api-server

echo ""
echo "=========================================="
echo "  Build concluído!"
echo ""
echo "  Iniciando o servidor na porta ${PORT}..."
echo "  Acesse: http://<ip-da-vps>:${PORT}"
echo "=========================================="
PORT=$PORT NODE_ENV=production node --enable-source-maps artifacts/api-server/dist/index.mjs
