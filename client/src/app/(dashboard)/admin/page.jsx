import { Suspense } from 'react'

import AdminPage from '@views/admin'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminPage />
    </Suspense>
  )
}
