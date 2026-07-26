'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

import { useAuthUser } from '@/hooks/useAuthUser'
import styles from './index.module.css'

// Lazy load admin sub-views
const ScrapingView = dynamic(() => import('@/views/scraping'), { ssr: false })
const CompaniesView = dynamic(() => import('@/views/companies'), { ssr: false })
const AdminCatalogView = dynamic(() => import('@/views/admin'), { ssr: false })

const ADMIN_FEATURES = [
  {
    id: 'scraping',
    icon: 'ri-radar-line',
    title: 'Scraping',
    description: 'Ejecutar y monitorear tareas de scraping de tiendas.',
  },
  {
    id: 'companies',
    icon: 'ri-store-2-line',
    title: 'Empresas',
    description: 'Gestionar tiendas y fuentes de datos.',
  },
  {
    id: 'admin',
    icon: 'ri-database-2-line',
    title: 'Catálogo',
    description: 'Productos, precios, specs y más.',
  },
  {
    id: 'requirements',
    icon: 'ri-robot-2-line',
    title: 'Asesor IA',
    description: 'Probar el flujo de recomendaciones.',
    href: '/requirements',
  },
  {
    id: 'home',
    icon: 'ri-home-smile-line',
    title: 'Vista pública',
    description: 'Ver la landing como la ven los usuarios.',
    href: '/home',
  },
  {
    id: 'settings',
    icon: 'ri-settings-3-line',
    title: 'Ajustes',
    description: 'Configuración general de la plataforma.',
    href: '/settings',
  },
]

const INLINE_VIEWS = {
  scraping: ScrapingView,
  companies: CompaniesView,
  admin: AdminCatalogView,
}

const AdminPanelPage = () => {
  const router = useRouter()
  const { ready, isAdmin, user, logout } = useAuthUser()
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    if (ready && !isAdmin) router.replace('/home')
  }, [ready, isAdmin, router])

  if (!ready || !isAdmin) return null

  const handleCardClick = (feature) => {
    // If it has an href, navigate externally
    if (feature.href) {
      router.push(feature.href)
      return
    }

    // Toggle inline view
    setActiveSection(activeSection === feature.id ? null : feature.id)
  }

  const ActiveView = activeSection ? INLINE_VIEWS[activeSection] : null

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.outerCard}>
        <div className={styles.innerGradient}>
          <div className={styles.contentWrapper}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerTop}>
                <div className={styles.headerInfo}>
                  <div className={styles.avatarCircle}>
                    <i className='ri-admin-line' />
                  </div>
                  <div>
                    <h1 className={styles.headerTitle}>Panel de Administración</h1>
                    <p className={styles.headerSubtitle}>
                      Hola, {user?.name || 'Admin'}. Gestiona la plataforma desde aquí.
                    </p>
                  </div>
                </div>
                <button className={styles.logoutButton} onClick={() => { logout(); router.push('/home') }}>
                  <i className='ri-logout-box-r-line' />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>

            {/* Feature grid */}
            <div className={styles.featureGrid}>
              {ADMIN_FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className={`${styles.featureCard} ${activeSection === feature.id ? styles.featureCardActive : ''}`}
                  onClick={() => handleCardClick(feature)}
                >
                  <div className={styles.featureIconWrapper}>
                    <i className={feature.icon} />
                  </div>
                  <div className={styles.featureContent}>
                    <p className={styles.featureTitle}>{feature.title}</p>
                    <p className={styles.featureDescription}>{feature.description}</p>
                  </div>
                  {feature.href ? (
                    <i className='ri-external-link-line' style={{ color: '#3d95ee', fontSize: '1rem', opacity: 0.6 }} />
                  ) : (
                    <i className={activeSection === feature.id ? 'ri-arrow-up-s-line' : 'ri-arrow-right-s-line'} style={{ color: '#3d95ee', fontSize: '1.25rem' }} />
                  )}
                </div>
              ))}
            </div>

            {/* Inline view container */}
            {ActiveView && (
              <div className={styles.inlineViewWrapper}>
                <div className={styles.inlineViewHeader}>
                  <button className={styles.closeViewButton} onClick={() => setActiveSection(null)}>
                    <i className='ri-arrow-up-line' />
                    <span>Cerrar {ADMIN_FEATURES.find(f => f.id === activeSection)?.title}</span>
                  </button>
                </div>
                <div className={styles.inlineViewContent}>
                  <ActiveView />
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className={styles.quickInfo}>
              <div className={styles.quickChip}>
                <i className='ri-shield-check-line' />
                <span>Admin</span>
              </div>
              <div className={styles.quickChip}>
                <i className='ri-mail-line' />
                <span>{user?.email || '---'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanelPage
