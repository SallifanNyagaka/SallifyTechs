"use client"

import ToastProvider from "@/components/admin/ToastProvider"
import AdminLayout from "@/components/admin/AdminLayout"

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminLayout>{children}</AdminLayout>
    </ToastProvider>
  )
}
