'use client'

import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

const formatEta = seconds => {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null
  if (seconds < 60) return `~${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  if (mins < 60) return secs ? `~${mins}m ${secs}s` : `~${mins}m`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60

  return remMins ? `~${hours}h ${remMins}m` : `~${hours}h`
}

const ScrapingRunProgress = ({ progress, compact = false }) => {
  if (!progress) return null

  const total = Number(progress.total) || 0
  const visited = Number(progress.visited) || 0
  const persisted = Number(progress.persisted) || 0

  // Sin total conocido (listados) → indeterminada; con total → % real.
  const pct = total > 0 ? Math.min(100, Math.round((visited / total) * 100)) : null
  const eta = formatEta(progress.etaSeconds)
  const isActive = ['listing', 'products', 'ingest'].includes(progress.status)

  if (!isActive && progress.status !== 'done' && progress.status !== 'failed') return null

  return (
    <Box
      sx={{
        mt: compact ? 1.5 : 2,
        p: compact ? 1.5 : 2,
        borderRadius: 1,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box className='flex items-center justify-between gap-2' sx={{ mb: 1 }}>
        <Typography variant='body2' color='text.primary' sx={{ fontWeight: 600 }}>
          {progress.phase || 'Scrapeando…'}
        </Typography>
        {total > 0 ? (
          <Typography variant='caption' color='text.secondary'>
            {visited}/{total}
            {eta ? ` · ETA ${eta}` : ''}
          </Typography>
        ) : (
          <Typography variant='caption' color='text.secondary'>
            {progress.status === 'listing' ? 'Descubriendo…' : ''}
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant={pct == null ? 'indeterminate' : 'determinate'}
        value={pct ?? 0}
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'),
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            bgcolor: 'primary.main'
          }
        }}
      />
      {persisted > 0 ? (
        <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
          {persisted} guardados en BD
        </Typography>
      ) : null}

      {progress.message && progress.status === 'failed' ? (
        <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
          {progress.message}
        </Typography>
      ) : null}
    </Box>
  )
}

export default ScrapingRunProgress
