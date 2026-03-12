import { doc, getDoc } from "firebase/firestore"
import { unstable_noStore as noStore } from "next/cache"
import { firestore } from "@/lib/firebase"

export type SiteSettingsRecord = {
  siteName?: string
  logo?: string
  logoUrl?: string
  branding?: {
    logo?: string
    favicon?: string
  }
}

export async function getSiteSettings(): Promise<SiteSettingsRecord> {
  noStore()
  const snap = await getDoc(doc(firestore, "settings", "site"))
  if (!snap.exists()) return {}
  return snap.data() as SiteSettingsRecord
}
