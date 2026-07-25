---
name: pc-cotiza-ui-stable-shell
description: >-
  UX anti-flicker en PC-Cotiza (pc-recommender): shell fijo de la vista, sin
  return null ni skeleton de página completa al refrescar. Usar al crear o
  tocar vistas dashboard (Empresas, Scraping, Administración, listados admin),
  loading states, auth gates, skeletons, isLoading/isFetching RTK Query, o
  cuando el usuario diga parpadeo, flicker, se oculta y vuelve, se siente
  cargado, performance de vistas.
---

# PC-Cotiza — shell estable (anti-flicker UX)

## Problema que resuelve

Al refrescar o montar una vista, el bloque principal (card con título, buscador, botones, empty state) **desaparece y vuelve a aparecer**. Se siente “cargado” aunque el chrome sea diseño fijo, no data.

Causas típicas:

1. `if (!ready || !isAdmin) return null` → pantalla vacía hasta hidratar auth.
2. Skeleton que **reemplaza toda la página/card** (título + toolbar + cuerpo).
3. Tratar `isLoading || isFetching` como “primera carga” → cada refetch vuelve a skeletonizar la UI.

## Regla de oro

**El shell (título, subtítulo, búsqueda, acciones, tabs, layout de la card) es diseño fijo: siempre montado.**  
Solo el **cuerpo de datos** cambia entre: skeleton de filas · empty state · tabla/grid.

## Checklist al implementar / revisar una vista

1. **Auth gate**
   - Usar cookie SSR `initialIsAdmin` vía `AuthUserProvider` (ya en dashboard layout).
   - `isAdmin` puede ser true **antes** de `ready` (cookie).
   - Preferir: `skip: !isAdmin` en queries (no `!ready || !isAdmin` si la cookie ya alcanza).
   - Redirect: `if (ready && !isAdmin) router.replace(...)`.
   - **No** hacer `if (!ready) return null` ni `if (!ready || !isAdmin) return null` en vistas admin.
   - Solo `if (ready && !isAdmin) return null` (mientras redirige).

2. **Shell siempre visible**
   - Card / header / filtros / botones / tabs se renderizan siempre (si el usuario puede ver la ruta).
   - No devolver `<PageSkeleton />` que reemplace título + toolbar.

3. **Loading solo en el cuerpo**
   - Primera carga sin datos: filas skeleton **dentro** de la card (bajo el header).
   - RTK: usar `isLoading` (primera fetch sin data), **no** `isLoading || isFetching` para decidir skeleton de cuerpo.
   - `isFetching` opcional: indicador sutil (“actualizando…”) sin desmontar UI.

4. **Empty state**
   - Empty state es parte del cuerpo, no un reemplazo de toda la vista.
   - Header y CTA principales del shell siguen visibles.

5. **Referencias en el repo**
   - Bien: `client/src/views/companies/index.jsx`
   - Bien: `client/src/views/scraping/index.jsx` (skeleton solo en cuerpo de fuentes)
   - Bien: `client/src/views/admin/index.jsx` (título fijo + paneles con skeleton interno)
   - Auth: `client/src/hooks/useAuthUser.js` + cookie `pc_cotiza_role` en layout dashboard

## Anti-patrones (evitar)

```jsx
// ❌ Vacía toda la vista al refrescar
if (!ready || !isAdmin) return null

// ❌ Skeleton de página: título y botones también parpadean
if (isLoading && total === 0) return <CompanySkeleton />

// ❌ Refetch = flicker
isLoading: isLoading || isFetching
```

## Patrón correcto (resumen)

```jsx
const { ready, isAdmin } = useAuthUser()
const client = useXxxClient({ skip: !isAdmin })

useEffect(() => {
  if (ready && !isAdmin) router.replace('/home')
}, [ready, isAdmin, router])

if (ready && !isAdmin) return null

return (
  <Card>
    {/* SHELL fijo */}
    <CardContent>…título, search, acciones…</CardContent>

    {/* CUERPO */}
    {client.isLoading ? (
      <BodyRowsSkeleton />
    ) : client.items.length === 0 ? (
      <EmptyState />
    ) : (
      <TableOrGrid />
    )}
  </Card>
)
```

En el hook RTK:

```js
const { data, isLoading, isFetching, error } = useQuery(..., { skip })
return {
  items: data?.items ?? [],
  isLoading,   // solo primera carga sin cache
  isFetching,  // opcional, no para desmontar shell
}
```

## Por qué importa para UX

- La interfaz se siente **instantánea** y estable.
- El usuario distingue “aún cargando filas” vs “la app se reinició”.
- Reduce percepción de lentitud sin cambiar el backend.
- Alineado con Materio: card estable, contenido progresivo.

## Cuándo aplicar esta skill

- Nueva vista de panel admin o listado.
- “Al refrescar se oculta y vuelve”, flicker, skeleton agresivo.
- Code review de `return null` + loading en `views/`.
- Optimización de performance percibida (no solo métricas de red).
