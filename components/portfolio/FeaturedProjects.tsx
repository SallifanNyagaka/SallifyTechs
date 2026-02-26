import Image from "next/image"
import Link from "next/link"
import { PortfolioProject } from "@/lib/firestore/getPortfolioProjects"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

type FeaturedProjectsProps = {
  projects: PortfolioProject[]
}

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (!projects.length) return null

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Featured Work</p>
        <h2 className="text-2xl font-semibold text-[var(--color-heading)] sm:text-3xl">Selected Case Studies</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project) => {
          const imageSrc = resolveFirebaseImageUrl(project.coverImageUrl || project.thumbnailUrl) || "/favicon.ico"
          return (
            <article
              key={project.id}
              className="group overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={project.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="space-y-3 p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
                  <span className="rounded-full bg-[var(--color-section-alt)] px-2.5 py-1 font-medium text-[var(--color-body)]">
                    {project.category}
                  </span>
                  <span>{project.clientName}</span>
                </div>
                <h3 className="text-2xl font-semibold text-[var(--color-heading)]">{project.title}</h3>
                <p className="line-clamp-3 text-sm text-[var(--color-body)]">{project.projectSummary}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  Services: {project.servicesUsed.length ? project.servicesUsed.join(" • ") : "Product Engineering"}
                </p>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="inline-flex items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-footer)] hover:text-[var(--color-on-dark)]"
                >
                  View Case Study
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
