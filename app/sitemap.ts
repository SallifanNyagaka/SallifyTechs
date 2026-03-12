import type { MetadataRoute } from "next"
import { getPublishedBlogPosts } from "@/lib/firestore/getBlogs"
import { getPortfolioProjects } from "@/lib/firestore/getPortfolioProjects"
import { getServices } from "@/lib/firestore/getServices"
import { getStaticSeoPages } from "@/lib/firestore/getStaticSeo"
import { siteUrl } from "@/lib/seo/site"

function toIso(value: unknown) {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
  }
  if (typeof value === "object" && value && "seconds" in value) {
    const ts = value as { seconds: number; nanoseconds?: number }
    return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6)).toISOString()
  }
  return new Date().toISOString()
}

function toAbsolute(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "/",
    "/about",
    "/services",
    "/portfolio",
    "/blog",
    "/process",
    "/testimonials",
    "/contact",
  ]

  const [services, portfolio, blogs, staticSeoPages] = await Promise.all([
    getServices(),
    getPortfolioProjects(),
    getPublishedBlogPosts(),
    getStaticSeoPages(),
  ])

  const staticSeoMap = new Map(
    staticSeoPages.map((item) => [String(item.slug || item.id || ""), item])
  )

  const staticEntries = staticRoutes
    .filter((path) => {
      const key = path === "/" ? "home" : path.replace(/^\//, "")
      return staticSeoMap.get(key)?.seo?.noIndex !== true
    })
    .map((path) => {
      const key = path === "/" ? "home" : path.replace(/^\//, "")
      const seoEntry = staticSeoMap.get(key)
      return {
        url: toAbsolute(path),
        lastModified: toIso(seoEntry?.updatedAt),
      }
    })

  const serviceEntries = services
    .filter((item) => item.status === "published" && item.seo?.noIndex !== true)
    .map((item) => ({
      url: toAbsolute(`/services/${item.slug}`),
      lastModified: toIso(item.updatedAt),
    }))

  const portfolioEntries = portfolio
    .filter((item) => item.seo?.noIndex !== true)
    .map((item) => ({
      url: toAbsolute(`/portfolio/${item.slug}`),
      lastModified: toIso(item.updatedAt || item.createdAt),
    }))

  const blogEntries = blogs
    .filter((item) => item.seo?.noIndex !== true)
    .map((item) => ({
      url: toAbsolute(`/blog/${item.slug}`),
      lastModified: toIso(item.updatedAt || item.publishedDate),
    }))

  return [...staticEntries, ...serviceEntries, ...portfolioEntries, ...blogEntries]
}
