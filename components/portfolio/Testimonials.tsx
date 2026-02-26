import { PortfolioProject } from "@/lib/firestore/getPortfolioProjects"

type TestimonialsProps = {
  projects: PortfolioProject[]
}

export default function Testimonials({ projects }: TestimonialsProps) {
  const items = projects.filter((project) => project.testimonial).slice(0, 6)
  if (!items.length) return null

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Client Voices</p>
        <h2 className="text-2xl font-semibold text-[var(--color-heading)] sm:text-3xl">Testimonials From Real Delivery Engagements</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((project) => (
          <article key={project.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
            <p className="text-sm leading-6 text-[var(--color-body)]">&quot;{project.testimonial}&quot;</p>
            <div className="mt-4 border-t border-[var(--color-border)] pt-3">
              <p className="text-sm font-semibold text-[var(--color-heading)]">{project.testimonialAuthor}</p>
              <p className="text-xs text-[var(--color-muted)]">{project.title}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
