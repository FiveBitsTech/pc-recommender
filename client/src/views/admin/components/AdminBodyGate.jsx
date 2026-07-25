'use client'

import AdminTableSkeleton from './AdminTableSkeleton'
import { useDelayedFlag } from '../hooks/useDelayedFlag'

/**
 * Cuerpo de panel admin: skeleton solo si la carga supera ~250ms
 * (evita flash skeleton → empty/data en respuestas rápidas).
 */
const AdminBodyGate = ({ isLoading, isEmpty, empty, children, delayMs = 250 }) => {
  const showSkeleton = useDelayedFlag(isLoading, delayMs)

  if (isLoading && !showSkeleton) {
    return <div style={{ minHeight: 187 }} aria-hidden />
  }

  if (showSkeleton) return <AdminTableSkeleton />

  if (isEmpty) return empty

  return children
}

export default AdminBodyGate
