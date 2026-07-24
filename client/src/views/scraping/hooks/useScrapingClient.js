'use client'

import { useMemo, useState } from 'react'

import {
  notificationErrorMessage,
  notificationSuccesMessage
} from '@/components/ToastNotification'
import { useGetAdminCompaniesQuery } from '@/views/companies/api/companiesApi'

import { useGetScrapingHistoryQuery, useRunScrapingMutation } from '../api/scrapingApi'

export const useScrapingClient = ({ skip = false } = {}) => {
  const { data: historyData, isLoading: loadingHistory, refetch: refetchHistory } = useGetScrapingHistoryQuery(
    undefined,
    { skip }
  )
  const { data: companiesData, isLoading: loadingCompanies } = useGetAdminCompaniesQuery(undefined, { skip })
  const [runScraping, runState] = useRunScrapingMutation()

  const [runningCompanyId, setRunningCompanyId] = useState(null)
  const [lastResult, setLastResult] = useState(null)

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

    try {
      const result = await runScraping({ companyId, dryRun: false }).unwrap()
      setLastResult(result)
      notificationSuccesMessage(`Scraping OK · ${result.productsFound ?? 0} productos`)
      refetchHistory()
      return true
    } catch (err) {
      const msg = Array.isArray(err?.data?.message)
        ? err.data.message.join(', ')
        : err?.data?.message || err?.error || 'Falló el scraping'
      notificationErrorMessage(msg)
      return false
    } finally {
      setRunningCompanyId(null)
    }
  }

  return {
    cards,
    history: Array.isArray(history) ? history : [],
    isLoading: loadingHistory || loadingCompanies,
    runningCompanyId,
    isRunning: Boolean(runningCompanyId) || runState.isLoading,
    lastResult,
    runCompany,
    refetchHistory
  }
}

export default useScrapingClient
