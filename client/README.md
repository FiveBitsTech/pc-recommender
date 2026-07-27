# PC COTIZA-IA — Client

Next.js 15 (App Router + Turbopack) + React + MUI 6 + Redux Toolkit + Tailwind CSS.

## Setup

```bash
cd client
pnpm install
cp .env.example .env.local    # ajustar si el backend corre en otro puerto
pnpm dev
```

App: `http://localhost:3000`

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | URL pública del frontend | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL del backend (API) | `http://localhost:5300/api` |
| `BASEPATH` | Base path si se despliega en subdirectorio | — |

## Estructura del proyecto

```
client/src/
├── app/                    # App Router (solo rutas, pages delgados)
│   └── (dashboard)/        # Layout con sidebar para usuarios logueados
├── views/                  # Módulos de features (auto-contenidos)
│   ├── requirements/       # Asesor IA conversacional (flujo principal)
│   ├── builder/            # Armador de PCs con IA
│   ├── comparisons/        # Comparador de equipos con IA
│   ├── history/            # Historial de cotizaciones
│   ├── favorites/          # Favoritos (próximamente)
│   ├── companies/          # Admin: gestión de empresas
│   ├── scraping/           # Admin: ejecución y monitoreo de scraping
│   └── home/               # Landing / dashboard
├── components/             # Componentes globales compartidos
├── store/                  # Redux store + slices
├── hooks/                  # Hooks globales compartidos
├── utils/                  # Utilidades globales
├── configs/                # Configuración (tema, navegación, rutas)
├── @core/                  # Template core (no modificar)
├── @layouts/               # Layouts del template
└── @menu/                  # Navegación del template
```

## Flujos principales

### 1. Asesor IA (Nueva cotización)
Ruta: `/requirements`

Chat conversacional que pregunta:
1. Tipo de equipo (PC escritorio, laptop, armar PC)
2. Uso principal (gaming, programación, diseño, oficina, streaming, IA)
3. Presupuesto
4. Prioridad (rendimiento, precio, portabilidad)

Luego llama al backend que usa OpenAI para recomendar 3 opciones (económica, recomendada, mejor) con análisis técnico detallado.

### 2. Armador de PCs
Ruta: `/builder`

Selecciona uso + presupuesto + preferencia de marca → la IA genera una configuración completa con componentes compatibles, validación de compatibilidad, consumo eléctrico y opciones de upgrade.

### 3. Comparador de equipos
Ruta: `/comparisons`

Selecciona 2-3 productos del catálogo → la IA analiza specs, puntúa por categoría y recomienda el mejor según cada caso de uso.

### 4. Historial
Ruta: `/history`

Lista de cotizaciones anteriores con posibilidad de ver las recomendaciones generadas.

### 5. Exportar PDF
Disponible en el asesor (comparación) y el armador — genera un PDF descargable con la configuración o comparación completa.

## Tech stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI:** MUI 6 (Material UI) + Emotion + Tailwind CSS
- **Estado:** Redux Toolkit + RTK Query
- **PDF:** jsPDF + jspdf-autotable
- **Lenguaje:** JavaScript (JSX)

## Scripts

```bash
pnpm dev         # desarrollo con hot reload (Turbopack)
pnpm build       # build de producción
pnpm start       # servir build de producción
pnpm lint        # ESLint
pnpm lint:fix    # ESLint con auto-fix
```
