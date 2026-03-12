export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://sallify.tech"

export const siteName = "Sallify Techs"
export const defaultDescription =
  "Sallify Techs builds modern web, mobile, system, and growth solutions for ambitious brands."

export function toAbsoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return siteUrl
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
  return `${siteUrl}${path}`
}
