"use client"

import { createContext, useContext } from "react"

type ProjectFormContextValue = {
  currentStep: number
  totalSteps: number
  goNext: () => void
  goBack: () => void
  goToStep: (step: number) => void
}

export const ProjectFormContext = createContext<ProjectFormContextValue | null>(null)

export function useProjectFormContext() {
  const context = useContext(ProjectFormContext)
  if (!context) {
    throw new Error("useProjectFormContext must be used within ProjectFormContext provider")
  }
  return context
}
