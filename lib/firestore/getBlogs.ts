import { cache } from "react"
import { collection, getDocs, query, Timestamp } from "firebase/firestore"
import { firestore } from "@/lib/firebase"

export type BlogPostRecord = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  heroImageUrl: string
  galleryImages: string[]
  bloggerName: string
  bloggerPhotoUrl: string
  category: string
  tags: string[]
  publishedDate: string
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
  status: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    canonicalUrl?: string
    ogImage?: string
    noIndex?: boolean
  }
}

function toIso(value: unknown) {
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
  return value.map((item) => String(item || "").trim()).filter(Boolean)
}

function normalizeSeo(value: unknown): BlogPostRecord["seo"] {
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

function normalizeBlog(id: string, raw: Record<string, unknown>): BlogPostRecord {
  const bloggerName = String(raw.blogger_name || raw.bloggerName || raw.author || "")
  const heroImageUrl = String(raw.hero_image_url || raw.heroImageUrl || raw.featuredImage || "")
  const publishedDate = toIso(raw.published_date || raw.publishedDate || raw.publishedAt)

  const normalizedStatus = String(raw.status || "published").toLowerCase()

  return {
    id,
    title: String(raw.title || ""),
    slug: String(raw.slug || id),
    excerpt: String(raw.excerpt || ""),
    content: String(raw.content || ""),
    heroImageUrl,
    galleryImages: toArray(raw.gallery_images || raw.galleryImages),
    bloggerName,
    bloggerPhotoUrl: String(raw.blogger_photo_url || raw.bloggerPhotoUrl || ""),
    category: String(raw.category || ""),
    tags: toArray(raw.tags),
    publishedDate,
    featured: Boolean(raw.featured),
    order: Number(raw.order || 0),
    createdAt: toIso(raw.created_at || raw.createdAt),
    updatedAt: toIso(raw.updated_at || raw.updatedAt),
    status: normalizedStatus,
    seo: normalizeSeo(raw.seo),
  }
}

export const getBlogPosts = cache(async () => {
  const source = query(collection(firestore, "blogs"))
  const snapshot = await getDocs(source)

  return snapshot.docs
    .map((docItem) => normalizeBlog(docItem.id, docItem.data() as Record<string, unknown>))
    .sort((a, b) => {
      const orderA = Number.isFinite(a.order) ? a.order : 0
      const orderB = Number.isFinite(b.order) ? b.order : 0
      if (orderA !== orderB) return orderA - orderB
      const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0
      const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0
      return dateB - dateA
    })
    .filter((post) => post.status === "published" || post.status === "draft")
})

export const getPublishedBlogPosts = cache(async () => {
  const all = await getBlogPosts()
  const published = all.filter((post) => post.status === "published")
  if (published.length) return published
  return all.filter((post) => post.status !== "draft")
})

export async function getBlogBySlug(slug: string) {
  const all = await getPublishedBlogPosts()
  return all.find((post) => post.slug === slug)
}
