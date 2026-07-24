'use client'

import { useMemo, useState } from 'react'

import {
  notificationErrorMessage,
  notificationSuccesMessage
} from '@/components/ToastNotification'

import {
  useGenerateScrapeConfigMutation,
  useGetAdminCompaniesQuery,
  useUpsertCompanyMutation,
  useUpdateCompanyMutation
} from '../api/companiesApi'
import { companyToForm, emptyCompanyForm, formToPayload, slugify } from '../utils/companyHelpers'

export const useCompaniesClient = ({ skip = false } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useGetAdminCompaniesQuery(undefined, { skip })
  const [upsertCompany, upsertState] = useUpsertCompanyMutation()
  const [updateCompany, updateState] = useUpdateCompanyMutation()
  const [generateScrapeConfig, generateState] = useGenerateScrapeConfigMutation()

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [form, setForm] = useState(emptyCompanyForm())
  const [formError, setFormError] = useState('')
  const [selected, setSelected] = useState(null)
  const [busySave, setBusySave] = useState(false)
  const [busyGenerate, setBusyGenerate] = useState(false)

  const items = data?.items ?? []

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(item =>
      [item.name, item.slug, item.website].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    )
  }, [items, search])

  const saving = busySave || upsertState.isLoading || updateState.isLoading
  const generating = busyGenerate || generateState.isLoading

  const openCreate = () => {
    setForm(emptyCompanyForm())
    setFormError('')
    setSelected(null)
    setShowDetails(false)
    setShowForm(true)
  }

  const openEdit = company => {
    setForm(companyToForm(company))
    setFormError('')
    setSelected(company)
    setShowDetails(false)
    setShowForm(true)
  }

  const openDetails = company => {
    setSelected(company)
    setShowForm(false)
    setShowDetails(true)
  }

  const closeForm = () => {
    if (busySave || busyGenerate) return
    setShowForm(false)
    setFormError('')
  }

  const closeDetails = () => setShowDetails(false)

  const patchForm = patch => {
    setForm(prev => {
      const next = { ...prev, ...patch }
      if (patch.name !== undefined && !prev.id) {
        next.slug = slugify(patch.name)
      }
      return next
    })
  }

  const saveCompany = async () => {
    if (busySave || busyGenerate) return false

    setFormError('')
    const parsed = formToPayload(form)
    if (!parsed.ok) {
      setFormError(parsed.error)
      notificationErrorMessage(parsed.error)
      return false
    }
    if (!parsed.value.slug || !parsed.value.name) {
      const msg = 'Nombre y slug son obligatorios'
      setFormError(msg)
      notificationErrorMessage(msg)
      return false
    }
    if (!parsed.value.website) {
      const msg = 'El sitio web es obligatorio'
      setFormError(msg)
      notificationErrorMessage(msg)
      return false
    }

    setBusySave(true)
    try {
      if (form.id) {
        await updateCompany({ id: form.id, ...parsed.value }).unwrap()
        notificationSuccesMessage('Empresa actualizada correctamente')
      } else {
        await upsertCompany(parsed.value).unwrap()
        notificationSuccesMessage('Empresa creada correctamente')
      }
      setShowForm(false)
      setFormError('')
      return true
    } catch (err) {
      const msg = Array.isArray(err?.data?.message)
        ? err.data.message.join(', ')
        : err?.data?.message || err?.error || 'No se pudo guardar la empresa'
      setFormError(msg)
      notificationErrorMessage(msg)
      return false
    } finally {
      setBusySave(false)
    }
  }

  const generateConfigWithAi = async () => {
    if (busySave || busyGenerate) return false

    setFormError('')
    const name = form.name?.trim()
    const website = form.website?.trim()

    if (!name || name.length < 2) {
      const msg = 'Para generar con IA indica el nombre de la tienda'
      setFormError(msg)
      notificationErrorMessage(msg)
      return false
    }
    if (!website || website.length < 8) {
      const msg = 'Para generar con IA indica la URL del sitio web'
      setFormError(msg)
      notificationErrorMessage(msg)
      return false
    }

    setBusyGenerate(true)
    try {
      const result = await generateScrapeConfig({
        name,
        website,
        probe: true
      }).unwrap()

      if (!result?.scrapeConfig) {
        const msg = 'La IA no devolvió scrapeConfig'
        setFormError(msg)
        notificationErrorMessage(msg)
        return false
      }

      patchForm({ scrapeConfigText: JSON.stringify(result.scrapeConfig, null, 2) })
      notificationSuccesMessage('scrapeConfig generado con IA')
      return true
    } catch (err) {
      const msg = Array.isArray(err?.data?.message)
        ? err.data.message.join(', ')
        : err?.data?.message || err?.error || 'No se pudo generar scrapeConfig con IA'
      setFormError(msg)
      notificationErrorMessage(msg)
      return false
    } finally {
      setBusyGenerate(false)
    }
  }

  return {
    items: filteredItems,
    total: items.length,
    isLoading: isLoading || isFetching,
    error: error?.data?.message || error?.error || null,
    search,
    setSearch,
    showForm,
    showDetails,
    form,
    formError,
    selected,
    saving,
    generating,
    refetch,
    openCreate,
    openEdit,
    openDetails,
    closeForm,
    closeDetails,
    patchForm,
    saveCompany,
    generateConfigWithAi
  }
}

export default useCompaniesClient
