import { useState } from "react"

export default function ExpandableGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-semibold text-[var(--color-heading)]"
      >
        {title}
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
  )
}
