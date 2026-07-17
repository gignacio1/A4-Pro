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

# Porta padrão se não definida no .env
PORT="${PORT:-3000}"

echo ""
echo "=== 1/4  Instalando dependências ==="
pnpm install --frozen-lockfile

echo ""
echo "=== 2/4  Aplicando schema no banco ==="
pnpm --filter @workspace/db run push

echo ""
echo "=== 3/4  Build do frontend ==="
# BASE_PATH=/ porque o frontend roda na raiz do mesmo domínio/porta que a API
PORT=9999 BASE_PATH=/ pnpm --filter @workspace/sistema-a4 run build

echo ""
echo "=== 4/4  Build da API ==="
pnpm --filter @workspace/api-server run build

echo ""
echo "=========================================="
echo "  Build concluído!"
echo ""
echo "  Inicie o servidor com:"
echo ""
echo "    PORT=${PORT} NODE_ENV=production node --enable-source-maps artifacts/api-server/dist/index.mjs"
echo ""
echo "  A API e o frontend estão na mesma porta."
echo "  Acesse: http://<ip-da-vps>:${PORT}"
echo "=========================================="
echo ""
echo "  Para rodar agora:"
PORT=$PORT NODE_ENV=production node --enable-source-maps artifacts/api-server/dist/index.mjs
