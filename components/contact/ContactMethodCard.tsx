import Image from "next/image"
import type { ContactMethod } from "@/lib/firestore/getContactData"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

function normalizeLink(platform: string, value: string) {
  const lower = platform.toLowerCase()
  if (/^https?:|^mailto:|^tel:/.test(value)) return value
  if (lower.includes("email")) return `mailto:${value}`
  if (lower.includes("whatsapp")) return `https://wa.me/${value.replace(/[^\d]/g, "")}`
  if (lower.includes("telegram")) return `https://t.me/${value.replace(/^@/, "")}`
  if (lower.includes("phone")) return `tel:${value}`
  return value
}

export default function ContactMethodCard({ method }: { method: ContactMethod }) {
  const href = normalizeLink(method.platform, method.value)
  const icon = resolveFirebaseImageUrl(method.iconUrl)
  return (
    <a href={href} target={href.startsWith("mailto:") || href.startsWith("tel:") ? undefined : "_blank"} rel={href.startsWith("mailto:") || href.startsWith("tel:") ? undefined : "noreferrer"} className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-section-alt)]">
          {icon ? <Image src={icon} alt={method.platform} fill className="object-cover" sizes="44px" unoptimized /> : <span className="text-sm font-semibold text-[var(--color-body)]">{method.platform.slice(0,1).toUpperCase()}</span>}
        </div>
        <p className="text-base font-semibold text-[var(--color-heading)]">{method.platform}</p>
      </div>
      <p className="text-xs text-[var(--color-muted)]">Connect via {method.platform}</p>
      <p className="mt-1 break-all text-sm text-[var(--color-body)]">{method.value}</p>
    </a>
  )
}
