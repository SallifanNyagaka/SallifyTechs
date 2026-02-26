import React from "react"

export default function EditorLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-heading)]">{title}</h1>
          {subtitle ? <p className="text-sm text-[var(--color-muted)]">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}
