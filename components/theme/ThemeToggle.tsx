"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/context/ThemeProvider"

type Mode = "light" | "dark" | "system"

const options: { mode: Mode; label: string }[] = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  { mode: "system", label: "System" },
]

export default function ThemeToggle() {
  const { mode, setMode } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener("mousedown", onPointerDown)
    return () => window.removeEventListener("mousedown", onPointerDown)
  }, [])

  const activeLabel = options.find((item) => item.mode === mode)?.label || "System"

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Select theme"
        className="inline-flex min-w-24 items-center justify-between gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-section-alt)] px-3 py-1.5 text-xs font-semibold text-[var(--color-heading)] transition hover:border-[var(--color-primary)]"
      >
        <span>{activeLabel}</span>
        <span className="text-[10px]">v</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-36 rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] p-1 shadow-xl"
        >
          {options.map((option) => {
            const active = mode === option.mode
            return (
              <button
                key={option.mode}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setMode(option.mode)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-[var(--color-primary)] text-[var(--color-on-dark)]"
                    : "text-[var(--color-body)] hover:bg-[var(--color-section-alt)] hover:text-[var(--color-heading)]"
                }`}
              >
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
