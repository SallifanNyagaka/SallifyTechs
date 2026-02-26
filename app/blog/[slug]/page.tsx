import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import BlogHero from "@/components/blog/BlogHero"
import BlogContent from "@/components/blog/BlogContent"
import ImageGallery from "@/components/blog/ImageGallery"
import RelatedBlogs from "@/components/blog/RelatedBlogs"
import BlogCTA from "@/components/blog/BlogCTA"
import { getBlogBySlug, getPublishedBlogPosts } from "@/lib/firestore/getBlogs"
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
      title: "Blog Post | Sallify Technologies",
    }
  }

  const ogImage = resolveFirebaseImageUrl(post.heroImageUrl)
  return {
    title: `${post.title} | Sallify Technologies`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: ogImage ? [ogImage] : undefined,
      type: "article",
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

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
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
