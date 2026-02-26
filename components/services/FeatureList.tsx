type FeatureListProps = {
  title: string
  items?: string[]
}

export default function FeatureList({ title, items = [] }: FeatureListProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[var(--color-heading)]">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((feature) => (
          <li key={feature} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section-alt)] px-4 py-3 text-sm text-[var(--color-body)]">
            {feature}
          </li>
        ))}
      </ul>
    </section>
  )
}
