export default function TestimonialHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-section)] via-[var(--color-section-alt)] to-[var(--color-bg)] px-6 py-14 text-[var(--color-heading)] shadow-lg dark:from-[var(--color-footer)] dark:via-[var(--color-section-alt)] dark:to-[var(--color-footer)] dark:text-[var(--color-on-dark)] sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />

      <div className="relative z-10 max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] dark:text-[var(--color-muted-on-dark)]">
          Sallify Success Stories
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Success Stories from Our Clients
        </h1>
        <p className="text-sm text-[var(--color-body)] dark:text-[var(--color-body-on-dark)] sm:text-base lg:text-lg">
          Real teams, measurable outcomes, and long-term partnerships. See how Sallify Technologies helps clients
          ship faster and grow with confidence.
        </p>
      </div>
    </section>
  )
}
