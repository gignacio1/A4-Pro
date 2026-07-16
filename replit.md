# Sistema A4 PRO

Sistema para geração de documentos empresariais brasileiros (Orçamentos, Ordens de Serviço, Laudos Técnicos e Recibos) em formato A4, com exportação JPG via html2canvas.

## Run & Operate (Replit)

- `pnpm --filter @workspace/api-server run dev` — API server (porta definida pelo Replit)
- `pnpm run typecheck` — typecheck completo
- `pnpm run build` — typecheck + build de todos os pacotes
- `pnpm --filter @workspace/api-spec run codegen` — regenera hooks e Zod schemas a partir do OpenAPI spec
- `pnpm --filter @workspace/db run push` — aplica schema no banco (dev)
- Env obrigatória: `DATABASE_URL` — string de conexão PostgreSQL

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
