'use client'

import { useState } from 'react'

import Slider from '@mui/material/Slider'

import styles from './BudgetSlider.module.css'

const BudgetSlider = ({ minBudget, onConfirm }) => {
  const min = minBudget || 1500
  const max = 12000

  const [range, setRange] = useState([Math.max(min, 3000), Math.max(min + 2000, 5000)])

  const handleSliderChange = (_, newValue) => {
    setRange(newValue)
  }

  const handleMinInput = (e) => {
    const val = parseInt(e.target.value.replace(/\D/g, ''), 10)

    if (!isNaN(val)) {
      setRange([Math.min(Math.max(val, min), range[1] - 500), range[1]])
    }
  }

  const handleMaxInput = (e) => {
    const val = parseInt(e.target.value.replace(/\D/g, ''), 10)

    if (!isNaN(val)) {
      setRange([range[0], Math.max(Math.min(val, max), range[0] + 500)])
    }
  }

  const handleConfirm = () => {
    // Send the max as the budget (backend uses it as maxPrice) and min is sent as context
    onConfirm(
      { budgetMin: range[0], budgetMax: range[1] },
      `S/ ${range[0].toLocaleString('es-PE')} — S/ ${range[1].toLocaleString('es-PE')}`,
    )
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>¿Cuál es tu rango de presupuesto?</p>
      <p className={styles.sublabel}>Buscaremos equipos dentro de este rango de precios</p>

      {/* Inputs row */}
      <div className={styles.rangeInputs}>
        <div className={styles.inputGroup}>
          <span className={styles.inputLabel}>Desde</span>
          <div className={styles.inputRow}>
            <span className={styles.currency}>S/</span>
            <input
              type='text'
              className={styles.input}
              value={range[0].toLocaleString('es-PE')}
              onChange={handleMinInput}
            />
          </div>
        </div>
        <div className={styles.inputSeparator}>—</div>
        <div className={styles.inputGroup}>
          <span className={styles.inputLabel}>Hasta</span>
          <div className={styles.inputRow}>
            <span className={styles.currency}>S/</span>
            <input
              type='text'
              className={styles.input}
              value={range[1].toLocaleString('es-PE')}
              onChange={handleMaxInput}
            />
          </div>
        </div>
      </div>

      {/* Range slider */}
      <div className={styles.sliderContainer}>
        <Slider
          value={range}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={100}
          valueLabelDisplay='auto'
          valueLabelFormat={(v) => `S/ ${v.toLocaleString('es-PE')}`}
          sx={{
            color: '#3d95ee',
            '& .MuiSlider-thumb': {
              width: 22,
              height: 22,
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(61, 149, 238, 0.4)',
            },
            '& .MuiSlider-track': { height: 8, borderRadius: 4 },
            '& .MuiSlider-rail': { height: 8, borderRadius: 4, bgcolor: '#e0e0e0' },
          }}
        />
        <div className={styles.sliderLabels}>
          <span>S/ {min.toLocaleString('es-PE')}</span>
          <span>S/ {max.toLocaleString('es-PE')}</span>
        </div>
      </div>

      {/* Confirm button */}
      <button className={styles.confirmButton} onClick={handleConfirm}>
        Confirmar presupuesto
        <i className='ri-arrow-right-line' />
      </button>
    </div>
  )
}

export default BudgetSlider
