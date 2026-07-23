'use client'

import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

import StepperHeader from './components/StepperHeader'
import StepDevice from './components/StepDevice'
import StepUsage from './components/StepUsage'
import StepBudget from './components/StepBudget'
import StepAnalysis from './components/StepAnalysis'
import ResultsView from './components/ResultsView'
import useRequirementChat from './hooks/useRequirementChat'

const RequirementsPage = () => {
  const {
    currentStep,
    formData,
    isCompleted,
    isAnalyzing,
    isSubmitting,
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
  } = useRequirementChat()

  const renderStep = () => {
    if (isAnalyzing) {
      return <StepAnalysis />
    }

    switch (currentStep) {
      case 0:
        return (
          <StepDevice
            value={formData.deviceType}
            onChange={updateFormData}
            onNext={nextStep}
          />
        )
      case 1:
        return (
          <StepUsage
            value={formData.usageType}
            detailValue={formData.usageDetail}
            onChange={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 2:
        return (
          <StepBudget
            formData={formData}
            onChange={updateFormData}
            onSubmit={submit}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
          />
        )
      case 3:
        return (
          <ResultsView
            recommendations={recommendations}
            formData={formData}
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
            onReset={reset}
          />
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ minHeight: '80vh' }}>
      {/* Stepper navigation */}
      <StepperHeader
        currentStep={currentStep}
        formData={formData}
        onStepClick={goToStep}
      />

      {/* Main content */}
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStep()}
      </Box>
    </Box>
  )
}

export default RequirementsPage
