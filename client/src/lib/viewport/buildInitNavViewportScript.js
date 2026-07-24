/** Breakpoint `lg` de Materio (`defaultBreakpoints.lg` = 1200px). */
export const NAV_VIEWPORT_BREAKPOINT_PX = 1200

/** Corre beforeInteractive: fija viewport antes del primer paint (anti-flicker del sidebar). */
export const buildInitNavViewportScript = () =>
  `(function(){try{var m=window.matchMedia('(max-width:${NAV_VIEWPORT_BREAKPOINT_PX - 1}px)').matches;document.documentElement.setAttribute('data-nav-viewport',m?'mobile':'desktop')}catch(e){}})();`
