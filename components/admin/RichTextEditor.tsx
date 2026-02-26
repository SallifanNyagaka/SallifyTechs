import React, { useRef } from "react"

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    if (ref.current) onChange(ref.current.innerHTML)
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)]">
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] px-3 py-2">
        <button type="button" onClick={() => exec("bold")} className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs">Bold</button>
        <button type="button" onClick={() => exec("italic")} className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs">Italic</button>
        <button type="button" onClick={() => exec("formatBlock", "H2")} className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs">H2</button>
        <button type="button" onClick={() => exec("formatBlock", "H3")} className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs">H3</button>
      </div>
      <div
        ref={ref}
        contentEditable
        className="min-h-[180px] px-4 py-3 text-sm text-[var(--color-heading)] outline-none"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
      />
    </div>
  )
}
