import Link from "next/link"
import type { FooterLinkGroup } from "@/lib/firestore/getFooterData"

export default function FooterLinks({ groups }: { groups: FooterLinkGroup[] }) {
  if (!groups.length) return null

  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100" style={{ color: "#f1f5f9" }}>
            {group.category}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {group.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.url}
                  className="text-sm text-slate-100 transition-colors duration-300 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                  style={{ color: "#f1f5f9" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
