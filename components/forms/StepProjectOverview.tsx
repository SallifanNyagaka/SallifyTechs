"use client"

import { useEffect, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { ProjectFormValues, ServiceOption } from "@/components/forms/types"

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)]"

export default function StepProjectOverview({ serviceOptions }: { serviceOptions: ServiceOption[] }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProjectFormValues>()

  const selectedType = watch("project_overview.type")

  const selectedService = useMemo(
    () => serviceOptions.find((item) => item.label === selectedType),
    [selectedType, serviceOptions]
  )

  useEffect(() => {
    setValue("project_overview.service_id", selectedService?.id || "", { shouldDirty: true })
  }, [selectedService?.id, setValue])

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-[var(--color-heading)]">Project Overview</h3>

      <label className="block text-sm text-[var(--color-body)]">
        Project Title
        <input className={inputClass} {...register("project_overview.title")} />
        {errors.project_overview?.title ? <span className="text-xs text-red-500">{errors.project_overview.title.message}</span> : null}
      </label>

      <label className="block text-sm text-[var(--color-body)]">
        Project Type
        <select className={inputClass} {...register("project_overview.type")}>
          <option value="">Select service type</option>
          {serviceOptions.map((option) => (
            <option key={option.id} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.project_overview?.type ? <span className="text-xs text-red-500">{errors.project_overview.type.message}</span> : null}
      </label>

      <label className="block text-sm text-[var(--color-body)]">
        Short Project Summary
        <textarea
          className={`${inputClass} min-h-28`}
          placeholder="Briefly describe the project idea, intended outcome, and what success looks like."
          {...register("project_overview.summary")}
        />
        {errors.project_overview?.summary ? <span className="text-xs text-red-500">{errors.project_overview.summary.message}</span> : null}
      </label>

      <label className="block text-sm text-[var(--color-body)]">
        Is this a new project or redesign?
        <select className={inputClass} {...register("project_overview.is_redesign")}>
          <option value="">Select one</option>
          <option value="new">New Project</option>
          <option value="redesign">Redesign</option>
        </select>
        {errors.project_overview?.is_redesign ? <span className="text-xs text-red-500">{errors.project_overview.is_redesign.message}</span> : null}
      </label>

      <input type="hidden" {...register("project_overview.service_id")} />
    </div>
  )
}
