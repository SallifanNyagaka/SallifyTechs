import Image from "next/image"
import Link from "next/link"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

type FooterBrandProps = {
  siteName: string
  description: string
  logoUrl?: string
}

export default function FooterBrand({ siteName, description, logoUrl }: FooterBrandProps) {
  const resolvedLogo = resolveFirebaseImageUrl(logoUrl)

  return (
    <div className="space-y-4">
      <Link href="/" className="inline-flex items-center gap-3 text-white">
        <span className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/15 bg-white/5 md:h-16 md:w-16">
          {resolvedLogo ? (
            <Image
              src={resolvedLogo}
              alt={`${siteName} logo`}
              fill
              className="object-contain p-1.5"
              unoptimized
              sizes="(max-width: 768px) 56px, 64px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold">
              {siteName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">{siteName}</span>
      </Link>
      <p className="max-w-sm text-sm leading-relaxed text-slate-200">{description}</p>
    </div>
  )
}
