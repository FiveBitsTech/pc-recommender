'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import styles from './BuildResult.module.css'

const Stars = ({ score, max = 5 }) => (
  <span className={styles.stars}>
    {Array.from({ length: max }).map((_, i) => (
      <i key={i} className={i < score ? 'ri-star-fill' : 'ri-star-line'} />
    ))}
  </span>
)

const BuildResult = ({ result }) => {
  if (!result) return null

  const { components, totalPrice, summary, compatibility, warnings, performance, powerConsumption, futureUpgrades, explanation } = result

  const handleDownload = () => {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PC COTIZA-IA - Configuracion armada', 14, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-PE')}`, 14, 28)
    doc.text(`Total: S/ ${totalPrice?.toLocaleString('es-PE')}`, 14, 35)

    doc.setTextColor(0)

    if (explanation) {
      doc.setFontSize(11)
      doc.text(explanation, 14, 45, { maxWidth: 180 })
    }

    const head = [['Componente', 'Modelo', 'Gama', 'Precio']]

    const body = (components || []).map((c) => [c.category, `${c.name} (${c.brand})`, c.tier || '-', `S/ ${c.price?.toLocaleString('es-PE')}`])

    autoTable(doc, { startY: 55, head, body, headStyles: { fillColor: [61, 149, 238] }, styles: { fontSize: 9 } })

    let y = doc.lastAutoTable?.finalY + 15 || 120

    if (performance?.capabilities?.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Con esta PC podras:', 14, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      performance.capabilities.forEach((c) => { doc.text(`- ${c}`, 18, y); y += 6 })
    }

    if (futureUpgrades?.length > 0) {
      y += 8
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Mejoras futuras:', 14, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      futureUpgrades.forEach((u) => { doc.text(`- ${u}`, 18, y); y += 6 })
    }

    const pageHeight = doc.internal.pageSize.height

    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('PC COTIZA-IA | Asesor inteligente de tecnologia', 14, pageHeight - 10)

    doc.save('configuracion-pc-cotiza.pdf')
  }

  return (
    <div className={styles.wrapper}>
      {/* Summary card */}
      {summary && (
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div className={styles.summaryScore}>
              {summary.compatibilityScore || 100}<span>%</span>
            </div>
            <div>
              <p className={styles.summaryLabel}>Configuración recomendada</p>
              <p className={styles.summaryLevel}>
                <i className='ri-cpu-line' /> {summary.level} • S/ {totalPrice?.toLocaleString('es-PE')}
              </p>
            </div>
          </div>
          {explanation && <p className={styles.summaryExplanation}>{explanation}</p>}
          {summary.whyThisConfig?.length > 0 && (
            <div className={styles.whyList}>
              {summary.whyThisConfig.map((w, i) => (
                <div key={i} className={styles.whyItem}>
                  <i className='ri-checkbox-circle-fill' />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {warnings?.length > 0 && (
        <div className={styles.warningsCard}>
          <p className={styles.sectionTitle}><i className='ri-error-warning-fill' /> Advertencias</p>
          {warnings.map((w, i) => (
            <p key={i} className={styles.warningText}>{w}</p>
          ))}
        </div>
      )}

      {/* Performance ratings + capabilities */}
      {performance && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Rendimiento esperado</p>
          {performance.ratings?.length > 0 && (
            <div className={styles.ratingsGrid}>
              {performance.ratings.map((r, i) => (
                <div key={i} className={styles.ratingRow}>
                  <span className={styles.ratingLabel}>{r.category}</span>
                  <Stars score={r.score} />
                </div>
              ))}
            </div>
          )}
          {performance.capabilities?.length > 0 && (
            <div className={styles.capList}>
              <p className={styles.capTitle}>Con esta PC podrás:</p>
              {performance.capabilities.map((c, i) => (
                <div key={i} className={styles.capItem}>
                  <i className='ri-check-line' />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Components table */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Componentes seleccionados</p>
        <div className={styles.componentsTable}>
          {components?.map((comp, i) => (
            <div key={i} className={styles.componentRow}>
              <div className={styles.componentLeft}>
                <span className={styles.componentCategory}>{comp.category}</span>
                <span className={styles.componentTier}>{comp.tier}</span>
              </div>
              <div className={styles.componentMiddle}>
                <p className={styles.componentName}>{comp.name}</p>
                <p className={styles.componentReason}>{comp.reason}</p>
                {comp.companyName && (
                  <p className={styles.componentCompany}>
                    <i className='ri-store-2-line' /> {comp.companyName}
                    {comp.productUrl && (
                      <a href={comp.productUrl} target='_blank' rel='noopener noreferrer' className={styles.componentLink}>
                        Ver producto <i className='ri-external-link-line' />
                      </a>
                    )}
                  </p>
                )}
              </div>
              <div className={styles.componentRight}>
                <span className={styles.componentPrice}>S/ {comp.price?.toLocaleString('es-PE')}</span>
                <span className={styles.componentSource}>{comp.source === 'database' ? 'Precio real' : ''}</span>
              </div>
            </div>
          ))}
          <div className={styles.totalRow}>
            <span>TOTAL</span>
            <span>S/ {totalPrice?.toLocaleString('es-PE')}</span>
          </div>
        </div>
      </div>

      {/* Power consumption */}
      {powerConsumption && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Consumo energético</p>
          <div className={styles.powerGrid}>
            <div className={styles.powerItem}>
              <span className={styles.powerValue}>{powerConsumption.estimated}W</span>
              <span className={styles.powerLabel}>Consumo estimado</span>
            </div>
            <div className={styles.powerItem}>
              <span className={styles.powerValue}>{powerConsumption.recommended}W</span>
              <span className={styles.powerLabel}>Fuente recomendada</span>
            </div>
            <div className={styles.powerItem}>
              <span className={styles.powerValue}>{powerConsumption.margin}W</span>
              <span className={styles.powerLabel}>Margen disponible</span>
            </div>
          </div>
        </div>
      )}

      {/* Compatibility */}
      {compatibility?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Compatibilidad</p>
          <div className={styles.compatList}>
            {compatibility.map((c, i) => (
              <div key={i} className={styles.compatItem} data-status={c.status || 'ok'}>
                <i className={c.status === 'warning' ? 'ri-alert-fill' : c.status === 'error' ? 'ri-close-circle-fill' : 'ri-checkbox-circle-fill'} />
                <span>{c.check || c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future upgrades */}
      {futureUpgrades?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Mejoras futuras</p>
          <div className={styles.upgradeList}>
            {futureUpgrades.map((u, i) => (
              <div key={i} className={styles.upgradeItem}>
                <i className='ri-arrow-right-circle-line' />
                <span>{u}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Download button */}
      <button className={styles.downloadButton} onClick={handleDownload}>
        <i className='ri-download-line' />
        Descargar configuración (PDF)
      </button>
    </div>
  )
}

export default BuildResult
