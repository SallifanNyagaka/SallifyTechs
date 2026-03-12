import { cache } from "react"
import { collection, getDocs, query } from "firebase/firestore"
import { firestore } from "@/lib/firebase"

export type ServiceRecord = {
  id: string
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  fullDescription: string
  heroImage: string
  coverImage: string
  features: string[]
  technologies: string[]
  process: string[]
  faqs: { question?: string; answer?: string }[]
  pricingPlans: {
    name?: string
    priceKESRange?: string
    priceUSDRange?: string
    features?: string[]
    recommended?: boolean
  }[]
  ctaText: string
  ctaButtonText: string
  status: string
  order: number
  updatedAt: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    canonicalUrl?: string
    ogImage?: string
    noIndex?: boolean
  }
}

function toArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item || "").trim()).filter(Boolean)
}

function toDateString(value: unknown) {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value && "seconds" in value) {
    const ts = value as { seconds: number; nanoseconds?: number }
    return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6)).toISOString()
  }
  return ""
}

function normalizeSeo(value: unknown): ServiceRecord["seo"] {
  if (!value || typeof value !== "object") return undefined
  const raw = value as Record<string, unknown>
  return {
    metaTitle: String(raw.metaTitle || ""),
    metaDescription: String(raw.metaDescription || ""),
    keywords: toArray(raw.keywords),
    canonicalUrl: String(raw.canonicalUrl || ""),
    ogImage: String(raw.ogImage || ""),
    noIndex: Boolean(raw.noIndex),
  }
}

function normalizeService(id: string, raw: Record<string, unknown>): ServiceRecord {
  return {
    id,
    title: String(raw.title || ""),
    slug: String(raw.slug || id),
    shortDescription: String(raw.shortDescription || ""),
    longDescription: String(raw.longDescription || raw.fullDescription || ""),
    fullDescription: String(raw.fullDescription || raw.longDescription || ""),
    heroImage: String(raw.heroImage || raw.coverImage || ""),
    coverImage: String(raw.coverImage || raw.heroImage || ""),
    features: toArray(raw.features),
    technologies: toArray(raw.technologies),
    process: toArray(raw.process),
    faqs: Array.isArray(raw.faqs) ? (raw.faqs as { question?: string; answer?: string }[]) : [],
    pricingPlans: Array.isArray(raw.pricingPlans)
      ? (raw.pricingPlans as ServiceRecord["pricingPlans"])
      : [],
    ctaText: String(raw.ctaText || ""),
    ctaButtonText: String(raw.ctaButtonText || ""),
    status: String(raw.status || "published").toLowerCase(),
    order: Number(raw.order || 0),
    updatedAt: toDateString(raw.updatedAt || raw.updated_at),
    seo: normalizeSeo(raw.seo),
  }
}

export const getServices = cache(async () => {
  const snapshot = await getDocs(query(collection(firestore, "services")))
  return snapshot.docs
    .map((docItem) => normalizeService(docItem.id, docItem.data() as Record<string, unknown>))
    .sort((a, b) => a.order - b.order)
})

export const getPublishedServices = cache(async () => {
  const services = await getServices()
  return services.filter((service) => service.status === "published")
})

export async function getServiceBySlug(slug: string) {
  const services = await getPublishedServices()
  return services.find((service) => service.slug === slug)
}
