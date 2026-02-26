import Link from "next/link"

type PortfolioHeroProps = {
  projectCount: number
  featuredCount: number
}

export default function PortfolioHero({ projectCount, featuredCount }: PortfolioHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-section)] via-[var(--color-section-alt)] to-[var(--color-bg)] px-6 py-14 text-[var(--color-heading)] shadow-xl dark:from-[var(--color-footer)] dark:via-[var(--color-section-alt)] dark:to-[var(--color-footer)] dark:text-[var(--color-on-dark)] sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />
      <div className="relative z-10 max-w-4xl space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] dark:text-[var(--color-muted-on-dark)]">Sallify Technologies Portfolio</p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Proven Digital Delivery Across Products, Platforms, and Growth Systems
        </h1>
        <p className="max-w-3xl text-sm text-[var(--color-body)] dark:text-[var(--color-body-on-dark)] sm:text-base lg:text-lg">
          Browse {projectCount} project engagements, including {featuredCount} featured case studies that show how we design, build, and scale real business outcomes.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-5 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] dark:bg-[var(--color-section)] dark:text-[var(--color-heading)] dark:hover:bg-[var(--color-section-alt)]"
          >
            Start Your Project
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-heading)] dark:border-[var(--color-border-on-dark)] dark:text-[var(--color-on-dark)] dark:hover:border-[var(--color-on-dark)] dark:hover:bg-[var(--color-on-dark)]/10"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </section>
  )
}
