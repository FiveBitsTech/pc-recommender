'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthUser } from '@/hooks/useAuthUser'
import styles from './index.module.css'

const ADMIN_FEATURES = [
  {
    id: 'scraping',
    icon: 'ri-radar-line',
    title: 'Scraping',
    description: 'Ejecutar y monitorear tareas de scraping de tiendas.',
    href: '/scraping',
  },
  {
    id: 'companies',
    icon: 'ri-store-2-line',
    title: 'Empresas',
    description: 'Gestionar tiendas y fuentes de datos.',
    href: '/companies',
  },
  {
    id: 'admin',
    icon: 'ri-database-2-line',
    title: 'Catálogo',
    description: 'Productos, precios, specs y más.',
    href: '/admin',
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

const AdminPanelPage = () => {
  const router = useRouter()
  const { ready, isAdmin, user, logout } = useAuthUser()

  useEffect(() => {
    if (ready && !isAdmin) router.replace('/home')
  }, [ready, isAdmin, router])

  if (!ready || !isAdmin) return null

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
                  className={styles.featureCard}
                  onClick={() => router.push(feature.href)}
                >
                  <div className={styles.featureIconWrapper}>
                    <i className={feature.icon} />
                  </div>
                  <div className={styles.featureContent}>
                    <p className={styles.featureTitle}>{feature.title}</p>
                    <p className={styles.featureDescription}>{feature.description}</p>
                  </div>
                  <i className='ri-arrow-right-s-line' style={{ color: '#3d95ee', fontSize: '1.25rem' }} />
                </div>
              ))}
            </div>

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
