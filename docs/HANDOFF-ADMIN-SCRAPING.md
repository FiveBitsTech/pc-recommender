# Handoff — Admin catálogo + scraping por empresa

Contexto de la sesión Cursor (jul 2026) para continuar en otra máquina.

**Repo:** `pc-recommender` · **Rama típica:** `development`  
**Transcript local (solo esta PC):**  
`C:\Users\jesus\.cursor\projects\c-PROYECTOS-INMEDIATOS-Calendary-app\agent-transcripts\b3e77c97-6eb9-480b-82f7-a0cc239671db\b3e77c97-6eb9-480b-82f7-a0cc239671db.jsonl`

## Qué quedó hecho

### Scraping (sin adapters/fixtures genéricos)
- Flujo: **Empresa (website + scrapeConfig)** → `POST /api/scraping/run` con `{ companyId }` → `PlaywrightStoreProbe` → ingest → `ScrapingHistory`.
- Eliminados: adapters dedicados, fixtures, preview/sources, fallbacks `fixture` / `memory-kings`.
- Cron: empresas activas (`findAllActive`), no `SCRAPE_SOURCES`.
- Env mínimo (`server/.env.example`): `SCRAPE_PRODUCT_LIMIT`, `SCRAPE_REQUEST_DELAY_MS`, `SCRAPE_CRON`, `SCRAPE_CRON_ENABLED`.
- UI Scraping: tab Catálogo + Config (limpiar catálogo). Sin copy live/fixture.

### Administración (`/admin`)
- Menú vertical: Productos, Precios, Specs, Tags, Comparaciones, Recomendaciones.
- API admin en products (list/patch/delete, prices, specs, tags, comparisons, recommendations).
- Header uniforme: `AdminPanelHeader` (buscador + selector empresa).
- Empty state uniforme: `AdminEmptyState` (mismo tamaño).
- Anti-flicker: shell fijo, tabs lazy + `keepMounted`, skeleton con retardo 250 ms (`AdminBodyGate` + `useDelayedFlag`).
- Grid MUI: `Grid2` en layout admin.

### Otros
- Seed: solo admin (sin empresas de demo).
- Skills/rules: `pc-cotiza-scraping`, `pc-cotiza-ui-stable-shell`, `pc-cotiza-ui-toasts`.
- Toasts: una sola línea.

## Cómo probar (pendiente del usuario)

1. Crear empresa en **Empresas** (website + scrapeConfig IA si aplica).
2. **Scraping** → Ejecutar en esa empresa.
3. Ver productos en **Administración**.
4. Opcional: Config scraping → limpiar catálogo (no borra empresas).

```bash
# server
cd server && pnpm run start:dev   # o el script que uses

# client
cd client && pnpm run dev
```

Reiniciar Nest tras cambiar `.env`.

## Archivos clave

| Área | Ruta |
|------|------|
| Admin UI | `client/src/views/admin/` |
| Admin layout | `client/src/views/admin/layout/AdminMenuLayout.jsx` |
| Empty / gate / header | `AdminEmptyState`, `AdminBodyGate`, `AdminPanelHeader` |
| Scraping UI | `client/src/views/scraping/` |
| Run scrape | `server/.../run-scraping.use-case.ts` |
| Probe | `server/.../playwright-store-probe.ts` |
| Controller | `server/.../scraping.controller.ts` |
| Env | `server/.env` / `.env.example` |

## Decisiones de producto

- No hardcodear tiendas en `.env`.
- Scraping solo por `companyId` + scrapeConfig/website.
- Skeleton no debe flashear en respuestas &lt; ~250 ms.
- Empty states centrados iguales en todos los tabs admin.

## Mensaje de commit sugerido

```
feat(admin): panel de catálogo, scraping por empresa y UX anti-flicker
```

## Al abrir en el trabajo

1. `git pull` de `development` (o la rama donde esté el commit).
2. En Cursor: `@docs/HANDOFF-ADMIN-SCRAPING.md` o “continúa el handoff de admin/scraping”.
3. Probar scrap real; ajustar probe/scrapeConfig si hace falta por HTML de cada tienda.
