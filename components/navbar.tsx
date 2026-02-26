"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { doc, onSnapshot } from "firebase/firestore"
import ThemeToggle from "@/components/theme/ThemeToggle"
import { firestore } from "@/lib/firebase"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

type SiteSettings = {
  siteName?: string
  logo?: string
  logoUrl?: string
  branding?: {
    logo?: string
  }
}

type NavItem = {
  name: string
  href: string
  sections: { name: string; href: string }[]
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null)
  const [siteName, setSiteName] = useState("Sallify Technologies")
  const [logoUrl, setLogoUrl] = useState("")
  const pathname = usePathname()

  useEffect(() => {
    const unsub = onSnapshot(
      doc(firestore, "settings", "site"),
      (snapshot) => {
        if (!snapshot.exists()) {
          setSiteName("Sallify Technologies")
          setLogoUrl("")
          return
        }

        const data = snapshot.data() as SiteSettings
        const logoCandidate = data.branding?.logo || data.logo || data.logoUrl || ""

        setSiteName(data.siteName || "Sallify Technologies")
        setLogoUrl(resolveFirebaseImageUrl(logoCandidate) || "")
      },
      () => {
        setSiteName("Sallify Technologies")
      }
    )

    return () => unsub()
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsOpen(false)
      setMobileOpenSection(null)
      setActiveDropdown(null)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  const links = useMemo<NavItem[]>(
    () => [
      {
        name: "Home",
        href: "/",
        sections: [
          { name: "Hero", href: "/#home-hero" },
          { name: "Services", href: "/#home-services" },
          { name: "Why Choose Us", href: "/#home-why-choose-us" },
          { name: "Featured Projects", href: "/#home-featured-projects" },
          { name: "Process", href: "/#home-process" },
          { name: "Call To Action", href: "/#home-cta" },
        ],
      },
      {
        name: "About",
        href: "/about",
        sections: [
          { name: "Introduction", href: "/about#about-hero" },
          { name: "Our Journey", href: "/about#about-journey" },
          { name: "Core Values", href: "/about#about-values" },
          { name: "Team", href: "/about#about-team" },
          { name: "Stats", href: "/about#about-stats" },
          { name: "Call To Action", href: "/about#about-cta" },
        ],
      },
      {
        name: "Services",
        href: "/services",
        sections: [
          { name: "Hero", href: "/services#services-hero" },
          { name: "Service Cards", href: "/services#services-list" },
          { name: "Call To Action", href: "/services#services-cta" },
        ],
      },
      {
        name: "Portfolio",
        href: "/portfolio",
        sections: [
          { name: "Hero", href: "/portfolio#portfolio-hero" },
          { name: "Featured", href: "/portfolio#portfolio-featured" },
          { name: "Project Grid", href: "/portfolio#portfolio-grid" },
          { name: "Project Form", href: "/portfolio#portfolio-form" },
          { name: "Call To Action", href: "/portfolio#portfolio-cta" },
        ],
      },
      {
        name: "Process",
        href: "/process",
        sections: [
          { name: "Hero", href: "/process#process-hero" },
          { name: "Workflow Steps", href: "/process#process-workflow" },
          { name: "FAQs", href: "/process#process-faqs" },
          { name: "Call To Action", href: "/process#process-cta" },
        ],
      },
      {
        name: "Blog",
        href: "/blog",
        sections: [
          { name: "Hero", href: "/blog#blog-hero" },
          { name: "Filters", href: "/blog#blog-filters" },
          { name: "Posts", href: "/blog#blog-posts" },
        ],
      },
      {
        name: "Testimonials",
        href: "/testimonials",
        sections: [
          { name: "Hero", href: "/testimonials#testimonials-hero" },
          { name: "Submission Form", href: "/testimonials#testimonials-form" },
          { name: "Featured", href: "/testimonials#testimonials-featured" },
          { name: "All Testimonials", href: "/testimonials#testimonials-grid" },
          { name: "Call To Action", href: "/testimonials#testimonials-cta" },
        ],
      },
      {
        name: "Contact",
        href: "/contact",
        sections: [
          { name: "Hero", href: "/contact#contact-hero" },
          { name: "Form", href: "/contact#contact-form-section" },
          { name: "Contact Methods", href: "/contact#contact-methods" },
          { name: "Call To Action", href: "/contact#contact-cta" },
        ],
      },
    ],
    []
  )

  const linkClasses = (href: string) =>
    pathname === href
      ? "text-[var(--color-primary)] font-semibold"
      : "text-[var(--color-subheading)] transition-colors duration-300 hover:text-[var(--color-secondary)]"

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-navbar)]/95 text-[var(--color-heading)] shadow-sm backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-section-alt)] md:h-14 md:w-14">
              <Image
                src={logoUrl}
                alt={`${siteName} logo`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 48px, 56px"
                unoptimized
              />
            </span>
          ) : null}
          <span className="truncate text-base font-bold text-[var(--color-heading)] sm:text-lg md:text-xl">
            {siteName}
          </span>
        </Link>

        <div className="hidden items-center gap-3 xl:flex">
          <div className="flex items-center gap-4">
            {links.map((link) => (
              <div
                key={link.name}
                className="group relative"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown((prev) => (prev === link.name ? null : prev))}
              >
                <Link href={link.href} className={`${linkClasses(link.href)} inline-flex items-center gap-1 text-sm`}>
                  {link.name}
                  <span className="text-[10px]">v</span>
                </Link>
                <div
                  className={`absolute left-1/2 top-full z-50 mt-2 w-60 -translate-x-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-2 shadow-xl transition ${
                    activeDropdown === link.name ? "visible opacity-100" : "invisible opacity-0"
                  }`}
                >
                  {link.sections.map((section) => (
                    <Link
                      key={section.href}
                      href={section.href}
                      className="block rounded-xl px-3 py-2 text-sm text-[var(--color-body)] transition hover:bg-[var(--color-section-alt)] hover:text-[var(--color-heading)]"
                    >
                      {section.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <ThemeToggle />

          <Link
            href="/contact#contact-form-section"
            className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]"
          >
            Start Project
          </Link>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <ThemeToggle />
          <button
            className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-subheading)]"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-section)] px-4 py-3 xl:hidden">
          <div className="mb-3">
            <Link
              href="/contact#contact-form-section"
              className="inline-flex rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]"
              onClick={() => setIsOpen(false)}
            >
              Start Project
            </Link>
          </div>

          <div className="space-y-2">
            {links.map((link) => {
              const isExpanded = mobileOpenSection === link.name

              return (
                <div key={link.name} className="rounded-xl border border-[var(--color-border)]">
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[var(--color-subheading)] transition-colors duration-300 hover:text-[var(--color-secondary)]"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                    <button
                      type="button"
                      className="rounded-md px-2 py-1 text-xs font-semibold text-[var(--color-muted)] hover:bg-[var(--color-section-alt)]"
                      onClick={() => setMobileOpenSection((prev) => (prev === link.name ? null : link.name))}
                      aria-expanded={isExpanded}
                      aria-label={`Toggle ${link.name} sections`}
                    >
                      {isExpanded ? "Hide" : "Sections"}
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="grid gap-1 border-t border-[var(--color-border)] px-3 py-2">
                      {link.sections.map((section) => (
                        <Link
                          key={section.href}
                          href={section.href}
                          onClick={() => setIsOpen(false)}
                          className="rounded-lg px-2 py-1 text-xs text-[var(--color-muted)] hover:bg-[var(--color-section-alt)] hover:text-[var(--color-heading)]"
                        >
                          {section.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </nav>
  )
}
