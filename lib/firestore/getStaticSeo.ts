import { collection, doc, getDoc, getDocs, query } from "firebase/firestore"
import { unstable_noStore as noStore } from "next/cache"
import { firestore } from "@/lib/firebase"
import type { SeoFields, StaticPageSeo } from "@/types/cms"

function toArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item || "").trim()).filter(Boolean)
}

function normalizeSeo(value: unknown): SeoFields {
  if (!value || typeof value !== "object") return {}
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

export async function getStaticSeoBySlug(slug: string): Promise<StaticPageSeo | null> {
  noStore()
  const snap = await getDoc(doc(firestore, "static_pages", slug))
  if (!snap.exists()) return null
  const raw = snap.data() as Record<string, unknown>
  return {
    id: snap.id,
    slug: String(raw.slug || snap.id),
    title: String(raw.title || ""),
    seo: normalizeSeo(raw.seo),
    updatedAt: (raw.updatedAt || raw.updated_at || null) as StaticPageSeo["updatedAt"],
  }
}

export async function getStaticSeoPages(): Promise<StaticPageSeo[]> {
  noStore()
  const snapshot = await getDocs(query(collection(firestore, "static_pages")))
  return snapshot.docs.map((docItem) => {
    const raw = docItem.data() as Record<string, unknown>
    return {
      id: docItem.id,
      slug: String(raw.slug || docItem.id),
      title: String(raw.title || ""),
      seo: normalizeSeo(raw.seo),
      updatedAt: (raw.updatedAt || raw.updated_at || null) as StaticPageSeo["updatedAt"],
    }
  })
}
