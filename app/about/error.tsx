"use client"

export default function AboutError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="text-xl font-semibold">About page failed to render</h1>
        <p className="mt-2 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-red-800"
        >
          Try again
        </button>
      </section>
    </main>
  )
}
