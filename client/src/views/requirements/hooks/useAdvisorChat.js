import { useState, useCallback, useRef } from 'react'

import { useCreateRequirementMutation, useLazyGetRecommendationsByRequirementQuery, useBuildPCMutation } from '../api/requirementApi'

const USAGE_OPTIONS = [
  { value: 'gaming', label: 'Gaming', description: 'Juegos y entretenimiento', minBudget: 3000 },
  { value: 'oficina', label: 'Trabajo y oficina', description: 'Documentos, email, hojas de cálculo', minBudget: 1500 },
  { value: 'programación', label: 'Programación', description: 'Desarrollo de software', minBudget: 2500 },
  { value: 'diseño gráfico', label: 'Diseño y edición', description: 'Diseño gráfico, video, 3D', minBudget: 3000 },
  { value: 'estudio', label: 'Estudio', description: 'Tareas, investigación, clases online', minBudget: 1500 },
  { value: 'streaming', label: 'Streaming', description: 'Transmisiones en vivo, contenido', minBudget: 3000 },
]

const ALL_BUDGET_OPTIONS = [
  { value: 1500, label: 'Hasta S/ 1,500', description: 'Presupuesto básico' },
  { value: 2500, label: 'Hasta S/ 2,500', description: 'Gama de entrada' },
  { value: 4000, label: 'Hasta S/ 4,000', description: 'Gama media' },
  { value: 6000, label: 'Hasta S/ 6,000', description: 'Gama media-alta' },
  { value: 8000, label: 'Hasta S/ 8,000', description: 'Gama alta' },
  { value: 10000, label: 'Más de S/ 8,000', description: 'Premium' },
]

const PRIORITY_OPTIONS = [
  { value: 'rendimiento', label: 'Mejor rendimiento', description: 'Máxima velocidad y potencia', for: ['gaming', 'programación', 'diseño gráfico', 'streaming'] },
  { value: 'precio', label: 'Mejor relación calidad-precio', description: 'Lo máximo por tu dinero', for: ['oficina', 'estudio', 'gaming', 'programación', 'diseño gráfico', 'streaming'] },
  { value: 'portabilidad', label: 'Portabilidad', description: 'Ligero y fácil de transportar', for: ['oficina', 'estudio', 'programación'] },
  { value: 'durabilidad', label: 'Mayor duración', description: 'Resistente y de larga vida útil', for: ['oficina', 'estudio'] },
  { value: 'upgradeable', label: 'Posibilidad de actualizar', description: 'Expandible a futuro', for: ['gaming', 'programación', 'streaming', 'diseño gráfico'] },
]

const CHAT_STEPS = [
  { id: 'usageType', botMessage: '¡Buena elección! Ahora cuéntame, ¿para qué lo vas a usar principalmente?', getOptions: () => USAGE_OPTIONS },
  { id: 'budget', botMessage: 'Perfecto. ¿Cuál es tu presupuesto aproximado?', getOptions: (form) => {
    const usage = USAGE_OPTIONS.find((u) => u.value === form.usageType)
    const minBudget = usage?.minBudget ?? 1500

    return ALL_BUDGET_OPTIONS.filter((b) => b.value >= minBudget)
  }},
  { id: 'priority', botMessage: 'Casi listo. ¿Qué es lo más importante para ti?', getOptions: (form) => {
    if (form.deviceType === 'build') {
      return [
        { value: 'Intel', label: 'Team Intel', description: 'Prefiero procesadores Intel' },
        { value: 'AMD', label: 'Team AMD', description: 'Prefiero procesadores AMD / Ryzen' },
        { value: 'sin preferencia', label: 'Sin preferencia', description: 'Lo mejor sin importar marca' },
      ]
    }

    return PRIORITY_OPTIONS.filter((p) => p.for.includes(form.usageType))
  }},
]

const useAdvisorChat = () => {
  const [createRequirement] = useCreateRequirementMutation()
  const [buildPC] = useBuildPCMutation()

  const [fetchRecommendations, { data: recommendationsData, isLoading: isLoadingRecs }] =
    useLazyGetRecommendationsByRequirementQuery()

  const stepRef = useRef(0)
  const formRef = useRef({ deviceType: null, usageType: null, budget: null, budgetMin: null, priority: null })

  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [deviceSelected, setDeviceSelected] = useState(false)
  const [showRetry, setShowRetry] = useState(false)
  const [buildResult, setBuildResult] = useState(null)
  const [error, setError] = useState(null)

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const selectDevice = useCallback((deviceType, label) => {
    addMessage({ type: 'user', text: label })
    formRef.current.deviceType = deviceType
    setDeviceSelected(true)

    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      addMessage({ type: 'bot', text: CHAT_STEPS[0].botMessage })
      stepRef.current = 0
      setCurrentStep(0)
    }, 1200)
  }, [addMessage])

  const selectOption = useCallback((stepId, value, label) => {
    addMessage({ type: 'user', text: label })

    // Handle budget range object
    if (stepId === 'budget' && typeof value === 'object') {
      formRef.current.budget = value.budgetMax
      formRef.current.budgetMin = value.budgetMin
    } else {
      formRef.current[stepId] = value
    }

    const current = stepRef.current
    const nextStep = current + 1

    if (nextStep < CHAT_STEPS.length) {
      stepRef.current = nextStep
      setIsTyping(true)

      setTimeout(() => {
        setIsTyping(false)
        addMessage({ type: 'bot', text: CHAT_STEPS[nextStep].botMessage })
        setCurrentStep(nextStep)
      }, 1200)
    } else {
      // All done
      stepRef.current = nextStep
      setCurrentStep(nextStep)
      setIsTyping(true)

      setTimeout(async () => {
        setIsTyping(false)
        addMessage({ type: 'bot', text: '¡Listo! Déjame buscar las mejores opciones para ti... 🔍' })

        // Show typing while fetching
        setIsTyping(true)
        setIsCompleted(true)

        try {
          const data = formRef.current

          if (data.deviceType === 'build') {
            // Builder flow
            const result = await buildPC({
              usageType: data.usageType,
              budget: data.budget,
              brandPreference: data.priority || undefined,
            }).unwrap()

            setBuildResult(result)
            setIsTyping(false)
          } else {
            // Recommendations flow
            const result = await createRequirement({
              usageType: data.usageType,
              budget: data.budget,
              budgetMin: data.budgetMin || undefined,
              priority: data.priority,
              deviceType: data.deviceType,
            }).unwrap()

            await fetchRecommendations(result.id).unwrap().then((res) => {
              setIsTyping(false)

              if (!res.items || res.items.length === 0) {
                addMessage({ type: 'bot', text: 'No encontré equipos que coincidan con tu búsqueda en este momento. 😕 Esto puede pasar si el rango de precios es muy ajustado o no tenemos stock en esa categoría.' })
                addMessage({ type: 'bot', text: '¿Te gustaría intentar con otras opciones? Puedes ajustar tu presupuesto o cambiar el tipo de equipo.' })
                setIsCompleted(false)
                setShowRetry(true)
              }
            })
          }
        } catch (err) {
          setError('Hubo un error al procesar tu solicitud.')
          setIsCompleted(false)
          setIsTyping(false)
        }
      }, 1500)
    }
  }, [addMessage, createRequirement, fetchRecommendations])

  const currentOptions = currentStep < CHAT_STEPS.length
    ? CHAT_STEPS[currentStep]?.getOptions(formRef.current)
    : null

  const recommendations = recommendationsData?.items ?? []

  const retry = useCallback(() => {
    // Reset back to usage step so user can choose differently
    setShowRetry(false)
    setIsCompleted(false)
    stepRef.current = 0
    setCurrentStep(0)
    formRef.current.usageType = null
    formRef.current.budget = null
    formRef.current.budgetMin = null
    formRef.current.priority = null

    addMessage({ type: 'bot', text: '¡Sin problema! Empecemos de nuevo. ¿Para qué vas a usar tu equipo?' })
  }, [addMessage])

  return {
    messages,
    currentStep,
    currentOptions,
    isTyping,
    isCompleted,
    isLoadingRecs,
    recommendations,
    buildResult,
    deviceSelected,
    showRetry,
    error,
    selectOption,
    selectDevice,
    retry,
  }
}

export default useAdvisorChat
