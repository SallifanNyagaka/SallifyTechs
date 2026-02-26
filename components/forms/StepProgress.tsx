"use client"

type StepProgressProps = {
  currentStep: number
  totalSteps: number
}

export default function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  const ratio = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100))

  return (
    <div className="sticky top-16 z-20 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-heading)]">Step {currentStep} of {totalSteps}</p>
        <p className="text-xs text-[var(--color-muted)]">{Math.round(ratio)}% complete</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-section-alt)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  )
}
