import Image from "next/image"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

type ServiceHeroProps = {
  title?: string
  shortDescription?: string
  heroImage?: string
}

export default function ServiceHero({ title, shortDescription, heroImage }: ServiceHeroProps) {
  const imageSrc = resolveFirebaseImageUrl(heroImage) || "/favicon.ico"

  return (
    <section className="grid gap-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-10">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Service</p>
        <h1 className="text-3xl font-semibold leading-tight text-[var(--color-heading)] sm:text-4xl lg:text-5xl">{title || ""}</h1>
        <p className="max-w-2xl text-base text-[var(--color-body)] sm:text-lg">{shortDescription || ""}</p>
      </div>
      <div className="relative h-64 overflow-hidden rounded-2xl sm:h-80">
        <Image
          src={imageSrc}
          alt={title || "Service image"}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 40vw"
          unoptimized
        />
      </div>
    </section>
  )
}
