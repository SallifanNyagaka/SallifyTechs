import Image from "next/image"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"
import type { FooterSocial } from "@/lib/firestore/getFooterData"

function opensExternally(url: string) {
  return !url.startsWith("mailto:") && !url.startsWith("tel:")
}

export default function FooterSocials({ socials }: { socials: FooterSocial[] }) {
  if (!socials.length) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100" style={{ color: "#f1f5f9" }}>
        Follow Us
      </h3>
      <div className="flex flex-wrap gap-2">
        {socials.map((social) => {
          const icon = resolveFirebaseImageUrl(social.iconUrl)
          const external = opensExternally(social.url)
          return (
            <a
              key={social.id}
              href={social.url}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              aria-label={social.platform}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition duration-300 hover:border-cyan-300/60 hover:bg-cyan-400/10 hover:text-cyan-200"
            >
              <span className="relative h-4 w-4 overflow-hidden rounded-sm">
                {icon ? (
                  <Image src={icon} alt={social.platform} fill className="object-contain" unoptimized sizes="16px" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-100">
                    {social.platform.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </span>
              {social.platform}
            </a>
          )
        })}
      </div>
    </div>
  )
}
