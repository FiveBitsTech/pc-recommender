'use client'

import styles from './SearchCriteria.module.css'

const DEVICE_LABELS = {
  laptop: 'Laptop',
  desktop: 'PC de escritorio',
  pc: 'PC de escritorio',
}

const PRIORITY_LABELS = {
  rendimiento: 'Rendimiento',
  precio: 'Mejor precio',
  portabilidad: 'Portabilidad',
  diseño: 'Diseño',
  durabilidad: 'Durabilidad',
}

const USAGE_ICONS = {
  gaming: 'ri-gamepad-line',
  oficina: 'ri-briefcase-line',
  'diseño gráfico': 'ri-palette-line',
  programación: 'ri-code-s-slash-line',
  estudio: 'ri-graduation-cap-line',
  streaming: 'ri-live-line',
}

const SearchCriteria = ({ requirement }) => {
  if (!requirement) return null

  const { usageType, budget, priority, deviceType, brandPreference } = requirement

  return (
    <div className={styles.criteriaWrapper}>
      <p className={styles.criteriaLabel}>Criterios de búsqueda</p>
      <div className={styles.chips}>
        {deviceType && (
          <span className={styles.chip}>
            <i className={deviceType === 'laptop' ? 'ri-macbook-line' : 'ri-computer-line'} />
            {DEVICE_LABELS[deviceType] || deviceType}
          </span>
        )}
        {usageType && (
          <span className={styles.chip}>
            <i className={USAGE_ICONS[usageType] || 'ri-apps-line'} />
            {usageType.charAt(0).toUpperCase() + usageType.slice(1)}
          </span>
        )}
        {budget && (
          <span className={styles.chip}>
            <i className='ri-money-dollar-circle-line' />
            S/ {Number(budget).toLocaleString('es-PE')}
          </span>
        )}
        {priority && (
          <span className={styles.chip}>
            <i className='ri-focus-3-line' />
            {PRIORITY_LABELS[priority] || priority}
          </span>
        )}
        {brandPreference && (
          <span className={styles.chip}>
            <i className='ri-building-line' />
            {brandPreference}
          </span>
        )}
      </div>
    </div>
  )
}

export default SearchCriteria
