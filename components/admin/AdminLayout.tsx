"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Sidebar from "@/components/admin/Sidebar"
import Topbar from "@/components/admin/Topbar"
import { useAuth } from "@/hooks/admin/useAuth"
import Spinner from "@/components/ui/Spinner"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, signOutUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isLoginRoute = pathname === "/admin/login"

  useEffect(() => {
    if (isLoginRoute) return
    if (!loading && !user) router.replace("/admin/login")
  }, [isLoginRoute, loading, user, router])

  const isAdminRole = role === "admin" || role === "super-admin"

  useEffect(() => {
    if (isLoginRoute) return
    if (!loading && user && !isAdminRole) {
      signOutUser().finally(() => {
        router.replace("/admin/login")
      })
    }
  }, [isAdminRole, isLoginRoute, loading, role, router, signOutUser, user])

  if (isLoginRoute) {
    return <div className="min-h-screen bg-[var(--color-bg)]">{children}</div>
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-6">
        <Spinner size="lg" label="Loading admin..." />
      </div>
    )
  }

  if (!user || !isAdminRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-6">
        <Spinner size="lg" label="Redirecting..." />
      </div>
    )
  }

  return (
    <div className="admin-surface min-h-screen bg-[var(--color-bg)] text-[var(--color-body)] transition-colors duration-300">
      <div className="flex min-h-screen">
        <Sidebar isOpen={open} onClose={() => setOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setOpen(true)} onSignOut={signOutUser} />
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
