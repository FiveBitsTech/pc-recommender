import { useState, useCallback } from 'react'

import { useBuildPCMutation } from '../api/builderApi'

const useBuilder = () => {
  const [buildPC, { isLoading: isBuilding }] = useBuildPCMutation()

  const [formData, setFormData] = useState({
    usageType: null,
    budget: 4000,
    brandPreference: null,
  })

  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const updateFormData = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const submit = useCallback(async () => {
    setError(null)

    try {
      const data = await buildPC({
        usageType: formData.usageType,
        budget: formData.budget,
        brandPreference: formData.brandPreference || undefined,
      }).unwrap()

      setResult(data)
    } catch (err) {
      setError('Error al generar la configuración. Intenta de nuevo.')
    }
  }, [formData, buildPC])

  const reset = useCallback(() => {
    setFormData({ usageType: null, budget: 4000, brandPreference: null })
    setResult(null)
    setError(null)
  }, [])

  const canSubmit = formData.usageType && formData.budget >= 1000

  return {
    formData,
    result,
    isBuilding,
    canSubmit,
    error,
    updateFormData,
    submit,
    reset,
  }
}

export default useBuilder
