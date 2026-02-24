/**
 * OnboardingWizardContainer - Orchestrates steps, state, navigation, persistence.
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { ProgressBar } from './progress-bar'
import { StepCard } from './step-card'
import { IntegrationsConnectorsPanel } from './integrations-connectors-panel'
import { ModuleSelectorPanel } from './module-selector-panel'
import { DataImportPanel } from './data-import-panel'
import { CronjobTemplatePicker } from './cronjob-template-picker'
import { SummaryPanel } from './summary-panel'
import { TutorialVideosGallery } from './tutorial-videos-gallery'
import { useOnboardingStore } from '@/store/onboarding-store'
import { useCompleteOnboarding } from '@/hooks/use-onboarding'
import { createCronjob, saveProgress } from '@/api/onboarding'
import { STEPS } from '@/store/onboarding-store'

const TOTAL_STEPS = STEPS.length

export function OnboardingWizardContainer() {
  const navigate = useNavigate()
  const {
    stepIndex,
    currentStepKey,
    state,
    nextStep,
    prevStep,
    goToStep,
    isCompleting,
    setCompleting,
  } = useOnboardingStore()

  const { complete } = useCompleteOnboarding()
  const cronjob = state.cronjob

  const currentStep = stepIndex + 1
  const canGoBack = stepIndex > 0
  const isLastStep = stepIndex === TOTAL_STEPS - 1

  const goNext = useCallback(() => {
    if (stepIndex < TOTAL_STEPS - 1) {
      nextStep()
      saveProgress(state as unknown as Record<string, unknown>).catch(() => {})
    }
  }, [stepIndex, nextStep, state])

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      prevStep()
      saveProgress(state as unknown as Record<string, unknown>).catch(() => {})
    }
  }, [stepIndex, prevStep, state])

  const handleGoToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= TOTAL_STEPS) {
        goToStep(step - 1)
        saveProgress(state as unknown as Record<string, unknown>).catch(() => {})
      }
    },
    [goToStep, state]
  )

  const handleComplete = useCallback(async () => {
    setCompleting(true)

    const templateId = cronjob?.template_id ?? (cronjob as { template_id?: string })?.template_id
    if (templateId) {
      const result = await createCronjob({
        template_id: templateId,
        inputs: cronjob?.input_payload,
        timezone: cronjob?.timezone,
        permissions: cronjob?.permissions,
        safety_rails: cronjob?.safety_rails,
      })
      if (!result.ok) {
        toast.error('Failed to create cronjob. You can create one later from the dashboard.')
      }
    }

    const redirect = await complete()
    setCompleting(false)

    if (redirect) {
      navigate(redirect, { replace: true })
    }
  }, [cronjob, complete, navigate, setCompleting])

  return (
    <div
      className="min-h-screen p-4 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #18191C 0%, #1F2124 50%, #232429 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome to LifeOps</h1>
          <p className="text-[#AEB2B8] mt-1">
            Let&apos;s get you set up in a few steps. You can revisit any step before launching.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar currentStepKey={currentStepKey} currentStep={currentStep} onStepClick={handleGoToStep} />
        </div>

        {/* Step content */}
        <div className="space-y-6">
          {stepIndex === 0 && (
            <StepCard
              title="Welcome & Overview"
              description="LifeOps is your modular multi-agent AI operating system. Connect integrations, choose modules, import data, and create your first automation."
              tip="Tip: You can skip optional steps and complete them later from the dashboard."
            >
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  This wizard will guide you through:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>Connecting integrations (GitHub, CI/CD, Plaid, Stripe, HealthKit)</li>
                  <li>Choosing modules (Projects, Content, Finance, Health)</li>
                  <li>Importing sample or real data</li>
                  <li>Creating your first cronjob or workflow</li>
                  <li>Watching optional tutorial videos</li>
                </ul>
                <Button
                  size="lg"
                  onClick={goNext}
                  className="w-full min-h-[44px]"
                  aria-label="Begin setup"
                >
                  Begin Setup
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </StepCard>
          )}

          {stepIndex === 1 && (
            <StepCard
              title="Connect Integrations"
              description="Link your tools and accounts securely via OAuth."
            >
              <IntegrationsConnectorsPanel />
            </StepCard>
          )}

          {stepIndex === 2 && (
            <StepCard
              title="Choose Modules"
              description="Select which areas to automate."
            >
              <ModuleSelectorPanel />
            </StepCard>
          )}

          {stepIndex === 3 && (
            <StepCard
              title="Import Data"
              description="Bring in sample or real data from connected sources."
            >
              <DataImportPanel />
            </StepCard>
          )}

          {stepIndex === 4 && (
            <StepCard
              title="Create First Cronjob"
              description="Set up your first automated workflow."
            >
              <CronjobTemplatePicker />
            </StepCard>
          )}

          {stepIndex === 5 && (
            <StepCard
              title="Tutorial Videos"
              description="Learn the basics with these short videos."
            >
              <TutorialVideosGallery />
            </StepCard>
          )}

          {stepIndex === 6 && (
            <StepCard
              title="Summary & Start"
              description="Review your setup and launch LifeOps."
            >
              <SummaryPanel
                onStart={handleComplete}
                onBackToStep={handleGoToStep}
                isCompleting={isCompleting}
              />
            </StepCard>
          )}

          {/* Navigation - hide on step 1 (has its own CTA) and step 7 (summary has CTA) */}
          {stepIndex !== 0 && stepIndex !== 6 && (
            <div className="flex justify-between gap-4 pt-4">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={!canGoBack}
                className="min-h-[44px]"
                aria-label="Go back"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={goNext}
                className="min-h-[44px]"
                aria-label={isLastStep ? 'Complete' : 'Next step'}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
