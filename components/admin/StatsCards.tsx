export default function StatsCards({
  cards,
}: {
  cards: { label: string; value: number | string; hint?: string }[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">{card.label}</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-heading)]">{card.value}</p>
          {card.hint ? <p className="mt-1 text-sm text-[var(--color-muted)]">{card.hint}</p> : null}
        </article>
      ))}
    </div>
  )
}
