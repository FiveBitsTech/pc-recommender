'use client'

import classnames from 'classnames'
import { useEffect, useState } from 'react'

import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'

import CustomTabList from '@core/components/mui/TabList'

import { adminNavData } from '../utils/admin-menu-config'
import ComparisonsPanel from '../components/ComparisonsPanel'
import PricesPanel from '../components/PricesPanel'
import ProductsPanel from '../components/ProductsPanel'
import RecommendationsPanel from '../components/RecommendationsPanel'
import SpecsPanel from '../components/SpecsPanel'
import TagsPanel from '../components/TagsPanel'

const panelFor = (sectionId, skip) => {
  switch (sectionId) {
    case 'productos':
      return <ProductsPanel skip={skip} />
    case 'precios':
      return <PricesPanel skip={skip} />
    case 'specs':
      return <SpecsPanel skip={skip} />
    case 'tags':
      return <TagsPanel skip={skip} />
    case 'comparaciones':
      return <ComparisonsPanel skip={skip} />
    case 'recomendaciones':
      return <RecommendationsPanel skip={skip} />
    default:
      return null
  }
}

const AdminMenuLayout = ({ activeTab, onTabChange, skip }) => {
  const activeMeta = adminNavData.find(r => r.id === activeTab)
  // Lazy: solo monta tabs visitados; keepMounted evita remount/skeleton al volver.
  const [visited, setVisited] = useState(() => new Set([activeTab]))

  useEffect(() => {
    setVisited(prev => {
      if (prev.has(activeTab)) return prev
      const next = new Set(prev)
      next.add(activeTab)
      return next
    })
  }, [activeTab])

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 2.5 }}>
          <CustomTabList
            orientation='vertical'
            onChange={(_, id) => onTabChange(id)}
            className='is-full'
            pill='true'
            color='primary'
          >
            {adminNavData.map(item => (
              <Tab
                key={item.id}
                label={item.title}
                icon={<i className={classnames(item.icon, '!mbe-0 mie-1.5')} />}
                iconPosition='start'
                value={item.id}
                className='flex-row justify-start !min-is-full'
              />
            ))}
          </CustomTabList>
        </Grid>

        <Grid size={{ xs: 12, md: 9.5 }}>
          {activeMeta ? (
            <div className='flex items-center gap-4 mbe-4'>
              <Avatar
                variant='rounded'
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: 'primary.lightOpacity',
                  color: 'primary.main'
                }}
              >
                <i className={classnames(activeMeta.icon, 'text-2xl')} />
              </Avatar>
              <div className='min-is-0'>
                <Typography variant='h5'>{activeMeta.title}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {activeMeta.subtitle}
                </Typography>
              </div>
            </div>
          ) : null}

          {adminNavData.map(item =>
            visited.has(item.id) ? (
              <TabPanel key={item.id} value={item.id} className='p-0' keepMounted>
                {panelFor(item.id, skip)}
              </TabPanel>
            ) : null
          )}
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default AdminMenuLayout
