"use client"

export default function BlogPostError({ error }: { error: Error }) {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6 lg:px-10 dark:bg-[var(--color-bg)]">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-red-300 bg-red-50 p-6 text-red-700">
        <h1 className="text-lg font-semibold">Unable to load this article</h1>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    </main>
  )
}
