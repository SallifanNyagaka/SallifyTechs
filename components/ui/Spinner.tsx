export default function Spinner({
  size = "md",
  label = "Loading",
  className = "",
}: {
  size?: "sm" | "md" | "lg"
  label?: string
  className?: string
}) {
  const sizeClass =
    size === "sm" ? "h-4 w-4 border-2" : size === "lg" ? "h-8 w-8 border-4" : "h-6 w-6 border-2"

  return (
    <div className={`inline-flex items-center gap-2 text-[var(--color-body)] ${className}`}>
      <span
        className={`${sizeClass} animate-spin rounded-full border-[var(--color-border)] border-t-[var(--color-primary)]`}
        aria-hidden="true"
      />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}
