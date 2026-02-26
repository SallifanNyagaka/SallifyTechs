"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

type Toast = { id: number; message: string; type?: "success" | "error" }

const ToastContext = createContext<{ notify: (message: string, type?: "success" | "error") => void } | null>(null)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[60] space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`rounded-lg px-4 py-2 text-sm text-[var(--color-on-dark)] shadow ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
