import { useState, useCallback } from 'react'

import { useGetRequirementsQuery, useLazyGetRecommendationsByRequirementQuery } from '../api/historyApi'

const useHistory = () => {
  const { data: requirementsData, isLoading } = useGetRequirementsQuery()
  const [fetchRecommendations, { isLoading: isLoadingRecs }] = useLazyGetRecommendationsByRequirementQuery()

  const [selectedRequirement, setSelectedRequirement] = useState(null)
  const [recommendations, setRecommendations] = useState([])

  const viewDetail = useCallback(async (requirement) => {
    setSelectedRequirement(requirement)

    const result = await fetchRecommendations(requirement.id).unwrap()

    setRecommendations(result.items ?? [])
  }, [fetchRecommendations])

  const closeDetail = useCallback(() => {
    setSelectedRequirement(null)
    setRecommendations([])
  }, [])

  const requirements = requirementsData?.items ?? []

  return {
    requirements,
    isLoading,
    selectedRequirement,
    recommendations,
    isLoadingRecs,
    viewDetail,
    closeDetail,
  }
}

export default useHistory
