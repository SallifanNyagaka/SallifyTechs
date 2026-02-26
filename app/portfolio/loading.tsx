export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 sm:px-6 lg:px-10 dark:bg-[var(--color-bg)]">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <div className="h-72 animate-pulse rounded-3xl bg-[var(--color-section-alt)] dark:bg-[var(--color-footer)]" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-3xl bg-[var(--color-section-alt)] dark:bg-[var(--color-footer)]" />
          <div className="h-96 animate-pulse rounded-3xl bg-[var(--color-section-alt)] dark:bg-[var(--color-footer)]" />
        </div>
        <div className="h-12 w-full animate-pulse rounded-2xl bg-[var(--color-section-alt)] dark:bg-[var(--color-footer)]" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-[var(--color-section-alt)] dark:bg-[var(--color-footer)]" />
          ))}
        </div>
      </div>
    </main>
  )
}
