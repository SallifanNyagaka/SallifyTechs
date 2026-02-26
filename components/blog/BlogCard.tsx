import Image from "next/image"
import Link from "next/link"
import type { BlogPostRecord } from "@/lib/firestore/getBlogs"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"
import BloggerInfo from "@/components/blog/BloggerInfo"

function formatDate(value?: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function BlogCard({ post }: { post: BlogPostRecord }) {
  const imageSrc = resolveFirebaseImageUrl(post.heroImageUrl) || "/favicon.ico"
  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 w-full overflow-hidden">
        <Image src={imageSrc} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 25vw" unoptimized />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[var(--color-section-alt)] px-2.5 py-1 font-medium text-[var(--color-body)]">{post.category}</span>
          {post.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full border border-[var(--color-border)] px-2 py-1 text-[var(--color-muted)]">#{tag}</span>)}
        </div>
        <h2 className="line-clamp-2 text-xl font-semibold text-[var(--color-heading)]">{post.title}</h2>
        <p className="line-clamp-3 text-sm text-[var(--color-body)]">{post.excerpt}</p>
        <BloggerInfo name={post.bloggerName} photoUrl={post.bloggerPhotoUrl} dateLabel={formatDate(post.publishedDate)} />
        <Link href={`/blog/${post.slug}`} className="inline-flex items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:text-[var(--color-on-dark)]">Read More</Link>
      </div>
    </article>
  )
}
