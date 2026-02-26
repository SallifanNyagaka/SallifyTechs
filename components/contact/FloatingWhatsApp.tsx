"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { collection, onSnapshot, query } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

type WhatsAppMethod = {
  platform?: string
  value?: string
  iconUrl?: string
  active?: boolean
  order?: number
}

function buildWhatsAppHref(raw: string) {
  const value = String(raw || "").trim()
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value

  const digits = value.replace(/[^\d]/g, "")
  if (!digits) return ""
  return `https://wa.me/${digits}`
}

export default function FloatingWhatsApp() {
  const [method, setMethod] = useState<WhatsAppMethod | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(query(collection(firestore, "contact_methods")), (snapshot) => {
      const items = snapshot.docs
        .map((docSnap) => docSnap.data() as WhatsAppMethod)
        .filter((item) => item.active !== false)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))

      const whatsapp = items.find((item) =>
        String(item.platform || "").toLowerCase().includes("whatsapp")
      )
      setMethod(whatsapp ?? null)
    })

    return () => unsub()
  }, [])

  const href = useMemo(() => buildWhatsAppHref(String(method?.value || "")), [method?.value])
  const iconUrl = useMemo(() => resolveFirebaseImageUrl(method?.iconUrl), [method?.iconUrl])

  if (!method || !href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-24 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-95 sm:bottom-5 sm:left-5 sm:right-auto"
      aria-label="Chat with us on WhatsApp"
    >
      <span className="relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white/20">
        {iconUrl ? (
          <Image src={iconUrl} alt="WhatsApp" fill className="object-cover" sizes="24px" unoptimized />
        ) : (
          <span className="text-xs font-bold">W</span>
        )}
      </span>
      <span>Chat with us on WhatsApp</span>
    </a>
  )
}
