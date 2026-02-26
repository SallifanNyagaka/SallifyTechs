import type { Metadata } from "next"
import Link from "next/link"
import PortfolioHero from "@/components/portfolio/PortfolioHero"
import FeaturedProjects from "@/components/portfolio/FeaturedProjects"
import PortfolioGrid from "@/components/portfolio/PortfolioGrid"
import Testimonials from "@/components/portfolio/Testimonials"
import PortfolioCTA from "@/components/portfolio/PortfolioCTA"
import ProjectForm from "@/components/forms/ProjectForm"
import { getPortfolioProjects } from "@/lib/firestore/getPortfolioProjects"

export const metadata: Metadata = {
  title: "Portfolio | Sallify Technologies",
  description: "Explore Sallify Technologies project portfolio across web, mobile, systems, graphics, SEO, and digital marketing.",
}

export const revalidate = 120

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects()
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 4)

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <div id="portfolio-hero">
          <PortfolioHero projectCount={projects.length} featuredCount={featuredProjects.length} />
        </div>

        <div id="portfolio-featured">
          <FeaturedProjects projects={featuredProjects} />
        </div>

        <div id="portfolio-grid">
          <PortfolioGrid projects={projects} />
        </div>

        <Testimonials projects={projects} />

        <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] px-6 py-10 shadow-sm sm:px-10 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] dark:text-[var(--color-subheading)]">How We Deliver</p>
              <h2 className="text-2xl font-semibold sm:text-3xl dark:text-[var(--color-heading)]">Our Process Is Built for Reliability, Speed, and Transparency</h2>
              <p className="max-w-2xl text-sm text-[var(--color-body)] sm:text-base dark:text-[var(--color-heading)]/85">
                From discovery to launch, our workflow keeps stakeholders aligned and reduces project risk at each milestone.
              </p>
            </div>
            <Link
              href="/process"
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-footer)] hover:text-[var(--color-on-dark)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)] dark:hover:border-[var(--color-primary)] dark:hover:bg-[var(--color-primary-hover)] dark:hover:text-[var(--color-on-dark)]"
            >
              View Our Process
            </Link>
          </div>
        </section>

        <div id="portfolio-form">
          <ProjectForm
            title="Have a Project Similar to These Results?"
            description="Share your product goals and references. We will respond with delivery approach, timeline, and budget guidance."
            submitLabel="Start My Project"
            formId="portfolio-project-form"
          />
        </div>

        <div id="portfolio-cta">
          <PortfolioCTA />
        </div>
      </div>
    </main>
  )
}
