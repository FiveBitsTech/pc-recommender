'use client'

import { useState } from 'react'

import { useCompareProductsMutation } from '../api/requirementApi'
import generateComparisonPdf from '../utils/generateComparisonPdf'
import styles from './CompareBar.module.css'

const Stars = ({ score, max = 5 }) => {
  return (
    <>
      <span className={styles.stars}>
        {Array.from({ length: max }).map((_, i) => (
          <i key={i} className={i < score ? 'ri-star-fill' : 'ri-star-line'} />
        ))}
      </span>
      <span className={styles.starsNumber}>{score}/{max}</span>
    </>
  )
}

const CompareBar = ({ selectedProducts, onRemove, onClear, onCompareComplete, onBack, initialResult }) => {
  const [compareProducts, { isLoading }] = useCompareProductsMutation()
  const [result, setResult] = useState(initialResult || null)

  const canCompare = selectedProducts.length >= 2

  const handleCompare = async () => {
    if (!canCompare) return

    try {
      const res = await compareProducts({
        productIds: selectedProducts.map((r) => r.product.id),
      }).unwrap()

      setResult(res)

      if (onCompareComplete) onCompareComplete(res)
    } catch (err) {
      console.error(err)
    }
  }

  const handleBackTab = () => {
    if (onBack) onBack()
  }

  const p1Name = selectedProducts[0]?.product?.name || 'Producto 1'
  const p2Name = selectedProducts[1]?.product?.name || 'Producto 2'
  const p3Name = selectedProducts[2]?.product?.name || null
  const hasThree = selectedProducts.length === 3

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <i className='ri-scales-3-line' style={{ fontSize: '1.5rem', color: '#3d95ee' }} />
          <div>
            <p className={styles.headerTitle}>Comparar equipos</p>
            <p className={styles.headerSubtitle}>
              {canCompare ? `${selectedProducts.length} equipos seleccionados` : `Selecciona al menos 2 equipos (${selectedProducts.length}/3)`}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {canCompare && !result && (
            <button className={styles.compareButton} onClick={handleCompare} disabled={isLoading}>
              {isLoading ? 'Analizando...' : 'Comparar con IA'}
              <i className='ri-sparkling-line' />
            </button>
          )}
          {result && (
            <>
              <button className={styles.closeButton} onClick={handleBackTab}>
                <i className='ri-arrow-left-line' />
                Volver
              </button>
              <button className={styles.compareButton} onClick={() => generateComparisonPdf(result, selectedProducts)}>
                Descargar PDF
                <i className='ri-download-line' />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chips */}
      {!result && (
        <div className={styles.chips}>
          {selectedProducts.map((rec) => (
            <div key={rec.id} className={styles.chip}>
              <span>{rec.product?.name}</span>
              <button onClick={() => onRemove(rec)} className={styles.chipRemove}>
                <i className='ri-close-line' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={styles.resultSection}>
          {/* Recommendation card */}
          {result.recommendation && (
            <div className={styles.recoCard}>
              <div className={styles.recoHeader}>
                <div className={styles.recoScore}>{result.recommendation.score}<span>/100</span></div>
                <div>
                  <p className={styles.recoLabel}>Nuestra recomendación para ti</p>
                  <p className={styles.recoName}>{result.recommendation.productName}</p>
                  {(() => {
                    const match = selectedProducts.find((r) => r.product?.name === result.recommendation.productName)

                    return match?.product?.company ? (
                      <p className={styles.recoCompany}><i className='ri-store-2-line' /> {match.product.company.name}</p>
                    ) : null
                  })()}
                </div>
              </div>
              <div className={styles.recoReasons}>
                {result.recommendation.keyReasons?.map((r, i) => (
                  <div key={i} className={styles.recoReason}>
                    <i className='ri-checkbox-circle-fill' />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
              {result.recommendation.tradeoffs?.length > 0 && (
                <div className={styles.recoTradeoffs}>
                  <p className={styles.tradeoffLabel}>Lo que sacrificas:</p>
                  {result.recommendation.tradeoffs.map((t, i) => (
                    <span key={i} className={styles.tradeoffItem}>• {t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick summary */}
          {result.summary?.length > 0 && (
            <div className={styles.summarySection}>
              <p className={styles.summaryTitle}>En pocas palabras</p>
              <div className={styles.summaryGrid}>
                {result.summary.map((s, i) => (
                  <div key={i} className={styles.summaryItem}>
                    <span className={styles.summaryIcon}>{s.icon}</span>
                    <span className={styles.summaryUse}>{s.useCase}:</span>
                    <span className={styles.summaryProduct}>{s.bestProduct}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specs table */}
          {result.specs_comparison?.length > 0 && (
            <div className={styles.specsSection}>
              {/* Desktop: grid table */}
              <div className={styles.specsDesktop}>
                <div className={`${styles.specsTableHeader} ${hasThree ? styles.threeColumns : ''}`}>
                  <span>Característica</span>
                  <span>{p1Name}</span>
                  <span>{p2Name}</span>
                  {hasThree && <span>{p3Name}</span>}
                </div>
                {result.specs_comparison.map((spec, i) => (
                  <div key={i} className={`${styles.specsTableRow} ${hasThree ? styles.threeColumns : ''}`}>
                    <span className={styles.specCat}>{spec.category}</span>
                    <span className={spec.winner === 'product1' ? styles.specWin : styles.specNormal}>
                      {spec.winner === 'product1' && '⭐ '}{spec.product1}
                    </span>
                    <span className={spec.winner === 'product2' ? styles.specWin : styles.specNormal}>
                      {spec.winner === 'product2' && '⭐ '}{spec.product2}
                    </span>
                    {hasThree && (
                      <span className={spec.winner === 'product3' ? styles.specWin : styles.specNormal}>
                        {spec.winner === 'product3' && '⭐ '}{spec.product3}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* Mobile: list cards */}
              <div className={styles.specsMobile}>
                {result.specs_comparison.map((spec, i) => (
                  <div key={i} className={styles.specCard}>
                    <p className={styles.specCardTitle}>{spec.category}</p>
                    <div className={styles.specCardItems}>
                      <div className={`${styles.specCardItem} ${spec.winner === 'product1' ? styles.specCardWinner : ''}`}>
                        <span className={styles.specCardLabel}>{p1Name}</span>
                        <span className={styles.specCardValue}>{spec.product1}</span>
                      </div>
                      <div className={`${styles.specCardItem} ${spec.winner === 'product2' ? styles.specCardWinner : ''}`}>
                        <span className={styles.specCardLabel}>{p2Name}</span>
                        <span className={styles.specCardValue}>{spec.product2}</span>
                      </div>
                      {hasThree && (
                        <div className={`${styles.specCardItem} ${spec.winner === 'product3' ? styles.specCardWinner : ''}`}>
                          <span className={styles.specCardLabel}>{p3Name}</span>
                          <span className={styles.specCardValue}>{spec.product3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ratings */}
          {result.ratings?.length > 0 && (
            <div className={styles.ratingsSection}>
              <p className={styles.ratingsTitle}>Puntuaciones por categoría</p>
              {/* Desktop: grid table */}
              <div className={styles.ratingsDesktop}>
                <div className={styles.ratingsGrid}>
                  <div className={`${styles.ratingsHeader} ${hasThree ? styles.threeColumnsRatings : ''}`}>
                    <span />
                    <span>{p1Name}</span>
                    <span>{p2Name}</span>
                    {hasThree && <span>{p3Name}</span>}
                  </div>
                  {result.ratings.map((r, i) => (
                    <div key={i} className={`${styles.ratingsRow} ${hasThree ? styles.threeColumnsRatings : ''}`}>
                      <span className={styles.ratingLabel}>{r.category}</span>
                      <span><Stars score={r.product1Score} /></span>
                      <span><Stars score={r.product2Score} /></span>
                      {hasThree && <span><Stars score={r.product3Score || 0} /></span>}
                    </div>
                  ))}
                </div>
              </div>
              {/* Mobile: list cards */}
              <div className={styles.ratingsMobile}>
                {result.ratings.map((r, i) => (
                  <div key={i} className={styles.ratingCard}>
                    <p className={styles.ratingCardTitle}>{r.category}</p>
                    <div className={styles.ratingCardItems}>
                      <div className={styles.ratingCardItem}>
                        <span className={styles.ratingCardLabel}>{p1Name}</span>
                        <span><Stars score={r.product1Score} /></span>
                      </div>
                      <div className={styles.ratingCardItem}>
                        <span className={styles.ratingCardLabel}>{p2Name}</span>
                        <span><Stars score={r.product2Score} /></span>
                      </div>
                      {hasThree && (
                        <div className={styles.ratingCardItem}>
                          <span className={styles.ratingCardLabel}>{p3Name}</span>
                          <span><Stars score={r.product3Score || 0} /></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CompareBar
