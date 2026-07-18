# Sistema A4 PRO

Sistema para geração de documentos empresariais brasileiros (Orçamentos, Ordens de Serviço, Laudos Técnicos e Recibos) em formato A4, com exportação JPG via html2canvas.

## Run & Operate (Replit)

Workflows (managed by Replit — start from the Workflows panel):
- **artifacts/sistema-a4: web** — React frontend (Vite, port assigned by Replit; proxies `/api` → `localhost:8080`)
- **artifacts/api-server: API Server** — Express API (port 8080)

One-off commands:
- `npm run -w @workspace/db push` — apply schema to the dev database (Drizzle push)
- `npm run typecheck` — full typecheck across all workspaces
- `npm run build` — typecheck + build all packages
- `npm run -w @workspace/api-spec codegen` — regenerate React hooks and Zod schemas from OpenAPI spec

Environment:
- `DATABASE_URL` — auto-injected by Replit (runtime-managed, no manual setup needed)
- `SESSION_SECRET` — stored as a Replit Secret ✓

## Deploy em VPS (linux/x64 ou linux/arm64)

> O projeto suporta VPS ARM64 (ex: Oracle Cloud Free Tier, Ampere). Execute `bash start-vps.sh` após clonar.

### Pré-requisitos na VPS
- Node.js ≥ 20
- pnpm (`npm i -g pnpm`)
- PostgreSQL rodando (local ou externo)

### Passos
```bash
git clone <seu-repo>
cd <repo>
cp .env.example .env
nano .env          # preencha DATABASE_URL e SESSION_SECRET
bash start-vps.sh  # instala deps, aplica schema, faz build
```

Após o build, o script mostra os comandos finais para subir a API e o frontend. Para rodar em background use `pm2` ou `screen`.

### Variáveis de ambiente necessárias
| Variável | Obrigatório | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | ✅ | String aleatória longa (`openssl rand -hex 32`) |
| `NODE_ENV` | — | `production` (padrão) |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
