"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Sallify Assistant. Ask about services, pricing ranges, timelines, or how to start your project.",
    },
  ])

  const visibleMessages = useMemo(() => messages.slice(-10), [messages])
  const quickActions = useMemo(
    () => [
      { label: "View Services", href: "/services" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Our Process", href: "/process" },
      { label: "Contact Us", href: "/contact" },
      { label: "Start Project", href: "/contact#project-form" },
    ],
    []
  )

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: "user" as const, content: text }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(1),
        }),
      })

      const data = (await response.json()) as { reply?: string; error?: string }
      const reply =
        data.reply?.trim() ||
        data.error?.trim() ||
        "I’m unavailable right now. Please use the contact form and the team will help you."

      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection issue. Please retry or use the contact form.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:right-5">
      {open ? (
        <section className="w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-2xl">
          <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-section-alt)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--color-heading)]">Sallify Assistant</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-xs text-[var(--color-body)] transition hover:bg-[var(--color-bg)]"
              aria-label="Close assistant"
            >
              Close
            </button>
          </header>

          <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs font-medium text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-heading)]"
                >
                  {action.label}
                </Link>
              ))}
            </div>

            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-on-dark)]"
                    : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-body)]"
                }
              >
                {message.content}
              </div>
            ))}
            {loading ? (
              <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-body)]">
                Typing...
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="border-t border-[var(--color-border)] p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your project..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-body)] outline-none transition focus:border-[var(--color-primary)]"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-dark)] shadow-lg transition hover:bg-[var(--color-primary-hover)]"
          aria-label="Open chat assistant"
        >
          Chat with us
        </button>
      )}
    </div>
  )
}
