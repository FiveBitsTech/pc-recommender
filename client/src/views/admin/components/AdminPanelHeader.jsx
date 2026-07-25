'use client'

import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

/** Header uniforme: título + buscador + selector empresa (opcional). */
const AdminPanelHeader = ({
  title,
  subtitle,
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  showCompany = true,
  companyId = '',
  onCompanyChange,
  companies = []
}) => (
  <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
    <div>
      <Typography variant='h6' className='mbe-1'>
        {title}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        {subtitle}
      </Typography>
    </div>
    <div className='flex flex-wrap gap-2 w-full sm:w-auto'>
      <TextField
        size='small'
        placeholder={searchPlaceholder}
        value={search}
        onChange={e => onSearchChange?.(e.target.value)}
        className='sm:is-[220px] max-sm:flex-1'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <i className='ri-search-line' />
            </InputAdornment>
          )
        }}
      />
      {showCompany ? (
        <TextField
          select
          size='small'
          label='Empresa'
          value={companyId}
          onChange={e => onCompanyChange?.(e.target.value)}
          className='sm:is-[200px] max-sm:flex-1'
        >
          <MenuItem value=''>Todas</MenuItem>
          {companies.map(c => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      ) : null}
    </div>
  </CardContent>
)

export default AdminPanelHeader
