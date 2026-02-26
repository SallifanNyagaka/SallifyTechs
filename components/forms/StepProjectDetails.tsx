"use client"

import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { ProjectFormValues } from "@/components/forms/types"

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)]"

const featureOptions = [
  "Authentication and user roles",
  "Admin dashboard",
  "Payments and billing",
  "Third-party API integrations",
  "Analytics and reporting",
  "SEO optimization",
  "Multilingual support",
  "Performance optimization",
]

export default function StepProjectDetails() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProjectFormValues>()

  const projectType = watch("project_overview.type").toLowerCase()
  const selectedFeatures = watch("requirements.features") || []

  const isWebsite = useMemo(() => projectType.includes("web"), [projectType])
  const isMobile = useMemo(() => projectType.includes("mobile"), [projectType])
  const isSystem = useMemo(() => projectType.includes("system"), [projectType])

  const toggleFeature = (feature: string) => {
    const next = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((item) => item !== feature)
      : [...selectedFeatures, feature]

    setValue("requirements.features", next, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-[var(--color-heading)]">Detailed Project Requirements</h3>

      <label className="block text-sm text-[var(--color-body)]">
        Detailed Description
        <textarea
          className={`${inputClass} min-h-36`}
          placeholder="Explain the problem you want to solve, required functionality, expected users, and any must-have outcomes."
          {...register("requirements.description")}
        />
        {errors.requirements?.description ? <span className="text-xs text-red-500">{errors.requirements.description.message}</span> : null}
      </label>

      <div>
        <p className="text-sm text-[var(--color-body)]">Key Features Needed</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {featureOptions.map((feature) => {
            const active = selectedFeatures.includes(feature)
            return (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-heading)]"
                    : "border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-primary)]"
                }`}
              >
                {feature}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--color-body)]">
          Target Audience
          <input className={inputClass} {...register("requirements.target_audience")} />
          {errors.requirements?.target_audience ? <span className="text-xs text-red-500">{errors.requirements.target_audience.message}</span> : null}
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Business Goals
          <input className={inputClass} {...register("requirements.goals")} />
          {errors.requirements?.goals ? <span className="text-xs text-red-500">{errors.requirements.goals.message}</span> : null}
        </label>
      </div>

      <label className="block text-sm text-[var(--color-body)]">
        Example Websites / Inspirations
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="Paste links or describe references you like and what specifically should be emulated."
          {...register("requirements.examples")}
        />
      </label>

      <label className="block text-sm text-[var(--color-body)]">
        Do you have existing branding?
        <select className={inputClass} {...register("requirements.has_branding")}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        {errors.requirements?.has_branding ? <span className="text-xs text-red-500">{errors.requirements.has_branding.message}</span> : null}
      </label>

      {isWebsite ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[var(--color-body)]">
            Number of pages
            <input type="number" min={1} className={inputClass} {...register("requirements.website_pages", { valueAsNumber: true })} />
          </label>
          <label className="text-sm text-[var(--color-body)]">
            CMS needed?
            <select className={inputClass} {...register("requirements.website_needs_cms")}>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
      ) : null}

      {isMobile ? (
        <label className="block text-sm text-[var(--color-body)]">
          Mobile platform
          <select className={inputClass} {...register("requirements.mobile_platform")}>
            <option value="">Select</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
            <option value="both">Both</option>
          </select>
        </label>
      ) : null}

      {isSystem ? (
        <label className="block text-sm text-[var(--color-body)]">
          Integrations required?
          <textarea
            className={`${inputClass} min-h-24`}
            placeholder="List required integrations (ERP, CRM, payment gateways, APIs, internal tools, etc.)."
            {...register("requirements.system_integrations")}
          />
        </label>
      ) : null}
    </div>
  )
}
