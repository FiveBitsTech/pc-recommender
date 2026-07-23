import { useState, useCallback } from 'react'

import { useCreateRequirementMutation, useLazyGetRecommendationsByRequirementQuery } from '../api/requirementApi'

/**
 * Manages the multi-step requirement form flow:
 * Step 0: Device type
 * Step 1: Usage type (+ sub-option)
 * Step 2: Budget + priority
 * Step 3: Analysis loading → results
 */
const useRequirementChat = () => {
  const [createRequirement, { isLoading: isSubmitting }] = useCreateRequirementMutation()

  const [fetchRecommendations, { data: recommendationsData, isLoading: isLoadingRecs }] =
    useLazyGetRecommendationsByRequirementQuery()

  const [currentStep, setCurrentStep] = useState(0)

  const [formData, setFormData] = useState({
    deviceType: null,
    usageType: null,
    usageDetail: null,
    budget: 3000,
    budgetFlexible: false,
    priority: null,
  })

  const [isCompleted, setIsCompleted] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [error, setError] = useState(null)

  const updateFormData = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1)
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }, [])

  const goToStep = useCallback((step) => {
    if (step < currentStep) {
      setCurrentStep(step)
      setIsCompleted(false)
      setSelectedProduct(null)
    }
  }, [currentStep])

  const submit = useCallback(async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await createRequirement({
        usageType: formData.usageType,
        budget: formData.budget,
        priority: formData.priority || 'rendimiento',
        deviceType: formData.deviceType,
      }).unwrap()

      // Simulate analysis time for UX
      await new Promise((resolve) => setTimeout(resolve, 3000))

      await fetchRecommendations(result.id)

      setIsAnalyzing(false)
      setIsCompleted(true)
      setCurrentStep(3)
    } catch (err) {
      setError('Hubo un error al procesar tu solicitud. Intenta de nuevo.')
      setIsAnalyzing(false)
    }
  }, [formData, createRequirement, fetchRecommendations])

  const reset = useCallback(() => {
    setCurrentStep(0)

    setFormData({
      deviceType: null,
      usageType: null,
      usageDetail: null,
      budget: 3000,
      budgetFlexible: false,
      priority: null,
    })

    setIsCompleted(false)
    setIsAnalyzing(false)
    setSelectedProduct(null)
    setError(null)
  }, [])

  const recommendations = recommendationsData?.items ?? []

  return {
    currentStep,
    formData,
    isCompleted,
    isAnalyzing,
    isSubmitting,
    isLoadingRecs,
    recommendations,
    selectedProduct,
    error,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    submit,
    reset,
    setSelectedProduct,
  }
}

export default useRequirementChat
