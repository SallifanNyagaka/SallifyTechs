import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Script from "next/script"
import ServiceDetailClient from "@/components/services/ServiceDetailClient"
import { getPublishedServices, getServiceBySlug } from "@/lib/firestore/getServices"
import { siteName, toAbsoluteUrl } from "@/lib/seo/site"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

export const revalidate = 120

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service) {
    return { title: `Service | ${siteName}` }
  }

  const seo = service.seo || {}
  const title = seo.metaTitle || service.title
  const description = seo.metaDescription || service.shortDescription
  const canonical = seo.canonicalUrl || `/services/${service.slug}`
  const ogImage = resolveFirebaseImageUrl(seo.ogImage || service.heroImage || service.coverImage)
  const noIndex = seo.noIndex === true

  return {
    title,
    description,
    keywords: seo.keywords || [],
    alternates: {
      canonical,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: ogImage ? [ogImage] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const relatedServices = (await getPublishedServices())
    .filter((item) => item.slug !== slug)
    .slice(0, 3)

  const canonicalUrl = service.seo?.canonicalUrl || toAbsoluteUrl(`/services/${service.slug}`)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.seo?.metaTitle || service.title,
    description: service.seo?.metaDescription || service.shortDescription,
    provider: {
      "@type": "Organization",
      name: siteName,
      url: toAbsoluteUrl("/"),
    },
    areaServed: "Global",
    serviceType: service.title,
    image: resolveFirebaseImageUrl(service.seo?.ogImage || service.heroImage || service.coverImage) || undefined,
    offers: (service.pricingPlans || []).map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      priceSpecification: [
        { "@type": "PriceSpecification", priceCurrency: "KES", price: plan.priceKESRange },
        { "@type": "PriceSpecification", priceCurrency: "USD", price: plan.priceUSDRange },
      ],
    })),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: toAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Services", item: toAbsoluteUrl("/services") },
      { "@type": "ListItem", position: 3, name: service.title, item: canonicalUrl },
    ],
  }

  return (
    <>
      <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <Script id="service-breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ServiceDetailClient service={service} relatedServices={relatedServices} />
    </>
  )
}
