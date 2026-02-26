"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import Spinner from "@/components/ui/Spinner"

type Action = {
  label?: string
  href?: string
}

type HeroDoc = {
  title?: string
  tagline?: string
  description?: string
  heroImage?: string
  primaryCTA?: Action
  secondaryCTA?: Action
}

type JourneyDoc = {
  title?: string
  description?: string
  milestones?: { year?: string; title?: string; description?: string; order?: number }[]
  highlights?: string[]
}

type SectionMeta = {
  title?: string
  description?: string
}

type DifferentiationDoc = {
  title?: string
  description?: string
  uniqueSellingPoints?: string[]
  technologies?: string[]
  industries?: string[]
  approach?: string
}

type TeamMember = {
  id: string
  name?: string
  role?: string
  bio?: string
  image?: string
  skills?: string[]
  order?: number
}

type StatItem = {
  id: string
  label?: string
  value?: number
  suffix?: string
  order?: number
}

type ValueItem = {
  id: string
  title?: string
  description?: string
  icon?: string
  order?: number
}

type Certification = {
  id: string
  name?: string
  logo?: string
  category?: string
  order?: number
}

type ClientItem = {
  id: string
  name?: string
  logo?: string
  website?: string
  order?: number
}

type TestimonialItem = {
  id: string
  name?: string
  company?: string
  role?: string
  message?: string
  image?: string
  rating?: number
  order?: number
}

type CtaDoc = {
  title?: string
  description?: string
  primaryCTA?: Action
  secondaryCTA?: Action
  backgroundImage?: string
}

type AboutData = {
  hero: HeroDoc
  journey: JourneyDoc
  valuesMeta: SectionMeta
  different: DifferentiationDoc
  teamMeta: SectionMeta
  statsMeta: SectionMeta
  certsMeta: SectionMeta
  clientsMeta: SectionMeta
  testimonialsMeta: SectionMeta
  cta: CtaDoc
  team: TeamMember[]
  stats: StatItem[]
  values: ValueItem[]
  certifications: Certification[]
  clients: ClientItem[]
  testimonials: TestimonialItem[]
}

const initialData: AboutData = {
  hero: {},
  journey: {},
  valuesMeta: {},
  different: {},
  teamMeta: {},
  statsMeta: {},
  certsMeta: {},
  clientsMeta: {},
  testimonialsMeta: {},
  cta: {},
  team: [],
  stats: [],
  values: [],
  certifications: [],
  clients: [],
  testimonials: [],
}

function safeHref(href?: string) {
  return href && href.trim() ? href : "#"
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

function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-[var(--color-section-alt)]" />
      ))}
    </div>
  )
}

function CountUp({ target = 0, suffix = "" }: { target?: number; suffix?: string }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const end = Number.isFinite(target) ? Number(target) : 0
    if (end <= 0) {
      const resetFrame = requestAnimationFrame(() => setValue(0))
      return () => cancelAnimationFrame(resetFrame)
    }

    let frame = 0
    const duration = 900
    const start = performance.now()

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(end * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return (
    <span>
      {value}
      {suffix}
    </span>
  )
}

async function fetchDoc<T>(path: string, id: string): Promise<T> {
  const snap = await getDoc(doc(firestore, path, id))
  return (snap.exists() ? (snap.data() as T) : ({} as T))
}

async function fetchCollection<T>(path: string, ordered = true): Promise<(T & { id: string })[]> {
  const source = ordered
    ? query(collection(firestore, path), orderBy("order", "asc"))
    : collection(firestore, path)

  const snap = await getDocs(source)
  return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }))
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [
          hero,
          journey,
          valuesMeta,
          different,
          teamMeta,
          statsMeta,
          certsMeta,
          clientsMeta,
          testimonialsMeta,
          cta,
          team,
          stats,
          values,
          certifications,
          clients,
          testimonials,
          legacyCompany,
          legacyTeam,
        ] = await Promise.all([
          fetchDoc<HeroDoc>("aboutPage", "hero"),
          fetchDoc<JourneyDoc>("aboutPage", "journey"),
          fetchDoc<SectionMeta>("aboutPage", "values"),
          fetchDoc<DifferentiationDoc>("aboutPage", "different"),
          fetchDoc<SectionMeta>("aboutPage", "team"),
          fetchDoc<SectionMeta>("aboutPage", "companyStats"),
          fetchDoc<SectionMeta>("aboutPage", "certifications"),
          fetchDoc<SectionMeta>("aboutPage", "clients"),
          fetchDoc<SectionMeta>("aboutPage", "testimonials"),
          fetchDoc<CtaDoc>("aboutPage", "cta"),
          fetchCollection<TeamMember>("team"),
          fetchCollection<StatItem>("companyStats"),
          fetchCollection<ValueItem>("values"),
          fetchCollection<Certification>("certifications"),
          fetchCollection<ClientItem>("clients"),
          fetchCollection<TestimonialItem>("testimonials"),
          fetchDoc<{ story?: string }>("about", "company"),
          fetchCollection<TeamMember>("about/company/teamMembers"),
        ])

        const resolvedJourney: JourneyDoc = {
          ...journey,
          description: journey.description || legacyCompany.story || "",
        }

        const resolvedTeam = team.length ? team : legacyTeam

        if (mounted) {
          setData({
            hero,
            journey: resolvedJourney,
            valuesMeta,
            different,
            teamMeta,
            statsMeta,
            certsMeta,
            clientsMeta,
            testimonialsMeta,
            cta,
            team: resolvedTeam,
            stats,
            values,
            certifications,
            clients,
            testimonials,
          })
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load About page")
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const sortedMilestones = useMemo(
    () => [...(data.journey.milestones || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [data.journey.milestones]
  )

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-heading)]">
      {error ? (
        <section className="mx-auto w-full max-w-6xl px-6 pt-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
            <h2 className="text-lg font-semibold">About page error</h2>
            <p className="text-sm">{error}</p>
          </div>
        </section>
      ) : null}
      {loading ? (
        <section className="mx-auto w-full max-w-7xl px-6 pt-6">
          <Spinner label="Loading about content..." />
        </section>
      ) : null}

      <section id="about-hero" className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-14 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          {loading ? (
            <CardSkeleton count={1} />
          ) : (
            <>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{data.hero.title ?? ""}</h1>
              <p className="text-lg text-[var(--color-body)]">{data.hero.tagline ?? ""}</p>
              <p className="text-base text-[var(--color-body)] sm:text-lg">{data.hero.description ?? ""}</p>
              <div className="flex flex-wrap gap-3">
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
        <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-3 shadow-lg">
          {loading ? (
            <div className="h-80 animate-pulse rounded-2xl bg-[var(--color-section-alt)]" />
          ) : (
            <Image
              src={resolveImageUrl(data.hero.heroImage) || "/favicon.ico"}
              alt={data.hero.title || ""}
              width={1400}
              height={1000}
              className="h-80 w-full rounded-2xl object-cover"
              unoptimized
            />
          )}
        </div>
      </section>

      <section id="about-journey" className="mx-auto w-full max-w-7xl px-6 py-14">
        <h2 className="text-3xl font-semibold">{data.journey.title ?? ""}</h2>
        <p className="mt-4 max-w-4xl text-[var(--color-body)]">{data.journey.description ?? ""}</p>
        {sortedMilestones.length ? (
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {sortedMilestones.map((milestone, i) => (
              <li key={`${milestone.year}-${i}`} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">{milestone.year ?? ""}</p>
                <h3 className="mt-2 text-xl font-semibold">{milestone.title ?? ""}</h3>
                <p className="mt-1 text-sm text-[var(--color-body)]">{milestone.description ?? ""}</p>
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      <section id="about-values" className="mx-auto w-full max-w-7xl px-6 py-14">
        <h2 className="text-3xl font-semibold">{data.valuesMeta.title ?? ""}</h2>
        <p className="mt-3 text-[var(--color-body)]">{data.valuesMeta.description ?? ""}</p>
        {loading ? <CardSkeleton /> : null}
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.values.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">{item.icon ?? ""}</p>
              <h3 className="mt-3 text-xl font-semibold">{item.title ?? ""}</h3>
              <p className="mt-2 text-sm text-[var(--color-body)]">{item.description ?? ""}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-section)] py-14">
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="text-3xl font-semibold">{data.different.title ?? ""}</h2>
          <p className="mt-3 text-[var(--color-body)]">{data.different.description ?? ""}</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] p-6">
              <h3 className="text-lg font-semibold">{(data.different.uniqueSellingPoints || [])[0] ?? ""}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-body)]">
                {(data.different.uniqueSellingPoints || []).slice(1).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] p-6">
              <h3 className="text-lg font-semibold">{data.different.approach ?? ""}</h3>
              <p className="mt-3 text-sm text-[var(--color-body)]">{(data.different.industries || []).join(" • ")}</p>
              <p className="mt-2 text-sm text-[var(--color-body)]">{(data.different.technologies || []).join(" • ")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about-team" className="mx-auto w-full max-w-7xl px-6 py-14">
        <h2 className="text-3xl font-semibold">{data.teamMeta.title ?? ""}</h2>
        <p className="mt-3 text-[var(--color-body)]">{data.teamMeta.description ?? ""}</p>
        {loading ? <CardSkeleton /> : null}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data.team.map((member) => (
            <article key={member.id} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-sm">
              <Image
                src={resolveImageUrl(member.image) || "/favicon.ico"}
                alt={member.name || ""}
                width={700}
                height={500}
                className="h-52 w-full object-cover"
                unoptimized
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold">{member.name ?? ""}</h3>
                <p className="text-sm text-[var(--color-muted)]">{member.role ?? ""}</p>
                <p className="mt-3 text-sm text-[var(--color-body)]">{member.bio ?? ""}</p>
                <p className="mt-3 text-xs text-[var(--color-muted)]">{(member.skills || []).join(" • ")}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about-stats" className="bg-[var(--color-section)] py-14">
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="text-3xl font-semibold">{data.statsMeta.title ?? ""}</h2>
          <p className="mt-3 text-[var(--color-body)]">{data.statsMeta.description ?? ""}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.stats.map((stat) => (
              <article key={stat.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-center">
                <p className="text-3xl font-semibold text-[var(--color-heading)]">
                  <CountUp target={stat.value} suffix={stat.suffix || ""} />
                </p>
                <p className="mt-2 text-sm text-[var(--color-body)]">{stat.label ?? ""}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-14">
        <h2 className="text-3xl font-semibold">{data.certsMeta.title ?? ""}</h2>
        <p className="mt-3 text-[var(--color-body)]">{data.certsMeta.description ?? ""}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.certifications.map((cert) => (
            <article key={cert.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 text-center shadow-sm">
              <Image
                src={resolveImageUrl(cert.logo) || "/favicon.ico"}
                alt={cert.name || ""}
                width={220}
                height={120}
                className="mx-auto h-14 w-auto object-contain"
                unoptimized
              />
              <p className="mt-3 text-sm font-semibold">{cert.name ?? ""}</p>
              <p className="text-xs text-[var(--color-muted)]">{cert.category ?? ""}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-section)] py-14">
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="text-3xl font-semibold">{data.clientsMeta.title ?? ""}</h2>
          <p className="mt-3 text-[var(--color-body)]">{data.clientsMeta.description ?? ""}</p>
          <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {data.clients.map((client) => (
              <a key={client.id} href={safeHref(client.website)} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <Image
                  src={resolveImageUrl(client.logo) || "/favicon.ico"}
                  alt={client.name || ""}
                  width={180}
                  height={90}
                  className="h-10 w-full object-contain"
                  unoptimized
                />
              </a>
            ))}
          </div>

          <h3 className="mt-12 text-2xl font-semibold">{data.testimonialsMeta.title ?? ""}</h3>
          <p className="mt-3 text-[var(--color-body)]">{data.testimonialsMeta.description ?? ""}</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {data.testimonials.map((item) => (
              <article key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
                <p className="text-[var(--color-secondary)]">{"?".repeat(Math.max(0, Math.min(5, Math.round(item.rating || 0))))}</p>
                <p className="mt-3 text-sm text-[var(--color-body)]">&quot;{item.message ?? ""}&quot;</p>
                <div className="mt-4">
                  <p className="font-semibold">{item.name ?? ""}</p>
                  <p className="text-xs text-[var(--color-muted)]">{item.role ?? ""} {item.company ? `• ${item.company}` : ""}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about-cta" className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-section)] via-[var(--color-section-alt)] to-[var(--color-bg)] p-8 text-[var(--color-heading)] md:p-12 dark:from-[var(--color-footer)] dark:via-[var(--color-section-alt)] dark:to-[var(--color-footer)] dark:text-[var(--color-on-dark)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl font-semibold">{data.cta.title ?? ""}</h2>
            <p className="mt-3 max-w-2xl text-[var(--color-body)] dark:text-[var(--color-body-on-dark)]">{data.cta.description ?? ""}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={safeHref(data.cta.primaryCTA?.href)} className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-6 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] dark:bg-[var(--color-section)] dark:text-[var(--color-heading)] dark:hover:bg-[var(--color-section-alt)]">
                {data.cta.primaryCTA?.label ?? ""}
              </Link>
              <Link href={safeHref(data.cta.secondaryCTA?.href)} className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-heading)] dark:border-[var(--color-border-on-dark)] dark:text-[var(--color-on-dark)] dark:hover:border-[var(--color-on-dark)] dark:hover:bg-[var(--color-on-dark)]/10">
                {data.cta.secondaryCTA?.label ?? ""}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}



