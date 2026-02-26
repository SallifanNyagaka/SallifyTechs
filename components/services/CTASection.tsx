import Link from "next/link"

type CTASectionProps = {
  text?: string
  buttonText?: string
  buttonHref?: string
}

export default function CTASection({ text, buttonText, buttonHref }: CTASectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-section)] via-[var(--color-section-alt)] to-[var(--color-bg)] p-8 text-[var(--color-heading)] shadow-sm dark:from-[var(--color-footer)] dark:via-[var(--color-section-alt)] dark:to-[var(--color-footer)] dark:text-[var(--color-on-dark)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-base text-[var(--color-body)] dark:text-[var(--color-body-on-dark)] sm:text-lg">{text || ""}</p>
        <Link
          href={buttonHref || "/contact"}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-5 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]"
        >
          {buttonText || "Contact Us"}
        </Link>
      </div>
    </section>
  )
}
