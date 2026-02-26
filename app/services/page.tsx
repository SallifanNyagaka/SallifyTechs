"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import ServiceCard from "@/components/services/ServiceCard"
import { firestore } from "@/lib/firebase"
import Spinner from "@/components/ui/Spinner"

type ServiceListItem = {
  id: string
  title?: string
  slug?: string
  shortDescription?: string
  heroImage?: string
  status?: string
  order?: number
}

function ServicesSkeleton() {
  return (
    <div className="space-y-4">
      <Spinner label="Loading services..." />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-2xl bg-[var(--color-section-alt)] dark:bg-[var(--color-footer)]" />
        ))}
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const source = query(
          collection(firestore, "services"),
          orderBy("order", "asc")
        )
        const snapshot = await getDocs(source)
        const data = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...(item.data() as Omit<ServiceListItem, "id">),
          }))
          .filter((item) => item.status === "published")

        if (active) {
          setServices(data)
          setLoading(false)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load services")
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <section id="services-hero" className="mx-auto w-full max-w-7xl space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-section)] via-[var(--color-section-alt)] to-[var(--color-bg)] p-6 shadow-sm dark:from-[var(--color-footer)] dark:via-[var(--color-section-alt)] dark:to-[var(--color-footer)] sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />
          <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] dark:text-[var(--color-muted-on-dark)]">Sallify Technologies</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Services</h1>
          <p className="mt-3 max-w-3xl text-sm text-[var(--color-body)] sm:text-base dark:text-[var(--color-body-on-dark)]">
            Explore our service capabilities and open each service for full scope, process, pricing, FAQs, and delivery details.
          </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? <ServicesSkeleton /> : null}

        {!loading && !error ? (
          <div id="services-list" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                slug={service.slug}
                shortDescription={service.shortDescription}
                heroImage={service.heroImage}
              />
            ))}
          </div>
        ) : null}

        {!loading && !services.length && !error ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 text-sm text-[var(--color-body)] dark:border-[var(--color-border)] dark:bg-[var(--color-footer)] dark:text-[var(--color-heading)]/85">
            No services are published yet.
          </div>
        ) : null}

        <div id="services-cta" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-primary)] hover:bg-[var(--color-footer)] hover:text-[var(--color-on-dark)] dark:border-[var(--color-border)] dark:hover:border-[var(--color-primary)] dark:hover:bg-[var(--color-primary-hover)] dark:hover:text-[var(--color-on-dark)]"
          >
            Request a service consultation
          </Link>
        </div>
      </section>
    </main>
  )
}
