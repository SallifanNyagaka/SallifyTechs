import Image from "next/image"
import Link from "next/link"
import { PortfolioProject } from "@/lib/firestore/getPortfolioProjects"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

type PortfolioCardProps = {
  project: PortfolioProject
}

export default function PortfolioCard({ project }: PortfolioCardProps) {
  const imageSrc = resolveFirebaseImageUrl(project.thumbnailUrl || project.coverImageUrl) || "/favicon.ico"

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-[var(--color-section-alt)] px-2.5 py-1 text-xs font-medium text-[var(--color-body)]">
            {project.category}
          </span>
          <span className="text-xs text-[var(--color-muted)]">{project.clientName}</span>
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-heading)]">{project.title}</h3>
        <p className="line-clamp-3 text-sm text-[var(--color-body)]">{project.projectSummary}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.technologies.slice(0, 3).map((tech) => (
            <span key={tech} className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[11px] text-[var(--color-body)]">
              {tech}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/portfolio/${project.slug}`}
            className="inline-flex items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-footer)] hover:text-[var(--color-on-dark)]"
          >
            View Case Study
          </Link>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-heading)]"
            >
              Live Site
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
