"use client"

import { useFormContext } from "react-hook-form"
import { ProjectFormValues } from "@/components/forms/types"

export default function StepReviewSubmit() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProjectFormValues>()

  const values = watch()

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-[var(--color-heading)]">Review & Submit</h3>
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-4 text-sm text-[var(--color-body)]">
        <p><span className="font-semibold text-[var(--color-heading)]">Client:</span> {values.client_info.name}</p>
        <p><span className="font-semibold text-[var(--color-heading)]">Email:</span> {values.client_info.email}</p>
        <p><span className="font-semibold text-[var(--color-heading)]">Project:</span> {values.project_overview.title}</p>
        <p><span className="font-semibold text-[var(--color-heading)]">Type:</span> {values.project_overview.type}</p>
        <p><span className="font-semibold text-[var(--color-heading)]">Budget:</span> {values.budget.range} ({values.budget.currency})</p>
        <p><span className="font-semibold text-[var(--color-heading)]">Timeline:</span> {values.budget.start_date} to {values.budget.deadline}</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-4">
        <label className="flex items-start gap-3 text-sm text-[var(--color-body)]">
          <input type="checkbox" className="mt-1" {...register("agreements.complexity_timeline")} />
          I understand timelines depend on complexity.
        </label>
        <label className="flex items-start gap-3 text-sm text-[var(--color-body)]">
          <input type="checkbox" className="mt-1" {...register("agreements.provide_materials")} />
          I agree to provide project materials when requested.
        </label>
        <label className="flex items-start gap-3 text-sm text-[var(--color-body)]">
          <input type="checkbox" className="mt-1" {...register("agreements.pricing_varies")} />
          Pricing varies based on requirements.
        </label>
      </div>

      {(errors.agreements?.complexity_timeline ||
        errors.agreements?.provide_materials ||
        errors.agreements?.pricing_varies) ? (
        <p className="text-xs text-red-500">Please accept all agreement checkboxes before submitting.</p>
      ) : null}
    </div>
  )
}
