/**
 * Steps configuration for the guided requirement form.
 */

export const USAGE_OPTIONS = [
  { value: 'oficina', label: 'Trabajo y oficina', icon: 'ri-briefcase-line' },
  { value: 'programación', label: 'Programación', icon: 'ri-code-s-slash-line' },
  { value: 'diseño gráfico', label: 'Diseño y edición', icon: 'ri-palette-line' },
  { value: 'gaming', label: 'Gaming', icon: 'ri-gamepad-line' },
  { value: 'profesional', label: 'Uso profesional', icon: 'ri-building-line', description: 'CAD, ingeniería, IA, etc.' },
  { value: 'estudio', label: 'Estudio', icon: 'ri-graduation-cap-line' },
  { value: 'streaming', label: 'Streaming / Contenido', icon: 'ri-live-line' },
]

export const PROGRAMMING_SUBOPTIONS = [
  { value: 'web', label: 'Desarrollo web' },
  { value: 'mobile', label: 'Aplicaciones móviles' },
  { value: 'backend', label: 'Backend / servidores' },
  { value: 'ia', label: 'Inteligencia artificial' },
  { value: 'otro', label: 'Otro' },
]

export const DESIGN_SUBOPTIONS = [
  { value: 'grafico', label: 'Diseño gráfico' },
  { value: 'video', label: 'Edición de video' },
  { value: '3d', label: 'Modelado 3D' },
  { value: 'fotografia', label: 'Fotografía / retoque' },
  { value: 'otro', label: 'Otro' },
]

export const DEVICE_OPTIONS = [
  { value: 'desktop', label: 'PC completa', icon: 'ri-computer-line', description: 'Escritorio armada o ensamblada' },
  { value: 'laptop', label: 'Laptop', icon: 'ri-macbook-line', description: 'Portátil para llevar a cualquier lugar' },
  { value: 'componente', label: 'Componente individual', icon: 'ri-cpu-line', description: 'Solo una pieza específica' },
]

export const PRIORITY_OPTIONS = [
  { value: 'precio', label: 'Menor precio', icon: 'ri-money-dollar-circle-line' },
  { value: 'rendimiento', label: 'Mejor rendimiento', icon: 'ri-speed-line' },
  { value: 'durabilidad', label: 'Mayor duración', icon: 'ri-shield-check-line' },
  { value: 'upgradeable', label: 'Posibilidad de actualizar', icon: 'ri-arrow-up-circle-line' },
]

export const STEPPER_LABELS = [
  { label: '¿Qué buscas?', icon: 'ri-search-line' },
  { label: '¿Para qué la usarás?', icon: 'ri-question-line' },
  { label: '¿Cuál es tu presupuesto?', icon: 'ri-money-dollar-circle-line' },
  { label: 'Resultados', icon: 'ri-sparkling-line' },
]

export const ANALYSIS_STEPS = [
  'Interpretando tu necesidad',
  'Revisando equipos disponibles',
  'Validando compatibilidad',
  'Comparando precios',
  'Generando mejores opciones',
]
