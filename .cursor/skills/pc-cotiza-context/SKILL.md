---
name: pc-cotiza-context
description: >-
  Contexto de negocio PC-Cotiza IA (hackathon): cotización guiada y recomendación
  neutral de PCs/componentes. Usar al implementar features, APIs, UI o reglas del
  producto en pc-recommender.
---

# PC-Cotiza IA — contexto de producto

## Qué es

Plataforma web de cotización **guiada** (no chat abierto) y **neutral** de computadoras completas o componentes, basada en inventario verificable de tiendas.

## Problema

El comprador pide una config por presupuesto; la tienda vende con su stock sin demostrar adecuación al uso. Hay asimetría de información y desconfianza.

## Flujo principal (CU-01)

1. Usuario indica: **qué busca** + **para qué** + **presupuesto** (obligatorio).
2. IA solo pide aclaraciones indispensables; rechaza temas ajenos.
3. Sistema consulta inventarios de tiendas habilitadas.
4. Cada alternativa usa inventario de **una sola tienda**.
5. Valida compatibilidad y suficiencia para el uso.
6. Entrega tres niveles:
   - **Económica adecuada** — cumple mínimo de uso (no “la más barata”).
   - **Recomendada** — equilibrio uso/costo/rendimiento/vida útil.
   - **Mejor opción** — máximo rendimiento/mejora dentro del presupuesto.
7. Explica ventajas, desventajas, límites, upgrade + fuentes/precios/vigencia.

## Reglas críticas

- RN-01: tres datos obligatorios al iniciar.
- RN-03: presupuesto = límite (solo se pasa con autorización).
- RN-04/05/06: tres niveles con significado distinto.
- RN-07: si no hay config viable, no forzar; proponer ajustes.
- RN-08: una tienda por alternativa; sin incompatibilidades críticas.
- RN-10: IA interpreta/explica; datos y reglas validan precios/stock/compatibilidad.
- RN-12: proveedores no controlan el ranking.

## Actores

Comprador · usuario técnico · proveedor/tienda · administrador.

## Stack del repo

- `client/` — Next.js + MUI (Materio)
- `server/` — NestJS + Prisma + PostgreSQL (capas application/domain/infrastructure/presentation)
- Tooling: **pnpm**

## Fuera de alcance inmediato del scraping

Motor de cotización / Bedrock / portal proveedor — no mezclar en el módulo de scraping.
