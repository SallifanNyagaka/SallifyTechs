"use client"

import { useState } from "react"

type FaqItem = {
  question?: string
  answer?: string
}

type FAQSectionProps = {
  items?: FaqItem[]
}

export default function FAQSection({ items = [] }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[var(--color-heading)]">FAQ</h2>
      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <article key={`${item.question}-${index}`} className="rounded-xl border border-[var(--color-border)]">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-[var(--color-heading)]"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question || ""}</span>
                <span className="text-[var(--color-muted)]">{isOpen ? "-" : "+"}</span>
              </button>
              {isOpen ? (
                <p className="border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-body)]">{item.answer || ""}</p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
