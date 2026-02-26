import Link from "next/link"
import type { FooterLinkItem } from "@/lib/firestore/getFooterData"

export default function FooterLegal({ items, siteName }: { items: FooterLinkItem[]; siteName: string }) {
  return (
    <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-200 sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
      <div className="flex flex-wrap items-center gap-3">
        {items.map((item) => (
          <Link key={item.id} href={item.url} className="transition-colors duration-300 hover:text-white">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
