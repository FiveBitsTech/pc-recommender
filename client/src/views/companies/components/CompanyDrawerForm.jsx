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

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
    >
      <Box className='flex items-center justify-between p-5 border-be'>
        <Typography variant='h5'>{isEdit ? 'Editar empresa' : 'Nueva empresa'}</Typography>
        <IconButton size='small' onClick={onClose}>
          <i className='ri-close-line' />
        </IconButton>
      </Box>

      <Box className='flex flex-col gap-4 p-5 flex-1 overflow-y-auto'>
        <TextField
          label='Nombre'
          fullWidth
          required
          value={form.name}
          onChange={e => onChange({ name: e.target.value })}
        />
        <TextField
          label='Slug'
          fullWidth
          required
          helperText='Identificador único (se sugiere desde el nombre)'
          value={form.slug}
          onChange={e => onChange({ slug: e.target.value })}
        />
        <TextField
          label='Sitio web'
          fullWidth
          required
          placeholder='https://www.tienda.pe'
          helperText='Obligatorio para guardar y para generar scrapeConfig con IA'
          value={form.website}
          onChange={e => onChange({ website: e.target.value })}
          error={Boolean(formError) && !String(form.website || '').trim()}
        />
        <TextField
          label='Logo URL'
          fullWidth
          value={form.logoUrl}
          onChange={e => onChange({ logoUrl: e.target.value })}
        />
        <FormControlLabel
          control={<Switch checked={form.active} onChange={e => onChange({ active: e.target.checked })} />}
          label='Empresa activa'
        />

        <Box className='flex items-center justify-between gap-2 flex-wrap'>
          <Typography variant='subtitle2'>scrapeConfig (JSON)</Typography>
          <LoadingButton
            size='small'
            variant='tonal'
            loading={generating}
            disabled={saving}
            startIcon={<i className='ri-sparkling-line' />}
            onClick={onGenerateAi}
          >
            Generar con IA
          </LoadingButton>
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={10}
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
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving || generating}>
          Cancelar
        </Button>
        <LoadingButton variant='contained' loading={saving} disabled={generating || !canSave} onClick={onSave}>
          Guardar
        </LoadingButton>
      </Box>
    </Drawer>
  )
}

export default CompanyDrawerForm
