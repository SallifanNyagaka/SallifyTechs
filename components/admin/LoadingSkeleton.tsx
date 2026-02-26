import Spinner from "@/components/ui/Spinner"

export default function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Spinner label="Loading content..." className="mb-2" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-10 w-full animate-pulse rounded-xl bg-[var(--color-section-alt)]" />
      ))}
    </div>
  )
}
