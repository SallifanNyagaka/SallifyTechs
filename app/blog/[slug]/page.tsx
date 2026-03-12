import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import Script from "next/script"
import BlogHero from "@/components/blog/BlogHero"
import BlogContent from "@/components/blog/BlogContent"
import ImageGallery from "@/components/blog/ImageGallery"
import RelatedBlogs from "@/components/blog/RelatedBlogs"
import BlogCTA from "@/components/blog/BlogCTA"
import { getBlogBySlug, getPublishedBlogPosts } from "@/lib/firestore/getBlogs"
import { siteName, toAbsoluteUrl } from "@/lib/seo/site"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

export const revalidate = 120

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogBySlug(slug)

  if (!post) {
    return {
      title: `Blog Post | ${siteName}`,
    }
  }

  const seo = post.seo || {}
  const title = seo.metaTitle || post.title
  const description = seo.metaDescription || post.excerpt
  const canonical = seo.canonicalUrl || `/blog/${post.slug}`
  const ogImage = resolveFirebaseImageUrl(seo.ogImage || post.heroImageUrl)
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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogBySlug(slug)

  if (!post) {
    notFound()
  }

  const all = await getPublishedBlogPosts()
  const related = all
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 4)

  const canonicalUrl = post.seo?.canonicalUrl || toAbsoluteUrl(`/blog/${post.slug}`)
  const heroImage = resolveFirebaseImageUrl(post.seo?.ogImage || post.heroImageUrl)

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: heroImage || undefined,
    datePublished: post.publishedDate || undefined,
    dateModified: post.updatedAt || post.publishedDate || undefined,
    author: {
      "@type": "Person",
      name: post.bloggerName || "Sallify Team",
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
    mainEntityOfPage: canonicalUrl,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: toAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: toAbsoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <Script id="blog-posting-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <Script id="blog-breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] dark:text-[var(--color-subheading)]/90">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/blog">Blog</Link>
          <span>/</span>
          <span className="truncate text-[var(--color-heading)] dark:text-[var(--color-heading)]">{post.title}</span>
        </nav>

        <BlogHero post={post} />
        <BlogContent content={post.content} />
        <ImageGallery images={post.galleryImages} />
        <RelatedBlogs posts={related} />
        <BlogCTA />
      </div>
    </main>
  )
}
