import Image from "next/image"
import Link from "next/link"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

type ServiceCardProps = {
  title?: string
  slug?: string
  shortDescription?: string
  heroImage?: string
}

export default function ServiceCard({ title, slug, shortDescription, heroImage }: ServiceCardProps) {
  const href = `/services/${slug || ""}`
  const imageSrc = resolveFirebaseImageUrl(heroImage) || "/favicon.ico"

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={title || "Service image"}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          unoptimized
        />
      </div>
      <div className="space-y-3 p-5">
        <h2 className="text-xl font-semibold text-[var(--color-heading)]">{title || ""}</h2>
        <p className="line-clamp-3 text-sm text-[var(--color-body)]">{shortDescription || ""}</p>
        <Link
          href={href}
          scroll
          className="inline-flex items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-heading)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-footer)] hover:text-[var(--color-on-dark)]"
        >
          Explore Service
        </Link>
      </div>
    </article>
  )
}
