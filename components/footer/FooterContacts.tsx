import type { FooterContact } from "@/lib/firestore/getFooterData"

export default function FooterContacts({ contacts }: { contacts: FooterContact }) {
  if (!contacts.email && !contacts.phone && !contacts.address) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100" style={{ color: "#f1f5f9" }}>
        {contacts.contactText || "Contact"}
      </h3>
      <div className="space-y-2 text-sm text-slate-200">
        {contacts.email ? (
          <a
            href={`mailto:${contacts.email}`}
            className="block break-all transition-colors duration-300 hover:text-cyan-300"
          >
            {contacts.email}
          </a>
        ) : null}
        {contacts.phone ? (
          <a href={`tel:${contacts.phone}`} className="block transition-colors duration-300 hover:text-cyan-300">
            {contacts.phone}
          </a>
        ) : null}
        {contacts.address ? <p className="text-slate-200">{contacts.address}</p> : null}
      </div>
    </div>
  )
}
