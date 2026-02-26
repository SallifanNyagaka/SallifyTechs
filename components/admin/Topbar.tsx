export default function Topbar({
  onOpenMenu,
  onSignOut,
}: {
  onOpenMenu: () => void
  onSignOut: () => void
}) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-section)] px-6 py-4">
      <button onClick={onOpenMenu} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-body)] lg:hidden">
        Menu
      </button>
      <div className="hidden items-center gap-2 lg:flex">
        <span className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)]">Admin</span>
      </div>
      <button onClick={onSignOut} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)]">
        Sign out
      </button>
    </header>
  )
}
