import { cache } from "react"
import { collection, getDocs, query, Timestamp } from "firebase/firestore"
import { firestore } from "@/lib/firebase"

export type TestimonialRecord = {
  id: string
  name: string
  role: string
  photoUrl: string
  content: string
  featured: boolean
  rating: number
  createdAt: string
  order: number
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

function normalizeTestimonial(id: string, raw: Record<string, unknown>): TestimonialRecord {
  const content = String(raw.content || raw.message || "")
  const role = String(raw.role || raw.company || "")
  const photoUrl = String(raw.photo_url || raw.photoUrl || raw.image || "")
  return {
    id,
    name: String(raw.name || ""),
    role,
    photoUrl,
    content,
    featured: Boolean(raw.featured),
    rating: Number(raw.rating || 0),
    createdAt: toIso(raw.created_at || raw.createdAt),
    order: Number(raw.order || 0),
  }
}

export const getTestimonials = cache(async () => {
  const snapshot = await getDocs(query(collection(firestore, "testimonials")))
  return snapshot.docs
    .map((item) => {
      const raw = item.data() as Record<string, unknown>
      return {
        normalized: normalizeTestimonial(item.id, raw),
        approved: raw.approved,
        status: String(raw.status || "").toLowerCase(),
      }
    })
    .filter((item) => {
      if (typeof item.approved === "boolean") return item.approved
      if (item.status) return item.status === "published"
      return true
    })
    .map((item) => item.normalized)
    .filter((item) => item.name && item.content)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      if (a.order !== b.order) return a.order - b.order
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
})
