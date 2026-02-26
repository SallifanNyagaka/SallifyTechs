import { useState } from "react"

export default function ExpandableText({
  text,
  max = 180,
}: {
  text: string
  max?: number
}) {
  const [open, setOpen] = useState(false)
  const short = text.length > max ? `${text.slice(0, max)}...` : text
  return (
    <div>
      <p className="text-sm text-[var(--color-body)]">{open ? text : short}</p>
      {text.length > max ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
        >
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  )
}
