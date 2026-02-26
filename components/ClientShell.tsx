"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer/Footer"
import FloatingWhatsApp from "@/components/contact/FloatingWhatsApp"
import type { FooterData } from "@/lib/firestore/getFooterData"

type ClientShellProps = {
  children: React.ReactNode
  footerData: FooterData
}

export default function ClientShell({ children, footerData }: ClientShellProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) return <>{children}</>

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer data={footerData} />
      <FloatingWhatsApp />
    </div>
  )
}
