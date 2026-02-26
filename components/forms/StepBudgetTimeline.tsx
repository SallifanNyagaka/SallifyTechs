"use client"

import { useEffect, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { ProjectFormValues } from "@/components/forms/types"

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)]"

export default function StepBudgetTimeline() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProjectFormValues>()

  const range = watch("budget.range")
  const currency = watch("budget.currency")
  const [usdKesRate, setUsdKesRate] = useState(155)

  useEffect(() => {
    let mounted = true
    const loadRate = async () => {
      try {
        const response = await fetch("/api/exchange-rate")
        const payload = (await response.json().catch(() => ({}))) as { rate?: number }
        if (!mounted) return
        if (Number(payload.rate || 0) > 0) {
          setUsdKesRate(Number(payload.rate))
        }
      } catch {
        // keep fallback rate
      }
    }

    void loadRate()
    return () => {
      mounted = false
    }
  }, [])

  const budgetOptions = useMemo(() => {
    if (currency === "KES") {
      const under500 = Math.round(500 * usdKesRate)
      const min500 = Math.round(500 * usdKesRate)
      const max1500 = Math.round(1500 * usdKesRate)
      const min1500 = Math.round(1500 * usdKesRate)
      const max5000 = Math.round(5000 * usdKesRate)
      const plus5000 = Math.round(5000 * usdKesRate)

      const fmt = (value: number) =>
        `KES ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(value)}`

      return [
        { value: "under_500", label: `Under ${fmt(under500)}` },
        { value: "500_1500", label: `${fmt(min500)} - ${fmt(max1500)}` },
        { value: "1500_5000", label: `${fmt(min1500)} - ${fmt(max5000)}` },
        { value: "5000_plus", label: `${fmt(plus5000)}+` },
      ]
    }

    return [
      { value: "under_500", label: "Under $500" },
      { value: "500_1500", label: "$500 - $1500" },
      { value: "1500_5000", label: "$1500 - $5000" },
      { value: "5000_plus", label: "$5000+" },
    ]
  }, [currency, usdKesRate])

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-[var(--color-heading)]">Budget & Timeline</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--color-body)]">
          Budget Range
          <select className={inputClass} {...register("budget.range")}>
            <option value="">Select range</option>
            {budgetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
          {errors.budget?.range ? <span className="text-xs text-red-500">{errors.budget.range.message}</span> : null}
        </label>

        <label className="text-sm text-[var(--color-body)]">
          Currency
          <select className={inputClass} {...register("budget.currency")}>
            <option value="KES">KES</option>
            <option value="USD">USD</option>
          </select>
        </label>
      </div>

      {range === "custom" ? (
        <label className="block text-sm text-[var(--color-body)]">
          Custom Budget
          <input
            className={inputClass}
            placeholder={currency === "KES" ? "Enter preferred amount in KES" : "Enter preferred amount in USD"}
            {...register("budget.custom_amount")}
          />
        </label>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--color-body)]">
          Desired Start Date
          <input type="date" className={inputClass} {...register("budget.start_date")} />
          {errors.budget?.start_date ? <span className="text-xs text-red-500">{errors.budget.start_date.message}</span> : null}
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Expected Deadline
          <input type="date" className={inputClass} {...register("budget.deadline")} />
          {errors.budget?.deadline ? <span className="text-xs text-red-500">{errors.budget.deadline.message}</span> : null}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--color-body)]">
          Flexible Timeline
          <select className={inputClass} {...register("budget.flexible")}>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.budget?.flexible ? <span className="text-xs text-red-500">{errors.budget.flexible.message}</span> : null}
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Urgent Project?
          <select className={inputClass} {...register("budget.urgent")}>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.budget?.urgent ? <span className="text-xs text-red-500">{errors.budget.urgent.message}</span> : null}
        </label>
      </div>
    </div>
  )
}