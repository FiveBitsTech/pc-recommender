'use client'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import { useGetRecentRequirementsQuery } from './api/homeApi'
import styles from './index.module.css'

const FEATURES = [
  { image: '/images/features/asesor-ia.svg', title: 'Asesor IA', description: 'Recomendaciones adaptadas a tu presupuesto y necesidades.' },
  { image: '/images/features/comparador.svg', title: 'Comparador', description: 'Compara equipos técnicamente lado a lado con IA.' },
  { image: '/images/features/armador-pc.svg', title: 'Armador de PC', description: 'Genera configuraciones con componentes compatibles.' },
  { image: '/images/features/sin-sobreprecios.svg', title: 'Sin sobreprecios', description: 'Detectamos precios inflados para que no pagues de más.' },
]

const USAGE_ICONS = {
  gaming: 'ri-gamepad-line',
  oficina: 'ri-briefcase-line',
  'diseño gráfico': 'ri-palette-line',
  programación: 'ri-code-s-slash-line',
  estudio: 'ri-graduation-cap-line',
  streaming: 'ri-live-line',
}

const HomePage = () => {
  const router = useRouter()
  const { data: recentData, isLoading } = useGetRecentRequirementsQuery()

  const recentItems = recentData?.items ?? []

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Card — white card with shadow */}
      <div className={styles.heroCard}>
        {/* Inner gradient with grid pattern */}
        <section className={styles.heroInner}>
          {/* Welcome row */}
          <div className={styles.welcomeRow}>
            <span className={styles.welcomeText}>TE DAMOS LA BIENVENIDA A</span>
            <span className={styles.brandText}>PC COTIZA-IA</span>
          </div>

          {/* Main title */}
          <h1 className={styles.heroTitle}>
            ¿NO SABES QUÉ PC COMPRAR?
          </h1>

          {/* Subtitle */}
          <p className={styles.heroSubtitle}>
            Encuentra la mejor opción para ti en pocos minutos y sin conocimientos técnicos.
          </p>

          {/* Feature cards — tilted */}
          <div className={styles.cardsRow}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <img src={f.image} alt={f.title} />
                </div>
                <div>
                  <p className={styles.featureCardTitle}>{f.title}</p>
                  <p className={styles.featureCardDescription}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button — gradient */}
          <a className={styles.ctaButton} onClick={() => router.push('/requirements')}>
            <span className={styles.ctaIconWrapper}>
              <i className='ri-arrow-right-line' style={{ fontSize: '1.25rem', color: '#3d95ee' }} />
            </span>
            <span className={styles.ctaText}>Empezar Ahora</span>
          </a>
        </section>

        {/* Community Searches Section — inside the card */}
        <section className={styles.communitySection}>
          <div className={styles.communityHeader}>
            <img src='/images/icons/star-ai.svg' alt='AI' className={styles.communityIcon} />
            <div>
              <h2 className={styles.communityTitle}>Búsquedas de la comunidad</h2>
              <p className={styles.communitySubtitle}>
                Conoce las recomendaciones que ayudaron a otros usuarios a elegir su computadora.
              </p>
            </div>
          </div>

          <div className={styles.communityDivider} />

          {isLoading ? (
            <div className={styles.communityLoading}>
              <CircularProgress size={28} />
            </div>
          ) : recentItems.length === 0 ? (
            <p className={styles.communityEmpty}>
              Aún no hay búsquedas. Sé el primero en usar el asesor IA.
            </p>
          ) : (
            <div className={styles.communityGrid}>
              {recentItems.map((req) => (
                <div key={req.id} className={styles.communityCard} onClick={() => router.push('/requirements')}>
                  <div className={styles.communityCardIcon}>
                    <i className={USAGE_ICONS[req.usageType] || 'ri-computer-line'} />
                  </div>
                  <div className={styles.communityCardContent}>
                    <p className={styles.communityCardTitle}>
                      {req.deviceType === 'laptop' ? 'Laptop' : 'PC'} para {req.usageType}
                    </p>
                    <p className={styles.communityCardBudget}>
                      S/ {req.budget?.toLocaleString('es-PE')}
                    </p>
                  </div>
                  <i className='ri-arrow-right-s-line' style={{ color: '#3d95ee', fontSize: '1.25rem' }} />
                </div>
              ))}
            </div>
          )}

          <div className={styles.communityTrust}>
            <div className={styles.trustAvatars}>
              <span className={styles.trustDot} style={{ background: '#3d95ee' }} />
              <span className={styles.trustDot} style={{ background: '#2faab9' }} />
              <span className={styles.trustDot} style={{ background: '#2fba9b' }} />
              <span className={styles.trustDot} style={{ background: '#ff9800' }} />
              <span className={styles.trustDot} style={{ background: '#9c27b0' }} />
            </div>
            <p className={styles.trustText}>Personas confían en Cotiza-IA para encontrar su equipo ideal</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage
