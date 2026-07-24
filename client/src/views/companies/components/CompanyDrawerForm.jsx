'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LoadingButton } from '@mui/lab'

import CompanyLogo from './CompanyLogo'

const CompanyDrawerForm = ({
  open,
  form,
  formError,
  saving,
  generating,
  onClose,
  onChange,
  onSave,
  onGenerateAi
}) => {
  const isEdit = Boolean(form?.id)
  const canSave = Boolean(form?.name?.trim() && form?.slug?.trim() && form?.website?.trim())
  const busy = saving || generating

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={(_, reason) => {
        if (busy && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return
        onClose()
      }}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
    >
      <Box className='flex items-center justify-between p-5 border-be'>
        <Typography variant='h5'>{isEdit ? 'Editar empresa' : 'Nueva empresa'}</Typography>
        <IconButton size='small' onClick={onClose} disabled={busy}>
          <i className='ri-close-line' />
        </IconButton>
      </Box>

      <Box className='flex flex-col gap-4 p-5 flex-1 overflow-y-auto'>
        <TextField
          label='Nombre'
          fullWidth
          required
          disabled={busy}
          value={form.name}
          onChange={e => onChange({ name: e.target.value })}
        />
        <TextField
          label='Slug'
          fullWidth
          required
          disabled={busy}
          helperText='Identificador único (se sugiere desde el nombre)'
          value={form.slug}
          onChange={e => onChange({ slug: e.target.value })}
        />
        <TextField
          label='Sitio web'
          fullWidth
          required
          disabled={busy}
          placeholder='https://www.tienda.pe'
          helperText='Obligatorio para guardar y para generar scrapeConfig con IA'
          value={form.website}
          onChange={e => onChange({ website: e.target.value })}
          error={Boolean(formError) && !String(form.website || '').trim()}
        />
        <TextField
          label='Logo URL'
          fullWidth
          disabled={busy}
          value={form.logoUrl}
          onChange={e => onChange({ logoUrl: e.target.value })}
        />
        <Box className='flex items-center justify-between gap-2 flex-wrap' sx={{ mt: -1, px: 0.5 }}>
          <FormControlLabel
            sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: 13, color: 'text.secondary' } }}
            control={
              <Switch
                size='small'
                checked={Boolean(form.logoDarkBg)}
                disabled={busy || !String(form.logoUrl || '').trim()}
                onChange={e => {
                  const checked = e.target.checked
                  onChange({
                    logoDarkBg: checked,
                    logoBgColor: checked ? form.logoBgColor || '#3a3541' : form.logoBgColor
                  })
                }}
              />
            }
            label='Fondo en logo'
          />
          <Box className='flex items-center gap-2'>
            {form.logoDarkBg ? (
              <Box
                component='label'
                title='Color de fondo'
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: busy ? 'default' : 'pointer',
                  opacity: busy ? 0.6 : 1
                }}
              >
                <Box
                  component='input'
                  type='color'
                  disabled={busy}
                  value={form.logoBgColor || '#3a3541'}
                  onChange={e => onChange({ logoBgColor: e.target.value })}
                  sx={{
                    width: 28,
                    height: 28,
                    p: 0,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'transparent',
                    cursor: 'pointer'
                  }}
                />
                <Typography variant='caption' color='text.disabled'>
                  {(form.logoBgColor || '#3a3541').toUpperCase()}
                </Typography>
              </Box>
            ) : null}
            {form.logoUrl ? (
              <CompanyLogo
                src={form.logoUrl}
                alt=''
                size={28}
                darkBg={form.logoDarkBg}
                bgColor={form.logoBgColor}
              />
            ) : null}
          </Box>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={form.active}
              disabled={busy}
              onChange={e => onChange({ active: e.target.checked })}
            />
          }
          label='Empresa activa'
        />

        <Box className='flex items-center justify-between gap-2 flex-wrap'>
          <Typography variant='subtitle2'>scrapeConfig (JSON)</Typography>
          <LoadingButton
            size='small'
            variant='tonal'
            loading={generating}
            loadingPosition='start'
            disabled={saving}
            startIcon={<i className='ri-sparkling-line' />}
            onClick={onGenerateAi}
          >
            {generating ? 'Generando...' : 'Generar con IA'}
          </LoadingButton>
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={10}
          disabled={busy}
          value={form.scrapeConfigText}
          onChange={e => onChange({ scrapeConfigText: e.target.value })}
          inputProps={{ style: { fontFamily: 'ui-monospace, monospace', fontSize: 13 } }}
          helperText='Con nombre + sitio web, la IA analiza la tienda y arma categorías, selectores y paginación.'
        />
        {formError ? (
          <Typography variant='body2' color='error'>
            {formError}
          </Typography>
        ) : null}
      </Box>

      <Box className='flex items-center justify-between gap-3 p-5 border-bs'>
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <LoadingButton
          variant='contained'
          loading={saving}
          loadingPosition='start'
          disabled={generating || !canSave}
          startIcon={saving ? undefined : <i className='ri-save-line' />}
          onClick={onSave}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </LoadingButton>
      </Box>
    </Drawer>
  )
}

export default CompanyDrawerForm
