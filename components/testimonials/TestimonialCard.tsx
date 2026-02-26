import Image from "next/image"
import { TestimonialRecord } from "@/lib/firestore/getTestimonials"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

function Stars({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(5, Math.round(value)))
  return <span className="text-[var(--color-secondary)]">{"★".repeat(clamped)}{"☆".repeat(5 - clamped)}</span>
}

export default function TestimonialCard({ item }: { item: TestimonialRecord }) {
  const photo = resolveFirebaseImageUrl(item.photoUrl) || "/favicon.ico"

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[var(--color-border)]">
          <Image src={photo} alt={item.name} fill className="object-cover" sizes="48px" unoptimized />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-heading)]">{item.name}</p>
          <p className="text-xs text-[var(--color-muted)]">{item.role}</p>
        </div>
      </div>
      {item.rating ? (
        <div className="mb-2 text-sm">
          <Stars value={item.rating} />
        </div>
      ) : null}
      <p className="text-sm leading-6 text-[var(--color-body)]">{item.content}</p>
    </article>
  )
}
