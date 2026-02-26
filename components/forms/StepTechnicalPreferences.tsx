"use client"

import { useFormContext } from "react-hook-form"
import { ProjectFormValues } from "@/components/forms/types"

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)]"

export default function StepTechnicalPreferences() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProjectFormValues>()

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-[var(--color-heading)]">Design & Technical Preferences</h3>

      <label className="block text-sm text-[var(--color-body)]">
        Preferred Style
        <select className={inputClass} {...register("preferences.style")}>
          <option value="">Select style</option>
          <option value="modern">Modern</option>
          <option value="corporate">Corporate</option>
          <option value="minimal">Minimal</option>
          <option value="creative">Creative</option>
          <option value="luxury">Luxury</option>
        </select>
        {errors.preferences?.style ? <span className="text-xs text-red-500">{errors.preferences.style.message}</span> : null}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--color-body)]">
          Need Branding Help?
          <select className={inputClass} {...register("preferences.branding")}>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Need Hosting?
          <select className={inputClass} {...register("preferences.hosting")}>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Need Maintenance After Launch?
          <select className={inputClass} {...register("preferences.maintenance")}>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="text-sm text-[var(--color-body)]">
          SEO Required?
          <select className={inputClass} {...register("preferences.seo")}>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>

      <label className="block text-sm text-[var(--color-body)]">
        Accessibility Requirements
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="Specify any accessibility standards or requirements (WCAG level, keyboard navigation, screen reader support, etc.)."
          {...register("preferences.accessibility")}
        />
      </label>
    </div>
  )
}
