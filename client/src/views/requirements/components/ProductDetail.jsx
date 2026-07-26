'use client'

import styles from './ProductDetail.module.css'

const ProductDetail = ({ recommendation, onClose }) => {
  if (!recommendation) return null

  const { product, reason, advantages, disadvantages, limitations, upgradeOptions } = recommendation

  const specs = product?.specs

  const specRows = specs
    ? [
        { label: 'Procesador', value: specs.processor },
        { label: 'RAM', value: specs.ram },
        { label: 'Gráficos', value: specs.gpu },
        { label: 'Pantalla', value: specs.screen },
        { label: 'Almacenamiento', value: specs.storage },
        { label: 'Sistema Operativo', value: specs.operatingSystem },
      ].filter((r) => r.value && r.value !== 'N/A')
    : []

  return (
    <div className={styles.detailWrapper}>
      {/* Separator */}
      <div className={styles.separator} />

      {/* Reason section */}
      <div className={styles.reasonSection}>
        <img src='/images/icons/star-ai.svg' alt='AI' className={styles.sectionIcon} />
        <div>
          <p className={styles.sectionTitle}>¿Por qué recomendamos esta opción?</p>
          <p className={styles.sectionText}>{reason || 'Análisis no disponible.'}</p>
        </div>
      </div>

      {/* Separator */}
      <div className={styles.separator} />

      {/* Advantages & Disadvantages */}
      {(advantages?.length > 0 || disadvantages?.length > 0) && (
        <div className={styles.twoColumns}>
          {advantages?.length > 0 && (
            <div className={styles.column}>
              <p className={styles.columnTitle}>Ventajas</p>
              <p className={styles.columnSubtitle}>Puntos fuertes de este equipo</p>
              <div className={styles.checkList}>
                {advantages.map((item, i) => (
                  <div key={i} className={styles.checkItem}>
                    <i className='ri-checkbox-circle-fill' style={{ color: '#2faab9' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {disadvantages?.length > 0 && (
            <div className={styles.column}>
              <p className={styles.columnTitle}>Desventajas</p>
              <p className={styles.columnSubtitle}>Restricciones a tener en cuenta</p>
              <div className={styles.checkList}>
                {disadvantages.map((item, i) => (
                  <div key={i} className={styles.checkItem}>
                    <i className='ri-close-circle-fill' style={{ color: '#e65100' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Limitations & Upgrades */}
      {(limitations?.length > 0 || upgradeOptions?.length > 0) && (
        <div className={styles.twoColumns}>
          {limitations?.length > 0 && (
            <div className={styles.column}>
              <p className={styles.columnTitle}>Limitaciones técnicas</p>
              <p className={styles.columnSubtitle}>Restricciones a tener en cuenta para el futuro</p>
              <div className={styles.checkList}>
                {limitations.map((item, i) => (
                  <div key={i} className={styles.checkItem}>
                    <i className='ri-error-warning-fill' style={{ color: '#ff9800' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {upgradeOptions?.length > 0 && (
            <div className={styles.column}>
              <p className={styles.columnTitle}>Mejoras futuras posibles</p>
              <p className={styles.columnSubtitle}>Componentes que puedes actualizar después</p>
              <div className={styles.checkList}>
                {upgradeOptions.map((item, i) => (
                  <div key={i} className={styles.checkItem}>
                    <i className='ri-arrow-up-circle-fill' style={{ color: '#3d95ee' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Specs table */}
      {specRows.length > 0 && (
        <div className={styles.specsSection}>
          <p className={styles.columnTitle}>Especificaciones completas</p>
          <p className={styles.columnSubtitle}>Detalles técnicos del equipo</p>
          <div className={styles.specsTable}>
            <div className={styles.specsHeader}>
              <span>Campo</span>
              <span>Valor</span>
            </div>
            {specRows.map((row) => (
              <div key={row.label} className={styles.specsRow}>
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actionsSection}>
        <div className={styles.actionsInfo}>
          <img src='/images/icons/star-ai.svg' alt='AI' className={styles.sectionIcon} />
          <div>
            <p className={styles.sectionText}>Si deseas ver la tienda, aquí tienes.</p>
            <p className={styles.columnSubtitle}>Puedes ver todos los detalles de tu computadora.</p>
          </div>
        </div>
        <div className={styles.actionsButtons}>
          {product?.productUrl && (
            <a href={product.productUrl} target='_blank' rel='noopener noreferrer' className={styles.primaryButton}>
              Ver en la tienda
              <i className='ri-external-link-line' />
            </a>
          )}
          <button className={styles.secondaryButton} onClick={onClose}>
            Cerrar detalle
            <i className='ri-close-line' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
