"use client"

type PortfolioFiltersProps = {
  filters: string[]
  active: string
  onChange: (value: string) => void
}

export default function PortfolioFilters({ filters, active, onChange }: PortfolioFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = filter === active
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            aria-pressed={isActive}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-[var(--color-primary)] bg-[var(--color-footer)] text-[var(--color-on-dark)]"
                : "border-[var(--color-border)] bg-[var(--color-section)] text-[var(--color-body)] hover:border-[var(--color-primary)] hover:text-[var(--color-heading)]"
            }`}
          >
            {filter}
          </button>
        )
      })}
    </div>
  )
}
