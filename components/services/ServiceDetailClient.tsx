"use client"

import { useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import ServiceHero from "@/components/services/ServiceHero"
import FeatureList from "@/components/services/FeatureList"
import ProcessTimeline from "@/components/services/ProcessTimeline"
import FAQSection from "@/components/services/FAQSection"
import PricingTable from "@/components/services/PricingTable"
import CTASection from "@/components/services/CTASection"
import ServiceCard from "@/components/services/ServiceCard"
import ProjectForm from "@/components/forms/ProjectForm"
import type { ServiceRecord } from "@/lib/firestore/getServices"

export default function ServiceDetailClient({
  service,
  relatedServices,
}: {
  service: ServiceRecord
  relatedServices: ServiceRecord[]
}) {
  const topAnchorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const currentPath = `${window.location.pathname}${window.location.search}`
    if (window.location.hash) window.history.replaceState(null, "", currentPath)

    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"

    const jumpTop = () => {
      topAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "start" })
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }

    jumpTop()
    requestAnimationFrame(jumpTop)
    const timeoutA = window.setTimeout(jumpTop, 120)
    const timeoutB = window.setTimeout(jumpTop, 360)

    return () => {
      window.clearTimeout(timeoutA)
      window.clearTimeout(timeoutB)
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  const description = useMemo(
    () => service.longDescription || service.fullDescription || "",
    [service.fullDescription, service.longDescription]
  )

  const technologies = service.technologies || []

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <div ref={topAnchorRef} />
        <nav className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)] dark:text-[var(--color-subheading)]/90">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/services">Services</Link>
          {service.title ? (
            <>
              <span>/</span>
              <span className="text-[var(--color-heading)] dark:text-[var(--color-heading)]">{service.title}</span>
            </>
          ) : null}
        </nav>

        <ServiceHero
          title={service.title}
          shortDescription={service.shortDescription}
          heroImage={service.heroImage || service.coverImage}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-2xl font-semibold dark:text-[var(--color-heading)]">Overview</h2>
              <p className="mt-4 whitespace-pre-line text-sm text-[var(--color-body)] sm:text-base dark:text-[var(--color-heading)]/85">{description}</p>
            </section>

            <FeatureList title="Feature List" items={service.features} />
            <ProcessTimeline steps={service.process} />

            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-2xl font-semibold dark:text-[var(--color-heading)]">Technologies Used</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-sm text-[var(--color-body)] dark:border-[var(--color-border)] dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]/90"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <PricingTable plans={service.pricingPlans} />
            <FAQSection items={service.faqs} />
            <CTASection text={service.ctaText} buttonText={service.ctaButtonText} buttonHref="/contact" />
            <ProjectForm
              defaultProjectType={service.title}
              title="Request This Service"
              description="Share your requirements and we will respond with scope, timeline, and budget guidance."
              submitLabel="Start My Project"
              formId="service-project-form"
            />

            {relatedServices.length ? (
              <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
                <h2 className="text-2xl font-semibold dark:text-[var(--color-heading)]">Related Services</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {relatedServices.map((item) => (
                    <ServiceCard
                      key={item.id}
                      title={item.title}
                      slug={item.slug}
                      shortDescription={item.shortDescription}
                      heroImage={item.heroImage || item.coverImage}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="sticky top-24 space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h3 className="text-lg font-semibold dark:text-[var(--color-heading)]">Need this service?</h3>
            <p className="text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]/85">Book a call with Sallify Technologies to scope delivery timeline and budget.</p>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]"
            >
              Contact Sales
            </Link>
          </aside>
        </div>
      </section>
    </main>
  )
}
