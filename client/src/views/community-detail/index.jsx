'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'

import CircularProgress from '@mui/material/CircularProgress'

import { useGetRecommendationsByRequirementQuery, useGetRequirementByIdQuery } from '@/views/requirements/api/requirementApi'
import { useGetRecentRequirementsQuery } from '@/views/home/api/homeApi'
import AdvisorResults from '@/views/requirements/components/AdvisorResults'
import styles from './index.module.css'

const USAGE_ICONS = {
  gaming: 'ri-gamepad-line',
  oficina: 'ri-briefcase-line',
  'diseño gráfico': 'ri-palette-line',
  programación: 'ri-code-s-slash-line',
  estudio: 'ri-graduation-cap-line',
  streaming: 'ri-live-line',
}

const CommunityDetailPage = ({ params }) => {
  const { id } = use(params)
  const router = useRouter()

  const { data: recoData, isLoading: recoLoading } = useGetRecommendationsByRequirementQuery(id)
  const { data: requirementData } = useGetRequirementByIdQuery(id)
  const { data: recentData, isLoading: recentLoading } = useGetRecentRequirementsQuery()

  const recommendations = recoData?.items ?? []
  const requirement = requirementData ?? null
  const recentItems = (recentData?.items ?? []).filter((r) => String(r.id) !== String(id))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.outerCard}>
        <div className={styles.innerGradient}>
          {/* Grid overlay */}
          <div className={styles.contentWrapper}>
            {/* Header */}
            <div className={styles.header}>
              <button className={styles.backButton} onClick={() => router.push('/home')}>
                <i className='ri-arrow-left-line' />
                <span>Volver al inicio</span>
              </button>
              <div className={styles.headerInfo}>
                <img src='/images/icons/star-ai.svg' alt='AI' className={styles.headerIcon} />
                <div>
                  <h1 className={styles.headerTitle}>Resultados de la comunidad</h1>
                  <p className={styles.headerSubtitle}>Recomendaciones generadas por IA para esta búsqueda.</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className={styles.resultsContainer}>
              {recoLoading ? (
                <div className={styles.loadingWrapper}>
                  <CircularProgress size={36} />
                  <p className={styles.loadingText}>Cargando recomendaciones...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className={styles.emptyWrapper}>
                  <i className='ri-search-line' style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                  <p className={styles.emptyText}>No se encontraron recomendaciones para esta búsqueda.</p>
                  <button className={styles.ctaButton} onClick={() => router.push('/requirements')}>
                    <span>Hacer mi propia búsqueda</span>
                    <i className='ri-arrow-right-line' />
                  </button>
                </div>
              ) : (
                <AdvisorResults recommendations={recommendations} requirement={requirement} />
              )}
            </div>

            {/* Otras búsquedas */}
            {recentItems.length > 0 && (
              <div className={styles.otherSearches}>
                <div className={styles.otherHeader}>
                  <i className='ri-search-line' style={{ fontSize: '1.25rem', color: '#3d95ee' }} />
                  <p className={styles.otherTitle}>Otras búsquedas de la comunidad</p>
                </div>
                <div className={styles.otherGrid}>
                  {recentItems.slice(0, 6).map((req) => (
                    <div
                      key={req.id}
                      className={styles.otherCard}
                      onClick={() => router.push(`/community/${req.id}`)}
                    >
                      <div className={styles.otherCardIcon}>
                        <i className={USAGE_ICONS[req.usageType] || 'ri-computer-line'} />
                      </div>
                      <div className={styles.otherCardContent}>
                        <p className={styles.otherCardTitle}>
                          {req.deviceType === 'laptop' ? 'Laptop' : 'PC'} para {req.usageType}
                        </p>
                        <p className={styles.otherCardBudget}>
                          S/ {req.budget?.toLocaleString('es-PE')}
                        </p>
                      </div>
                      <i className='ri-arrow-right-s-line' style={{ color: '#3d95ee', fontSize: '1.25rem' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityDetailPage
