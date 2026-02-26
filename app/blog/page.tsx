import type { Metadata } from "next"
import Link from "next/link"
import BlogCard from "@/components/blog/BlogCard"
import { getPublishedBlogPosts } from "@/lib/firestore/getBlogs"

export const metadata: Metadata = {
  title: "Blog | Sallify Technologies",
  description: "Insights on product strategy, web development, mobile apps, systems, and growth from Sallify Technologies.",
}

export const revalidate = 120

type SearchParams = {
  category?: string
  tag?: string
}

function normalizeFilterValue(value?: string) {
  return (value || "all").trim().toLowerCase()
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const category = normalizeFilterValue(params.category)
  const tag = normalizeFilterValue(params.tag)

  const posts = await getPublishedBlogPosts()

  const categories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b)
  )
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  )

  const filtered = posts.filter((post) => {
    const categoryMatch =
      category === "all" || post.category.trim().toLowerCase() === category
    const tagMatch =
      tag === "all" || post.tags.some((item) => item.trim().toLowerCase() === tag)
    return categoryMatch && tagMatch
  })

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section id="blog-hero" className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-section)] via-[var(--color-section-alt)] to-[var(--color-bg)] p-8 text-[var(--color-heading)] shadow-lg dark:from-[var(--color-footer)] dark:via-[var(--color-section-alt)] dark:to-[var(--color-footer)] dark:text-[var(--color-on-dark)] sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />
          <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] dark:text-[var(--color-muted-on-dark)]">Sallify Blog</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl lg:text-5xl">Practical Insights for Product, Engineering, and Digital Growth</h1>
          <p className="mt-4 max-w-3xl text-sm text-[var(--color-body)] dark:text-[var(--color-body-on-dark)] sm:text-base">
            Read strategy and implementation guides from our team. Learn how we approach delivery, performance, design systems, and scalable software.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-5 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] dark:bg-[var(--color-section)] dark:text-[var(--color-heading)] dark:hover:bg-[var(--color-section-alt)]">
              Start Your Project
            </Link>
            <Link href="/services" className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-heading)] dark:border-[var(--color-border-on-dark)] dark:text-[var(--color-on-dark)] dark:hover:border-[var(--color-on-dark)] dark:hover:bg-[var(--color-on-dark)]/10">
              View Services
            </Link>
          </div>
          </div>
        </section>

        <section id="blog-filters" className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] dark:text-[var(--color-subheading)]">Filter By Category</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/blog?category=all&tag=${encodeURIComponent(tag)}`}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  category === "all"
                    ? "border-[var(--color-primary)] bg-[var(--color-footer)] text-[var(--color-on-dark)] dark:border-[var(--color-primary)] dark:bg-[var(--color-primary)] dark:text-[var(--color-on-dark)]"
                    : "border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-primary)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
                }`}
              >
                All
              </Link>
              {categories.map((item) => (
                <Link
                  key={item}
                  href={`/blog?category=${encodeURIComponent(item)}&tag=${encodeURIComponent(tag)}`}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    category === item.trim().toLowerCase()
                      ? "border-[var(--color-primary)] bg-[var(--color-footer)] text-[var(--color-on-dark)] dark:border-[var(--color-primary)] dark:bg-[var(--color-primary)] dark:text-[var(--color-on-dark)]"
                      : "border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-primary)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] dark:text-[var(--color-subheading)]">Filter By Tag</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/blog?category=${encodeURIComponent(category)}&tag=all`}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tag === "all"
                    ? "border-[var(--color-primary)] bg-[var(--color-footer)] text-[var(--color-on-dark)] dark:border-[var(--color-primary)] dark:bg-[var(--color-primary)] dark:text-[var(--color-on-dark)]"
                    : "border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-primary)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
                }`}
              >
                All Tags
              </Link>
              {tags.map((item) => (
                <Link
                  key={item}
                  href={`/blog?category=${encodeURIComponent(category)}&tag=${encodeURIComponent(item)}`}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    tag === item.trim().toLowerCase()
                      ? "border-[var(--color-primary)] bg-[var(--color-footer)] text-[var(--color-on-dark)] dark:border-[var(--color-primary)] dark:bg-[var(--color-primary)] dark:text-[var(--color-on-dark)]"
                      : "border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-primary)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
                  }`}
                >
                  #{item}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {filtered.length ? (
          <section id="blog-posts" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-section)] p-8 text-sm text-[var(--color-body)] dark:border-[var(--color-border)] dark:bg-[var(--color-footer)] dark:text-[var(--color-heading)]/85">
            No blog posts match this filter.
          </section>
        )}
      </div>
    </main>
  )
}
