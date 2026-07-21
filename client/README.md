# PC Recommender — Client

Next.js 15 + React + MUI (Materio).

## Setup

```bash
pnpm install
cp .env.example .env.local   # si aún no tienes .env.local
pnpm dev
```

App: `http://localhost:3000`

## Env

| Archivo | Uso |
|---|---|
| `.env.example` | Plantilla |
| `.env.development` | `next dev` |
| `.env.production` | `next build` / `next start` |
| `.env.local` | Overrides locales (no se sube a git) |

Variables públicas al browser: prefijo `NEXT_PUBLIC_`.
