import Link from "next/link"

export default function BlogCTA() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-section)] via-[var(--color-section-alt)] to-[var(--color-bg)] p-8 text-[var(--color-heading)] shadow-sm dark:from-[var(--color-footer)] dark:via-[var(--color-section-alt)] dark:to-[var(--color-footer)] dark:text-[var(--color-on-dark)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] dark:text-[var(--color-muted-on-dark)]">
            Work With Sallify
          </p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Ready to Build Something Valuable?</h2>
          <p className="max-w-2xl text-sm text-[var(--color-body)] dark:text-[var(--color-body-on-dark)] sm:text-base">
            If this insight reflects the direction you want for your product, we can help you scope and deliver the next phase.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-5 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] dark:bg-[var(--color-section)] dark:text-[var(--color-heading)] dark:hover:bg-[var(--color-section-alt)]"
          >
            Contact Sallify Technologies
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-heading)] dark:border-[var(--color-border-on-dark)] dark:text-[var(--color-on-dark)] dark:hover:border-[var(--color-on-dark)] dark:hover:bg-[var(--color-on-dark)]/10"
          >
            Start Your Project
          </Link>
        </div>
      </div>
    </section>
  )
}
