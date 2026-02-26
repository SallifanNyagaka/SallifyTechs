import Image from "next/image"
import type { BlogPostRecord } from "@/lib/firestore/getBlogs"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"
import BloggerInfo from "@/components/blog/BloggerInfo"

function formatDate(value?: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export default function BlogHero({ post }: { post: BlogPostRecord }) {
  const imageSrc = resolveFirebaseImageUrl(post.heroImageUrl) || "/favicon.ico"
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-sm">
      <div className="relative h-64 w-full sm:h-80 lg:h-[28rem]">
        <Image src={imageSrc} alt={post.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 80vw" priority unoptimized />
      </div>
      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-[var(--color-section-alt)] px-2.5 py-1 font-medium text-[var(--color-body)]">{post.category}</span>
          {post.tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--color-border)] px-2 py-1 text-[var(--color-muted)]">#{tag}</span>)}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl text-[var(--color-heading)]">{post.title}</h1>
        <BloggerInfo name={post.bloggerName} photoUrl={post.bloggerPhotoUrl} dateLabel={formatDate(post.publishedDate)} />
      </div>
    </section>
  )
}
