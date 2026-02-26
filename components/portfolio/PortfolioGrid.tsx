"use client"

import { useMemo, useState } from "react"
import PortfolioCard from "@/components/portfolio/PortfolioCard"
import PortfolioFilters from "@/components/portfolio/PortfolioFilters"
import { PortfolioProject } from "@/lib/firestore/getPortfolioProjects"

type PortfolioGridProps = {
  projects: PortfolioProject[]
}

const filterLabelMap: Record<string, string> = {
  "Web Development": "Web Development",
  "Mobile Development": "Mobile Apps",
  "System Development": "Systems",
  Graphics: "Graphics Design",
  SEO: "SEO",
  "Digital Marketing": "Digital Marketing",
}

function normalizeCategory(category: string) {
  const key = category.trim()
  return filterLabelMap[key] || key || "Other"
}

export default function PortfolioGrid({ projects }: PortfolioGridProps) {
  const filters = useMemo(() => {
    const dynamic = Array.from(new Set(projects.map((project) => normalizeCategory(project.category))))
    const preferredOrder = ["All Projects", "Web Development", "Mobile Apps", "Systems", "Graphics Design", "SEO", "Digital Marketing"]

    const merged = ["All Projects", ...dynamic.filter((value) => value !== "All Projects")]
    merged.sort((a, b) => {
      const aPos = preferredOrder.indexOf(a)
      const bPos = preferredOrder.indexOf(b)
      if (aPos === -1 && bPos === -1) return a.localeCompare(b)
      if (aPos === -1) return 1
      if (bPos === -1) return -1
      return aPos - bPos
    })

    return merged
  }, [projects])

  const [activeFilter, setActiveFilter] = useState("All Projects")

  const filtered = useMemo(() => {
    if (activeFilter === "All Projects") return projects
    return projects.filter((project) => normalizeCategory(project.category) === activeFilter)
  }, [activeFilter, projects])

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Portfolio Library</p>
          <h2 className="text-2xl font-semibold text-[var(--color-heading)] sm:text-3xl">Browse Projects By Capability</h2>
        </div>
        <PortfolioFilters filters={filters} active={activeFilter} onChange={setActiveFilter} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((project) => (
          <PortfolioCard key={project.id} project={project} />
        ))}
      </div>

      {!filtered.length ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-section)] px-5 py-7 text-sm text-[var(--color-body)]">
          No projects available for this filter yet.
        </div>
      ) : null}
    </section>
  )
}
