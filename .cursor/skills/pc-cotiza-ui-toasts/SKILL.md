---
name: pc-cotiza-ui-toasts
description: >-
  Reglas de toasts/notifies en PC-Cotiza (pc-recommender). Usar al mostrar
  feedback con notificationSuccesMessage, notificationErrorMessage o toastify.
---

# PC-Cotiza — toasts / notifies

## Regla (verbatim)

Jamás un notify puede tener un texto muy muy largo todo lo que aparezca será en una sola línea.

## Cómo aplicarlo

- Éxito: frase corta, p. ej. `Catálogo limpiado`, `Producto eliminado`, `Scraping OK · 12 productos`.
- Error: mensaje breve; si el backend manda array/largo, condensar a una línea.
- Nunca listar muchas métricas, tablas ni párrafos en el toast.
- Detalle (conteos por tabla, stack, etc.) va en la vista: dialog, alert o panel — no en el notify.

## Helpers

`client/src/components/ToastNotification.js` — `notificationSuccesMessage`, `notificationErrorMessage`, etc. Ya normalizan a una línea y truncan.
