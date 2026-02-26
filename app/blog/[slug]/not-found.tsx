import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-8 text-center dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
        <h1 className="text-2xl font-semibold">Article not found</h1>
        <p className="mt-2 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]/85">The requested blog post does not exist or is not published.</p>
        <Link href="/blog" className="mt-5 inline-flex rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-body)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)]">
          Back to Blog
        </Link>
      </div>
    </main>
  )
}
