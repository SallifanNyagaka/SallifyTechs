"use client"

import { useFormContext } from "react-hook-form"
import { ProjectFormValues } from "@/components/forms/types"

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)]"

export default function StepClientInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProjectFormValues>()

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-[var(--color-heading)]">Client Information</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--color-body)]">
          Full Name
          <input className={inputClass} {...register("client_info.name")} />
          {errors.client_info?.name ? <span className="text-xs text-red-500">{errors.client_info.name.message}</span> : null}
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Email
          <input type="email" className={inputClass} {...register("client_info.email")} />
          {errors.client_info?.email ? <span className="text-xs text-red-500">{errors.client_info.email.message}</span> : null}
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Phone / WhatsApp
          <input className={inputClass} {...register("client_info.phone")} />
          {errors.client_info?.phone ? <span className="text-xs text-red-500">{errors.client_info.phone.message}</span> : null}
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Company / Organization
          <input className={inputClass} {...register("client_info.company")} />
          {errors.client_info?.company ? <span className="text-xs text-red-500">{errors.client_info.company.message}</span> : null}
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Country
          <input className={inputClass} {...register("client_info.country")} />
          {errors.client_info?.country ? <span className="text-xs text-red-500">{errors.client_info.country.message}</span> : null}
        </label>
        <label className="text-sm text-[var(--color-body)]">
          Timezone
          <input placeholder="Africa/Nairobi" className={inputClass} {...register("client_info.timezone")} />
          {errors.client_info?.timezone ? <span className="text-xs text-red-500">{errors.client_info.timezone.message}</span> : null}
        </label>
      </div>

      <label className="text-sm text-[var(--color-body)]">
        Preferred Contact Method
        <select className={inputClass} {...register("communication_preference")}>
          <option value="">Select method</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="Video Call">Video Call</option>
        </select>
        {errors.communication_preference ? <span className="text-xs text-red-500">{errors.communication_preference.message}</span> : null}
      </label>
    </div>
  )
}
