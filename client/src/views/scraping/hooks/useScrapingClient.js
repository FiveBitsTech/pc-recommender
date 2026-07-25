'use client'

import { useEffect, useMemo, useState } from 'react'

import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification'
import { useGetAdminCompaniesQuery } from '@/views/companies/api/companiesApi'

import { useGetScrapingHistoryQuery, useGetScrapingProgressQuery, useRunScrapingMutation } from '../api/scrapingApi'

export const useScrapingClient = ({ skip = false } = {}) => {
  const {
    data: historyData,
    isLoading: loadingHistory,
    refetch: refetchHistory
  } = useGetScrapingHistoryQuery(undefined, { skip })

  const { data: companiesData, isLoading: loadingCompanies } = useGetAdminCompaniesQuery(undefined, { skip })
  const [runScraping, runState] = useRunScrapingMutation()

  const [runningCompanyId, setRunningCompanyId] = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [localProgress, setLocalProgress] = useState(null)

  // Polling nativo de RTK (force refetch cada 1s). El lazy+true anterior devolvía caché y la barra no avanzaba.
  const { data: liveProgress } = useGetScrapingProgressQuery(runningCompanyId, {
    skip: skip || !runningCompanyId,
    pollingInterval: runningCompanyId ? 1000 : 0,
    refetchOnMountOrArgChange: true
  })

  const progress = runningCompanyId && liveProgress && liveProgress.status !== 'idle' ? liveProgress : localProgress

  const companies = companiesData?.items ?? []
  const history = historyData?.items ?? historyData ?? []

  const cards = useMemo(() => {
    return companies.map(company => {
      const hasScrapeConfig = Boolean(
        company.scrapeConfig && typeof company.scrapeConfig === 'object' && Object.keys(company.scrapeConfig).length
      )

      return {
        companyId: company.id,
        source: company.slug,
        title: company.name,
        description: hasScrapeConfig
          ? 'Listo para scrapear con scrapeConfig / website.'
          : company.website
            ? 'Usará el website de la empresa.'
            : 'Necesita website o scrapeConfig.',
        icon: 'ri-store-2-line',
        website: company.website || null,
        logoUrl: company.logoUrl || null,
        logoDarkBg: Boolean(company.logoDarkBg),
        logoBgColor: company.logoBgColor || null,
        active: company.active ?? true,
        hasScrapeConfig,
        canRun: Boolean(company.website || hasScrapeConfig)
      }
    })
  }, [companies])

  const runCompany = async companyId => {
    if (runningCompanyId) return false

    setRunningCompanyId(companyId)
    setLastResult(null)
    setLocalProgress({
      companyId,
      status: 'listing',
      phase: 'Iniciando scraping…',
      visited: 0,
      total: 0,
      persisted: 0,
      etaSeconds: null
    })

    try {
      const result = await runScraping({ companyId, dryRun: false }).unwrap()

      setLastResult(result)
      setLocalProgress({
        companyId,
        status: 'done',
        phase: 'Completado',
        visited: result.productsFound ?? 0,
        total: result.productsFound ?? 0,
        persisted: result.productsFound ?? 0,
        productsFound: result.productsFound ?? 0,
        etaSeconds: 0
      })
      notificationSuccesMessage(`Scraping OK · ${result.productsFound ?? 0} productos`)
      refetchHistory()

      return true
    } catch (err) {
      const msg = Array.isArray(err?.data?.message)
        ? err.data.message.join(', ')
        : err?.data?.message || err?.error || 'Falló el scraping'

      setLocalProgress({
        companyId,
        status: 'failed',
        phase: 'Error',
        message: msg,
        visited: liveProgress?.visited ?? 0,
        total: liveProgress?.total ?? 0,
        persisted: liveProgress?.persisted ?? 0,
        etaSeconds: null
      })
      notificationErrorMessage(msg)

      return false
    } finally {
      setRunningCompanyId(null)
    }
  }

  // Si el poll llega después del finally, no pisar el estado final local.
  useEffect(() => {
    if (!runningCompanyId && liveProgress && (liveProgress.status === 'done' || liveProgress.status === 'failed')) {
      setLocalProgress(prev => prev ?? liveProgress)
    }
  }, [runningCompanyId, liveProgress])

  return {
    cards,
    history: Array.isArray(history) ? history : [],
    isLoading: loadingHistory || loadingCompanies,
    runningCompanyId,
    isRunning: Boolean(runningCompanyId) || runState.isLoading,
    progress,
    lastResult,
    runCompany,
    refetchHistory
  }
}

export default useScrapingClient
