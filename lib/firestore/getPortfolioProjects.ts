import { cache } from "react"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"
import { firestore } from "@/lib/firebase"

export type PortfolioCategory =
  | "Web Development"
  | "Mobile Development"
  | "System Development"
  | "Graphics"
  | "SEO"
  | "Digital Marketing"
  | string

export type PortfolioProject = {
  id: string
  title: string
  slug: string
  category: PortfolioCategory
  clientName: string
  projectSummary: string
  fullDescription: string
  servicesUsed: string[]
  technologies: string[]
  thumbnailUrl: string
  coverImageUrl: string
  galleryImages: string[]
  liveUrl: string
  githubUrl: string
  completionDate: string
  testimonial: string
  testimonialAuthor: string
  featured: boolean
  order: number
  createdAt: string
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

function toIsoDate(value: unknown) {
  if (!value) return ""
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string") return value
  if (typeof value === "object" && value && "seconds" in value) {
    const ts = value as { seconds: number; nanoseconds?: number }
    return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6)).toISOString()
  }
  return ""
}

function toArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
}

function normalizeSeo(value: unknown): PortfolioProject["seo"] {
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

function normalizeProject(
  id: string,
  raw: Record<string, unknown>
): PortfolioProject {
  return {
    id,
    title: String(raw.title || ""),
    slug: String(raw.slug || id),
    category: String(raw.category || ""),
    clientName: String(raw.client_name || raw.clientName || ""),
    projectSummary: String(raw.project_summary || raw.description || raw.projectSummary || ""),
    fullDescription: String(raw.full_description || raw.fullDescription || raw.description || ""),
    servicesUsed: toArray(raw.services_used || raw.servicesUsed),
    technologies: toArray(raw.technologies),
    thumbnailUrl: String(raw.thumbnail_url || raw.thumbnail || raw.thumbnailUrl || ""),
    coverImageUrl: String(raw.cover_image_url || raw.coverImage || raw.coverImageUrl || raw.thumbnail || ""),
    galleryImages: toArray(raw.gallery_images || raw.images || raw.galleryImages),
    liveUrl: String(raw.live_url || raw.liveUrl || ""),
    githubUrl: String(raw.github_url || raw.githubUrl || ""),
    completionDate: toIsoDate(raw.completion_date || raw.completionDate),
    testimonial: String(raw.testimonial || raw.message || ""),
    testimonialAuthor: String(raw.testimonial_author || raw.testimonialAuthor || raw.clientName || ""),
    featured: Boolean(raw.featured),
    order: Number(raw.order || 0),
    createdAt: toIsoDate(raw.created_at || raw.createdAt),
    updatedAt: toIsoDate(raw.updated_at || raw.updatedAt),
    seo: normalizeSeo(raw.seo),
  }
}

async function fetchFromCollection(path: string) {
  const snapshot = await getDocs(query(collection(firestore, path), orderBy("order", "asc"), limit(120)))
  return snapshot.docs.map((docItem) => normalizeProject(docItem.id, docItem.data() as Record<string, unknown>))
}

export const getPortfolioProjects = cache(async () => {
  const primary = await fetchFromCollection("portfolio_projects")
  if (primary.length) return primary
  return fetchFromCollection("portfolio")
})
