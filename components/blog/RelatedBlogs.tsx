import Link from "next/link"
import Image from "next/image"
import type { BlogPostRecord } from "@/lib/firestore/getBlogs"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

export default function RelatedBlogs({ posts }: { posts: BlogPostRecord[] }) {
  if (!posts.length) return null
  return (
    <section className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Related Articles</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {posts.map((post) => {
          const imageSrc = resolveFirebaseImageUrl(post.heroImageUrl) || "/favicon.ico"
          return (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
              <div className="relative h-36 w-full"><Image src={imageSrc} alt={post.title} fill className="object-cover" unoptimized /></div>
              <div className="space-y-2 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-[var(--color-heading)]">{post.title}</h3>
                <p className="line-clamp-2 text-xs text-[var(--color-body)]">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-xs font-semibold text-[var(--color-primary)]">Read Article</Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
