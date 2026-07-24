'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import HistoryCard from './components/HistoryCard'
import HistoryDetail from './components/HistoryDetail'
import useHistory from './hooks/useHistory'

const HistoryPage = () => {
  const {
    requirements,
    isLoading,
    selectedRequirement,
    recommendations,
    isLoadingRecs,
    viewDetail,
    closeDetail,
  } = useHistory()

  // Detail view
  if (selectedRequirement) {
    return (
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <HistoryDetail
          requirement={selectedRequirement}
          recommendations={recommendations}
          isLoading={isLoadingRecs}
          onClose={closeDetail}
        />
      </Box>
    )
  }

  // List view
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        Mis cotizaciones
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Historial de búsquedas y recomendaciones guardadas
      </Typography>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={40} />
        </Box>
      ) : requirements.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <i className='ri-search-line' style={{ fontSize: '3rem', opacity: 0.3 }} />
          <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
            No tienes cotizaciones aún
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Realiza tu primera búsqueda desde Nueva cotización
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {requirements.map((req) => (
            <HistoryCard key={req.id} requirement={req} onView={viewDetail} />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default HistoryPage
