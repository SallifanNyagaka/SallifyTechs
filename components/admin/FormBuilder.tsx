import React from "react"

type Field = {
  name: string
  label: string
  type?: "text" | "textarea" | "number" | "select"
  options?: { label: string; value: string }[]
}

function getByPath(obj: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return ""
  }, obj)
}

export default function FormBuilder({
  fields,
  values,
  onChange,
}: {
  fields: Field[]
  values: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <label key={field.name} className="space-y-2 text-sm text-[var(--color-body)]">
          <span className="font-medium text-[var(--color-subheading)]">{field.label}</span>
          {field.type === "textarea" ? (
            <textarea
              value={String(getByPath(values, field.name) ?? "")}
              onChange={(e) => onChange(field.name, e.target.value)}
              className="min-h-[120px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            />
          ) : field.type === "select" ? (
            <select
              value={String(getByPath(values, field.name) ?? "")}
              onChange={(e) => onChange(field.name, e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            >
              {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              type={field.type || "text"}
              value={String(getByPath(values, field.name) ?? "")}
              onChange={(e) => onChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            />
          )}
        </label>
      ))}
    </div>
  )
}
