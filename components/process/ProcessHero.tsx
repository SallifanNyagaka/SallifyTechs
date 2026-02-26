import Image from "next/image"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

type ProcessHeroProps = {
  title?: string
  description?: string
  backgroundImage?: string
}

export default function ProcessHero({ title, description, backgroundImage }: ProcessHeroProps) {
  const bg = resolveFirebaseImageUrl(backgroundImage)

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-section)] via-[var(--color-section-alt)] to-[var(--color-bg)] px-6 py-14 text-[var(--color-heading)] shadow-lg dark:from-[var(--color-footer)] dark:via-[var(--color-section-alt)] dark:to-[var(--color-footer)] dark:text-[var(--color-on-dark)] sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />
      {bg ? (
        <Image src={bg} alt="Process background" fill className="object-cover opacity-10 dark:opacity-20" sizes="100vw" unoptimized />
      ) : null}
      <div className="relative z-10 max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{title || ""}</h1>
        <p className="text-sm text-[var(--color-body)] dark:text-[var(--color-body-on-dark)] sm:text-base lg:text-lg">{description || ""}</p>
      </div>
    </section>
  )
}
