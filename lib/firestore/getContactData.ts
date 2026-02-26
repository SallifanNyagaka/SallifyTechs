import { cache } from "react"
import { collection, getDocs, query } from "firebase/firestore"
import { firestore } from "@/lib/firebase"

export type ContactMethod = {
  id: string
  platform: string
  value: string
  iconUrl?: string
  order: number
  active: boolean
}

function normalizeMethod(id: string, raw: Record<string, unknown>): ContactMethod {
  return {
    id,
    platform: String(raw.platform || ""),
    value: String(raw.value || ""),
    iconUrl: String(raw.iconUrl || raw.icon_url || ""),
    order: Number(raw.order || 0),
    active: raw.active !== false,
  }
}

export const getContactMethods = cache(async () => {
  const snapshot = await getDocs(query(collection(firestore, "contact_methods")))
  return snapshot.docs
    .map((item) => normalizeMethod(item.id, item.data() as Record<string, unknown>))
    .filter((item) => item.active && item.platform && item.value)
    .sort((a, b) => a.order - b.order)
})

export const getProjectTypeOptions = cache(async () => {
  const snapshot = await getDocs(query(collection(firestore, "services")))
  const options = snapshot.docs
    .map((item) => String((item.data() as Record<string, unknown>).title || "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  return Array.from(new Set(options))
})
