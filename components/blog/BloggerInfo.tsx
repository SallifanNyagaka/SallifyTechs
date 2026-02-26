import Image from "next/image"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

export default function BloggerInfo({ name, photoUrl, dateLabel }: { name?: string; photoUrl?: string; dateLabel?: string }) {
  const avatar = resolveFirebaseImageUrl(photoUrl) || "/favicon.ico"
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[var(--color-border)]">
        <Image src={avatar} alt={name || "Author"} fill className="object-cover" unoptimized />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--color-heading)]">{name || "Sallify Team"}</p>
        <p className="text-xs text-[var(--color-muted)]">{dateLabel || ""}</p>
      </div>
    </div>
  )
}
