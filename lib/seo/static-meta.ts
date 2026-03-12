import { getStaticSeoBySlug } from "@/lib/firestore/getStaticSeo"
import { siteName, toAbsoluteUrl } from "@/lib/seo/site"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"
import { unstable_noStore as noStore } from "next/cache"

export async function getStaticMeta(
  slug: string,
  fallbackTitle: string,
  fallbackDescription: string
) {
  noStore()
  const record = await getStaticSeoBySlug(slug)
  const seo = record?.seo || {}
  const title = seo.metaTitle || fallbackTitle
  const description = seo.metaDescription || fallbackDescription
  const canonical = toAbsoluteUrl(seo.canonicalUrl || `/${slug === "home" ? "" : slug}`)
  const keywords = seo.keywords || []
  const ogImage = resolveFirebaseImageUrl(seo.ogImage) || toAbsoluteUrl("/favicon.ico")
  const noIndex = seo.noIndex === true

  return {
    title: title.includes(siteName) ? title : `${title} | ${siteName}`,
    description,
    canonical,
    keywords,
    ogImage,
    noIndex,
  }
}
