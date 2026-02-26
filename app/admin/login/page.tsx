"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/admin/useAuth"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, user, role, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const isAdminRole = role === "admin" || role === "super-admin"

  useEffect(() => {
    if (authLoading) return
    if (user && isAdminRole) {
      router.replace("/admin")
    }
  }, [authLoading, isAdminRole, router, user])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)] dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)] px-6 py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-footer)] p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-[var(--color-heading)] dark:text-[var(--color-heading)]">
          Admin Sign In
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)] dark:text-[var(--color-muted)]">
          Use your Sallify admin credentials to continue.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)] placeholder:text-[var(--color-muted)] dark:placeholder:text-[var(--color-muted)]"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)] placeholder:text-[var(--color-muted)] dark:placeholder:text-[var(--color-muted)]"
            />
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          >
            {loading || authLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}


