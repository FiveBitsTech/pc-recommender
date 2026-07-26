'use client'

import { useState } from 'react'

import ProductDetail from './ProductDetail'
import CompareBar from './CompareBar'
import styles from './AdvisorResults.module.css'

const AdvisorResults = ({ recommendations, onViewDetail }) => {
  const [selectedRec, setSelectedRec] = useState(null)
  const [compareList, setCompareList] = useState([])
  const [activeTab, setActiveTab] = useState('recommendations')
  const [compareResult, setCompareResult] = useState(null)

  if (!recommendations || recommendations.length === 0) return null

  const toggleCompare = (rec) => {
    setCompareList((prev) => {
      const exists = prev.find((r) => r.id === rec.id)

      if (exists) return prev.filter((r) => r.id !== rec.id)
      if (prev.length >= 3) return prev

      return [...prev, rec]
    })
  }

  const handleCompareComplete = (result) => {
    setCompareResult(result)
    setActiveTab('comparison')
  }

  const handleBackToRecommendations = () => {
    setActiveTab('recommendations')
  }

  return (
    <div className={styles.resultsWrapper}>
      {/* Tabs */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'recommendations' ? styles.tabActive : ''}`}
          onClick={handleBackToRecommendations}
        >
          <i className='ri-sparkling-line' />
          Recomendaciones
        </button>
        {compareResult && (
          <button
            className={`${styles.tab} ${activeTab === 'comparison' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            <i className='ri-scales-3-line' />
            Comparación
          </button>
        )}
      </div>

      {/* Tab: Recommendations */}
      {activeTab === 'recommendations' && (
        <>
          {/* Header */}
          <div className={styles.resultsHeader}>
            <img src='/images/icons/star-ai.svg' alt='AI' className={styles.headerIcon} />
            <div>
              <p className={styles.headerTitle}>Opciones recomendadas para ti</p>
              <p className={styles.headerSubtitle}>Todas las opciones están 100% verificadas.</p>
            </div>
          </div>

          {/* Compare action — visible when products selected */}
          {compareList.length > 0 && (
            compareResult ? (
              <button
                className={styles.viewCompareButton}
                onClick={() => setActiveTab('comparison')}
              >
                <i className='ri-scales-3-line' />
                Ver comparación
              </button>
            ) : (
              <CompareBar
                selectedProducts={compareList}
                onRemove={(rec) => setCompareList((prev) => prev.filter((r) => r.id !== rec.id))}
                onClear={() => setCompareList([])}
                onCompareComplete={handleCompareComplete}
              />
            )
          )}

          {/* Product cards */}
          <div className={styles.cardsGrid}>
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={rec.id || index} className={styles.productCard} data-selected={selectedRec?.id === rec.id ? 'true' : 'false'}>
                {/* Image placeholder */}
                <div className={styles.productImage}>
                  {rec.product?.imageUrl ? (
                    <img src={rec.product.imageUrl} alt={rec.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <i
                      className={rec.product?.category === 'laptop' ? 'ri-macbook-line' : 'ri-computer-line'}
                      style={{ fontSize: '3rem', opacity: 0.3 }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className={styles.productInfo}>
                  {/* Price + Name */}
                  <div className={styles.productHeader}>
                    <p className={styles.productPrice}>
                      S/ {rec.product?.price?.toLocaleString('es-PE') || '---'}
                    </p>
                    <p className={styles.productName}>{rec.product?.name || 'Producto'}</p>
                    {rec.product?.company && (
                      <p className={styles.productCompany}>
                        <i className='ri-store-2-line' />
                        {rec.product.company.name}
                      </p>
                    )}
                  </div>

                  {/* Specs */}
                  {rec.product?.specs && (
                    <div className={styles.productSpecs}>
                      {rec.product.specs.processor && (
                        <div className={styles.specRow}>
                          <i className='ri-cpu-line' />
                          <span>{rec.product.specs.processor}</span>
                        </div>
                      )}
                      {rec.product.specs.ram && (
                        <div className={styles.specRow}>
                          <i className='ri-sd-card-line' />
                          <span>{rec.product.specs.ram}</span>
                        </div>
                      )}
                      {rec.product.specs.screen && rec.product.specs.screen !== 'N/A' && (
                        <div className={styles.specRow}>
                          <i className='ri-monitor-line' />
                          <span>{rec.product.specs.screen}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI reason */}
                  {rec.reason && (
                    <p className={styles.productReason}>{rec.reason}</p>
                  )}

                  {/* Action button */}
                  <button className={styles.detailButton} data-active={selectedRec?.id === rec.id ? 'true' : 'false'} onClick={() => setSelectedRec(selectedRec?.id === rec.id ? null : rec)}>
                    {selectedRec?.id === rec.id ? 'Cerrar detalles' : 'Ver detalles'}
                    <i className={selectedRec?.id === rec.id ? 'ri-arrow-up-line' : 'ri-arrow-right-line'} />
                  </button>
                </div>

                {/* Badge */}
                <div className={styles.badge} data-tier={index}>
                  <i className={index === 0 ? 'ri-leaf-line' : index === 1 ? 'ri-checkbox-circle-line' : 'ri-vip-crown-line'} />
                  <span>{index === 0 ? 'Económica' : index === 1 ? 'Recomendada' : 'Mejor opción'}</span>
                </div>

                {/* Compare checkbox */}
                <label className={styles.compareCheck} onClick={(e) => e.stopPropagation()}>
                  <input
                    type='checkbox'
                    checked={compareList.some((r) => r.id === rec.id)}
                    onChange={() => toggleCompare(rec)}
                  />
                  <span>Comparar</span>
                </label>
              </div>
            ))}
          </div>

          {/* Product detail */}
          {selectedRec && (
            <ProductDetail recommendation={selectedRec} onClose={() => setSelectedRec(null)} />
          )}
        </>
      )}

      {/* Tab: Comparison */}
      {activeTab === 'comparison' && compareResult && (
        <CompareBar
          selectedProducts={compareList}
          onRemove={(rec) => setCompareList((prev) => prev.filter((r) => r.id !== rec.id))}
          onClear={() => { setCompareList([]); setCompareResult(null); setActiveTab('recommendations') }}
          onBack={handleBackToRecommendations}
          initialResult={compareResult}
        />
      )}
    </div>
  )
}

export default AdvisorResults
