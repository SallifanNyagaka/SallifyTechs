import type { Metadata } from "next"
import { getStaticMeta } from "@/lib/seo/static-meta"

export async function getRouteMetadata(
  slug: string,
  fallbackTitle: string,
  fallbackDescription: string
): Promise<Metadata> {
  const meta = await getStaticMeta(slug, fallbackTitle, fallbackDescription)

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: meta.canonical,
    },
    robots: {
      index: !meta.noIndex,
      follow: !meta.noIndex,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      images: [meta.ogImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [meta.ogImage],
    },
  }
}
