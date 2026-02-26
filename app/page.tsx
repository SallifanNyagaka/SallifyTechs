"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import FloatingChat from "@/components/chat/FloatingChat"

type HeroDoc = {
  title?: string
  subtitle?: string
  description?: string
  primaryCTA?: { label?: string; href?: string }
  secondaryCTA?: { label?: string; href?: string }
  heroImage?: string
  servicesPreviewText?: string
  portfolioPreviewText?: string
  blogPreviewText?: string
  sections?: { key?: string; title?: string; description?: string; order?: number }[]
}

type CtaDoc = {
  title?: string
  description?: string
  buttonText?: string
  href?: string
  backgroundImage?: string
}

type MainDoc = {
  hero?: { eyebrow?: string; heading?: string }
  services?: {
    eyebrow?: string
    heading?: string
    title?: string
    description?: string
    buttonText?: string
    buttonHref?: string
    emptyText?: string
  }
  whyChooseUs?: {
    eyebrow?: string
    heading?: string
    title?: string
    description?: string
    emptyText?: string
  }
  portfolio?: {
    eyebrow?: string
    heading?: string
    title?: string
    description?: string
    buttonText?: string
    buttonHref?: string
    emptyText?: string
  }
  process?: {
    eyebrow?: string
    heading?: string
    title?: string
    description?: string
    stepLabel?: string
    buttonText?: string
    buttonHref?: string
    emptyText?: string
  }
  cta?: { eyebrow?: string; heading?: string; imageAlt?: string }
}

type ServiceDoc = {
  id: string
  title?: string
  shortDescription?: string
  icon?: string
  iconUrl?: string
  status?: string
  order?: number
}

type PortfolioDoc = {
  id: string
  title?: string
  description?: string
  thumbnail?: string
  featured?: boolean
}

type ProcessDoc = {
  id: string
  stepNumber?: number
  title?: string
  description?: string
  icon?: string
}

type PageState = {
  hero: HeroDoc
  cta: CtaDoc
  main: MainDoc
  services: ServiceDoc[]
  featuredProjects: PortfolioDoc[]
  processSteps: ProcessDoc[]
  whyChooseUs: HeroDoc["sections"]
}

const initialState: PageState = {
  hero: {},
  cta: {},
  main: {},
  services: [],
  featuredProjects: [],
  processSteps: [],
  whyChooseUs: [],
}

const iconMap: Record<string, string> = {
  globe: "M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18Zm0 2a7 7 0 1 0 0 14a7 7 0 0 0 0-14Zm0 1.5c1.2 0 2.4 1.2 3.2 3.2h-6.4c.8-2 2-3.2 3.2-3.2Zm-4.2 5.2c-.1.6-.1 1.2 0 1.8h8.4c.1-.6.1-1.2 0-1.8H7.8Zm1 3.8c.8 2 2 3.2 3.2 3.2s2.4-1.2 3.2-3.2H8.8Z",
  smartphone:
    "M9 2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v16h6V4H9Zm3 13.5a1 1 0 1 0 0 2a1 1 0 0 0 0-2Z",
  layers:
    "M12 3 3 8l9 5 9-5-9-5Zm0 7L3 15l9 5 9-5-9-5Zm0 7-9-5v2l9 5 9-5v-2l-9 5Z",
  "pen-tool":
    "M3 21l3.5-.9L20 6.6l-2.7-2.7L3.9 17.3 3 21Zm14.7-16.4 2.7 2.7 1.6-1.6a1.9 1.9 0 0 0 0-2.7l-.1-.1a1.9 1.9 0 0 0-2.7 0l-1.5 1.7Z",
  image:
    "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h16V7H4Zm3 7 3-3 2.5 2.5 3.5-3.5 4 4H7Z",
  search:
    "M10.5 3a7.5 7.5 0 1 1-4.4 13.6l-3.1 3.1-1.4-1.4 3.1-3.1A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z",
  cloud:
    "M7 18h10a4 4 0 0 0 0-8h-.3A6 6 0 0 0 5 8a4 4 0 0 0 2 10Z",
  rocket:
    "M14 3c2 0 4.7 1 6.5 2.5-.3 2.1-1.1 4.6-2.5 6.5l-3.2-3.2L14 3Zm-1.2 9.8 3.4 3.4c-1.9 1.4-4.4 2.2-6.5 2.5-1.5-1.8-2.5-4.5-2.5-6.5l5.6.6Zm-5.2-.6 2.2.2-.2-2.2-4.6-4.6c-.6 1.3-1 2.9-1 4.5l3.6 2.1Z",
  "check-circle":
    "M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20Zm4.3 7.3-4.9 5a1 1 0 0 1-1.4 0L7.7 12l1.4-1.4 1.7 1.7 4.2-4.2 1.3 1.2Z",
  clipboard:
    "M9 2h6a2 2 0 0 1 2 2h2v16H5V4h2a2 2 0 0 1 2-2Zm0 2v2h6V4H9Zm-2 4v10h10V8H7Z",
  code:
    "M8.5 7 5 12l3.5 5-1.7 1.2L2.5 12l4.3-6.2L8.5 7Zm7 0 1.7-1.2L21.5 12l-4.3 6.2L15.5 17 19 12l-3.5-5Z",
  refresh:
    "M12 5a7 7 0 1 1-6.1 3.5H3l3.5-3.5L10 8.5H7.9A5 5 0 1 0 12 7V5Z",
}

function resolveImageUrl(raw?: string) {
  if (!raw) return ""
  if (raw.startsWith("https://")) return raw
  if (raw.startsWith("gs://")) {
    const withoutScheme = raw.replace("gs://", "")
    const slashIndex = withoutScheme.indexOf("/")
    if (slashIndex === -1) return ""
    const bucket = withoutScheme.slice(0, slashIndex)
    const objectPath = withoutScheme.slice(slashIndex + 1)
    return `https://storage.googleapis.com/${bucket}/${objectPath}`
  }
  return ""
}

function safeHref(href?: string) {
  return href && href.trim() ? href : "#"
}

function IconBadge({ name, iconUrl }: { name?: string; iconUrl?: string }) {
  const resolvedIcon = resolveImageUrl(iconUrl)
  if (resolvedIcon) {
    return (
      <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-footer)]">
        <Image src={resolvedIcon} alt="" width={48} height={48} className="h-10 w-10 object-contain" unoptimized />
      </span>
    )
  }

  const path = name ? iconMap[name] : null
  if (!path) {
    return (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-footer)] text-[var(--color-on-dark)] text-sm font-semibold">
        ST
      </span>
    )
  }
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-footer)] text-[var(--color-on-dark)]">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d={path} />
      </svg>
    </span>
  )
}

function ImageFrame({ src, alt }: { src?: string; alt?: string }) {
  const resolved = resolveImageUrl(src)
  if (!resolved) {
    return (
      <div className="flex h-full min-h-[220px] w-full items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--color-footer)] via-[var(--color-section-alt)] to-[var(--color-body)] text-[var(--color-on-dark)]" />
    )
  }
  return (
    <Image
      src={resolved}
      alt={alt || ""}
      width={1400}
      height={1000}
      sizes="(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw"
      className="h-full w-full rounded-3xl object-cover"
      unoptimized
    />
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold text-[var(--color-heading)] sm:text-4xl">{title}</h2>
      {description ? <p className="text-base text-[var(--color-body)] sm:text-lg">{description}</p> : null}
    </div>
  )
}

export default function HomePage() {
  const [data, setData] = useState<PageState>(initialState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [heroSnap, ctaSnap, mainSnap] = await Promise.all([
          getDoc(doc(firestore, "homepage", "hero")),
          getDoc(doc(firestore, "homepage", "cta")),
          getDoc(doc(firestore, "homepage", "main")),
        ])

        const heroDoc = heroSnap.exists() ? (heroSnap.data() as HeroDoc) : {}
        const ctaDoc = ctaSnap.exists() ? (ctaSnap.data() as CtaDoc) : {}
        const mainDoc = mainSnap.exists() ? (mainSnap.data() as MainDoc) : {}

        const servicesSnap = await getDocs(
          query(collection(firestore, "services"), orderBy("order", "asc"))
        )
        const services = servicesSnap.docs
          .map((docSnap) => ({ ...(docSnap.data() as ServiceDoc), id: docSnap.id }))
          .filter((service) => service.status !== "draft")

        const portfolioSnap = await getDocs(collection(firestore, "portfolio"))
        const featuredProjects = portfolioSnap.docs
          .map((docSnap) => ({ ...(docSnap.data() as PortfolioDoc), id: docSnap.id }))
          .filter((item) => item.featured)
          .slice(0, 4)

        const processSnap = await getDocs(
          query(collection(firestore, "process"), orderBy("stepNumber", "asc"))
        )
        const processSteps = processSnap.docs.map((docSnap) => ({
          ...(docSnap.data() as ProcessDoc),
          id: docSnap.id,
        }))

        const whyChooseUs = (heroDoc.sections || []).sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        )

        if (mounted) {
          setData({
            hero: heroDoc,
            cta: ctaDoc,
            main: mainDoc,
            services,
            featuredProjects,
            processSteps,
            whyChooseUs,
          })
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load homepage data")
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const heroImageUrl = useMemo(() => resolveImageUrl(data.hero.heroImage), [data.hero.heroImage])

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-heading)]">
      <section id="home-hero" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />
        </div>
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-16 pt-20 lg:flex-row lg:items-center lg:gap-16 lg:pb-24">
          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-6 w-48 animate-pulse rounded bg-[var(--color-section-alt)]" />
                <div className="h-12 w-full animate-pulse rounded bg-[var(--color-section-alt)]" />
                <div className="h-20 w-full animate-pulse rounded bg-[var(--color-section-alt)]" />
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">{data.main.hero?.eyebrow ?? ""}</p>
                <h1 className="text-4xl font-semibold leading-tight text-[var(--color-heading)] sm:text-5xl">
                  {data.main.hero?.heading ?? data.hero.title ?? ""}
                </h1>
                <p className="text-lg text-[var(--color-body)] sm:text-xl">{data.hero.subtitle ?? ""}</p>
                <p className="text-base text-[var(--color-body)] sm:text-lg">{data.hero.description ?? ""}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href={safeHref(data.hero.primaryCTA?.href)} className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-6 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]">
                    {data.hero.primaryCTA?.label ?? ""}
                  </Link>
                  <Link href={safeHref(data.hero.secondaryCTA?.href)} className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-heading)]">
                    {data.hero.secondaryCTA?.label ?? ""}
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className="flex-1">
            <div className="rounded-[2.5rem] border border-[var(--color-border-on-dark)] bg-[var(--color-section)]/80 p-4 shadow-2xl">
              {loading ? (
                <div className="h-80 animate-pulse rounded-[2rem] bg-[var(--color-section-alt)]" />
              ) : heroImageUrl ? (
                <Image src={heroImageUrl} alt={data.hero.title || ""} width={1400} height={1000} sizes="(min-width: 1024px) 45vw, 100vw" className="h-80 w-full rounded-[2rem] object-cover sm:h-[420px]" unoptimized />
              ) : (
                <ImageFrame alt="" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="home-services" className="mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <SectionHeading
            eyebrow={data.main.services?.eyebrow}
            title={data.main.services?.heading ?? data.main.services?.title ?? ""}
            description={data.main.services?.description ?? data.hero.servicesPreviewText}
          />
          <div className="flex items-center justify-start lg:justify-end">
            <Link href={safeHref(data.main.services?.buttonHref)} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-heading)]">
              {data.main.services?.buttonText ?? ""}
              <span aria-hidden>{">"}</span>
            </Link>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <div key={`service-skeleton-${index}`} className="h-44 animate-pulse rounded-3xl bg-[var(--color-section)]" />)
          ) : data.services.length ? (
            data.services.map((service) => (
              <div key={service.id} className="group flex h-full flex-col gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <IconBadge name={service.icon} iconUrl={service.iconUrl} />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[var(--color-heading)]">{service.title}</h3>
                  <p className="text-sm text-[var(--color-body)]">{service.shortDescription}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--color-muted)]">{data.main.services?.emptyText ?? ""}</p>
          )}
        </div>
      </section>

      <section id="home-why-choose-us" className="bg-[var(--color-section)]">
        <div className="mx-auto w-full max-w-7xl px-6 py-20">
          <SectionHeading
            eyebrow={data.main.whyChooseUs?.eyebrow}
            title={data.main.whyChooseUs?.heading ?? data.main.whyChooseUs?.title ?? ""}
            description={data.main.whyChooseUs?.description ?? ""}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {loading ? (
              <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)]/70 p-8 shadow-sm" />
            ) : data.whyChooseUs && data.whyChooseUs.length ? (
              data.whyChooseUs.map((point, index) => (
                <div key={point.key || index} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 transition hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 text-xl font-semibold text-[var(--color-heading)]">{point.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-body)]">{point.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--color-muted)]">{data.main.whyChooseUs?.emptyText ?? ""}</p>
            )}
          </div>
        </div>
      </section>

      <section id="home-featured-projects" className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={data.main.portfolio?.eyebrow}
            title={data.main.portfolio?.heading ?? data.main.portfolio?.title ?? ""}
            description={data.main.portfolio?.description ?? data.hero.portfolioPreviewText}
          />
          <Link href={safeHref(data.main.portfolio?.buttonHref)} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-body)] transition hover:text-[var(--color-heading)]">
            {data.main.portfolio?.buttonText ?? ""} <span aria-hidden>{">"}</span>
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <div key={`portfolio-skeleton-${index}`} className="h-64 animate-pulse rounded-3xl bg-[var(--color-section-alt)]" />)
          ) : data.featuredProjects.length ? (
            data.featuredProjects.map((project) => (
              <div key={project.id} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-44 w-full overflow-hidden">
                  <ImageFrame src={project.thumbnail} alt={project.title} />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-heading)]">{project.title}</h3>
                  <p className="text-sm text-[var(--color-body)] line-clamp-3">{project.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--color-muted)]">{data.main.portfolio?.emptyText ?? ""}</p>
          )}
        </div>
      </section>

      <section id="home-process" className="bg-[var(--color-section)]">
        <div className="mx-auto w-full max-w-7xl px-6 py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <SectionHeading
              eyebrow={data.main.process?.eyebrow}
              title={data.main.process?.heading ?? data.main.process?.title ?? ""}
              description={data.main.process?.description ?? data.hero.blogPreviewText}
            />
            <Link href={safeHref(data.main.process?.buttonHref)} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-body)] transition hover:text-[var(--color-heading)]">
              {data.main.process?.buttonText ?? ""} <span aria-hidden>{">"}</span>
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => <div key={`process-skeleton-${index}`} className="h-40 animate-pulse rounded-3xl bg-[var(--color-section-alt)]" />)
            ) : data.processSteps.length ? (
              data.processSteps.map((step) => (
                <div key={step.id} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-section-alt)] text-[var(--color-heading)]">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d={iconMap[step.icon || ""] || iconMap["rocket"]} />
                      </svg>
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">{`${data.main.process?.stepLabel ?? ""} ${step.stepNumber ?? ""}`.trim()}</p>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--color-heading)]">{step.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-body)]">{step.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--color-muted)]">{data.main.process?.emptyText ?? ""}</p>
            )}
          </div>
        </div>
      </section>

      <section id="home-cta" className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-6 w-40 animate-pulse rounded bg-[var(--color-section-alt)]" />
                <div className="h-10 w-full animate-pulse rounded bg-[var(--color-section-alt)]" />
                <div className="h-20 w-full animate-pulse rounded bg-[var(--color-section-alt)]" />
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">{data.main.cta?.eyebrow ?? ""}</p>
                <h2 className="text-3xl font-semibold text-[var(--color-heading)] sm:text-4xl">
                  {data.main.cta?.heading ?? data.cta.title ?? ""}
                </h2>
                <p className="text-base text-[var(--color-body)] sm:text-lg">{data.cta.description ?? ""}</p>
                <Link href={safeHref(data.cta.href)} className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-6 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]">
                  {data.cta.buttonText ?? ""}
                </Link>
              </>
            )}
          </div>
          <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-section)] p-4 shadow-lg">
            {loading ? (
              <div className="h-56 animate-pulse rounded-[1.5rem] bg-[var(--color-section-alt)]" />
            ) : (
              <ImageFrame src={data.cta.backgroundImage} alt={data.main.cta?.imageAlt ?? ""} />
            )}
          </div>
        </div>
      </section>

      {error ? (
        <section className="mx-auto w-full max-w-5xl px-6 pb-20">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-900">
            <p className="font-semibold">Firestore error</p>
            <p className="text-sm">{error}</p>
          </div>
        </section>
      ) : null}
      <FloatingChat />
    </main>
  )
}

