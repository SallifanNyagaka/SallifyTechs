import React from "react"

export default function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay-soft)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-[var(--color-heading)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--color-body)]">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
