type PricingPlan = {
  name?: string
  priceKESRange?: string
  priceUSDRange?: string
  features?: string[]
  recommended?: boolean
}

type PricingTableProps = {
  plans?: PricingPlan[]
}

export default function PricingTable({ plans = [] }: PricingTableProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Pricing Plans</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-2xl border p-5 transition ${
              plan.recommended
                ? "border-[var(--color-primary)] bg-[var(--color-section)] text-[var(--color-heading)] shadow-lg dark:bg-[var(--color-footer)] dark:text-[var(--color-on-dark)]"
                : "border-[var(--color-border)] bg-[var(--color-section-alt)] text-[var(--color-body)]"
            }`}
          >
            {plan.recommended ? (
              <p className="mb-2 inline-flex rounded-full bg-[var(--color-primary)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)] dark:text-[var(--color-on-dark)]">
                Recommended
              </p>
            ) : null}
            <h3 className="text-lg font-semibold">{plan.name || ""}</h3>
            <p className="mt-3 text-sm">KES: {plan.priceKESRange || ""}</p>
            <p className="text-sm">USD: {plan.priceUSDRange || ""}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {(plan.features || []).map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
