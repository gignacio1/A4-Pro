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

echo ""
echo "=== 1/4  Instalando dependências ==="
pnpm install --frozen-lockfile

echo ""
echo "=== 2/4  Aplicando schema no banco ==="
pnpm --filter @workspace/db run push

echo ""
echo "=== 3/4  Build do frontend ==="
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/sistema-a4 run build

echo ""
echo "=== 4/4  Build + start da API ==="
PORT=5002 pnpm --filter @workspace/api-server run build

echo ""
echo "=========================================="
echo "  Build concluído!"
echo ""
echo "  Agora inicie os dois processos:"
echo ""
echo "  Terminal 1 – API:"
echo "    PORT=5002 NODE_ENV=production node --enable-source-maps artifacts/api-server/dist/index.mjs"
echo ""
echo "  Terminal 2 – Frontend (preview estático):"
echo "    PORT=3000 BASE_PATH=/ npx serve -s artifacts/sistema-a4/dist/public -l 3000"
echo ""
echo "  Acesse: http://<ip-da-vps>:3000"
echo "=========================================="
