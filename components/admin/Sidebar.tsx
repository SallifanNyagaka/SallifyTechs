import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Homepage", href: "/admin/homepage" },
  { label: "About Page", href: "/admin/about" },
  { label: "Services", href: "/admin/services" },
  { label: "Portfolio", href: "/admin/portfolio" },
  { label: "Blog", href: "/admin/blogs" },
  { label: "Process", href: "/admin/process" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "Contacts", href: "/admin/contacts" },
  { label: "Footer", href: "/admin/footer" },
  { label: "Project Requests", href: "/admin/project-requests" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Invoices", href: "/admin/invoices" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Media", href: "/admin/media" },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  return (
    <>
      {isOpen ? <button type="button" onClick={onClose} className="fixed inset-0 z-30 bg-[var(--color-overlay-soft)] lg:hidden" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[86vw] border-r border-[var(--color-border)] bg-[var(--color-section)] p-6 transition-transform duration-200 lg:static lg:w-64 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold text-[var(--color-heading)]">Sallify Admin</p>
            <p className="text-xs text-[var(--color-muted)]">CMS Dashboard</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs lg:hidden">Close</button>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block rounded-xl px-4 py-2 text-sm font-medium transition ${active ? "bg-[var(--color-primary)] text-[var(--color-on-dark)]" : "text-[var(--color-body)] hover:bg-[var(--color-section-alt)]"}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
