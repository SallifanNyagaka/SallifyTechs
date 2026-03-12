import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import Script from "next/script"
import { getPortfolioProjects } from "@/lib/firestore/getPortfolioProjects"
import { siteName, toAbsoluteUrl } from "@/lib/seo/site"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

function formatDate(value?: string) {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const projects = await getPortfolioProjects()
  const project = projects.find((item) => item.slug === slug)

  if (!project) {
    return { title: `Portfolio Project | ${siteName}` }
  }

  const seo = project.seo || {}
  const title = seo.metaTitle || project.title
  const description = seo.metaDescription || project.projectSummary
  const canonical = seo.canonicalUrl || `/portfolio/${project.slug}`
  const ogImage = resolveFirebaseImageUrl(seo.ogImage || project.coverImageUrl || project.thumbnailUrl)
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

export default async function PortfolioProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const projects = await getPortfolioProjects()
  const project = projects.find((item) => item.slug === slug)

  if (!project) {
    notFound()
  }

  const coverImage = resolveFirebaseImageUrl(project.coverImageUrl || project.thumbnailUrl) || "/favicon.ico"
  const gallery = (project.galleryImages || [])
    .map((image) => resolveFirebaseImageUrl(image))
    .filter(Boolean)
  const canonicalUrl = project.seo?.canonicalUrl || toAbsoluteUrl(`/portfolio/${project.slug}`)

  const portfolioSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.seo?.metaTitle || project.title,
    description: project.seo?.metaDescription || project.projectSummary,
    image: resolveFirebaseImageUrl(project.seo?.ogImage || project.coverImageUrl || project.thumbnailUrl) || undefined,
    creator: {
      "@type": "Organization",
      name: siteName,
    },
    datePublished: project.createdAt || undefined,
    dateModified: project.updatedAt || undefined,
    mainEntityOfPage: canonicalUrl,
    keywords: project.seo?.keywords?.join(", ") || undefined,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: toAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Portfolio", item: toAbsoluteUrl("/portfolio") },
      { "@type": "ListItem", position: 3, name: project.title, item: canonicalUrl },
    ],
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <Script id="portfolio-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioSchema) }} />
      <Script id="portfolio-breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <article className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
          <div className="relative h-64 w-full sm:h-80 lg:h-[26rem]">
            <Image
              src={coverImage}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 80vw"
              unoptimized
            />
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] dark:text-[var(--color-subheading)]">Case Study</p>
            <h1 className="text-3xl font-semibold sm:text-4xl dark:text-[var(--color-heading)]">{project.title}</h1>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)] dark:text-[var(--color-subheading)]/90">
              <span className="rounded-full bg-[var(--color-section-alt)] px-2.5 py-1 font-medium text-[var(--color-body)] dark:bg-[var(--color-section-alt)] dark:text-[var(--color-heading)]">
                {project.category}
              </span>
              <span>{project.clientName}</span>
              {formatDate(project.completionDate) ? <span>{formatDate(project.completionDate)}</span> : null}
            </div>

            <p className="text-sm text-[var(--color-body)] sm:text-base dark:text-[var(--color-heading)]/85">
              {project.fullDescription || project.projectSummary}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-body)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-5 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-section-alt)] dark:bg-[var(--color-primary)] dark:text-[var(--color-on-dark)]"
                >
                  Visit Live Project
                </a>
              ) : null}

              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-footer)] hover:text-[var(--color-on-dark)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)] dark:hover:border-[var(--color-primary)] dark:hover:bg-[var(--color-primary-hover)] dark:hover:text-[var(--color-on-dark)]"
                >
                  View Repository
                </a>
              ) : null}

              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-footer)] hover:text-[var(--color-on-dark)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)] dark:hover:border-[var(--color-primary)] dark:hover:bg-[var(--color-primary-hover)] dark:hover:text-[var(--color-on-dark)]"
              >
                Back to Portfolio
              </Link>
            </div>
          </div>
        </article>

        {gallery.length ? (
          <section className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h2 className="text-2xl font-semibold dark:text-[var(--color-heading)]">Project Gallery</h2>
            <p className="text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]/85">Click any image to open the full version.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image, index) => (
                <a
                  key={`${image}-${index}`}
                  href={image}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block overflow-hidden rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-border)]"
                >
                  <div className="relative h-52 w-full">
                    <Image
                      src={image}
                      alt={`${project.title} gallery ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {project.testimonial ? (
          <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h2 className="text-xl font-semibold dark:text-[var(--color-heading)]">Client Feedback</h2>
            <p className="mt-3 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]/90">&quot;{project.testimonial}&quot;</p>
            <p className="mt-2 text-xs text-[var(--color-muted)] dark:text-[var(--color-subheading)]/85">{project.testimonialAuthor}</p>
          </section>
        ) : null}

        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-section)] via-[var(--color-section-alt)] to-[var(--color-bg)] p-6 text-[var(--color-heading)] dark:from-[var(--color-footer)] dark:via-[var(--color-section-alt)] dark:to-[var(--color-footer)] dark:text-[var(--color-on-dark)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm text-[var(--color-body)] dark:text-[var(--color-body-on-dark)] sm:text-base">
              Want something similar for your business? We can scope timeline, budget range, and delivery plan in one call.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-5 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] dark:bg-[var(--color-section)] dark:text-[var(--color-heading)] dark:hover:bg-[var(--color-section-alt)]"
            >
              Discuss Similar Project
            </Link>
          </div>
        </section>
      </section>
    </main>
  )
}
