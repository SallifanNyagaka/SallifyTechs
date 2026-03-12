import { collection, doc, getDoc, getDocs, query } from "firebase/firestore"
import { unstable_noStore as noStore } from "next/cache"
import { firestore } from "@/lib/firebase"

export type FooterLinkItem = {
  id: string
  label: string
  url: string
  order: number
}

export type FooterLinkGroup = {
  category: string
  items: FooterLinkItem[]
}

export type FooterSocial = {
  id: string
  platform: string
  url: string
  iconUrl?: string
  order: number
}

export type FooterContact = {
  contactText: string
  email: string
  phone: string
  address: string
}

export type FooterData = {
  brand: {
    siteName: string
    description: string
    logoUrl: string
  }
  links: FooterLinkGroup[]
  contacts: FooterContact
  socials: FooterSocial[]
  cta: {
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
  }
  legal: FooterLinkItem[]
}

function normalizeUrl(url: string) {
  if (!url) return "#"
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("/")) return url
  return `/${url.replace(/^\/+/, "")}`
}

function normalizeSocialHref(platform: string, value: string) {
  if (!value) return "#"
  if (/^https?:|^mailto:|^tel:/.test(value)) return value
  const lower = platform.toLowerCase()
  if (lower.includes("email")) return `mailto:${value}`
  if (lower.includes("whatsapp")) return `https://wa.me/${value.replace(/[^\d]/g, "")}`
  if (lower.includes("telegram")) return `https://t.me/${value.replace(/^@/, "")}`
  if (lower.includes("phone")) return `tel:${value}`
  return value
}

const SOCIAL_PLATFORMS = ["whatsapp", "facebook", "instagram", "telegram", "x", "twitter", "linkedin", "youtube", "tiktok"]

function normalizePlatform(platform: string) {
  const value = platform.trim().toLowerCase()
  const matched = SOCIAL_PLATFORMS.find((item) => value.includes(item))
  return matched || value
}

export async function getFooterData(): Promise<FooterData> {
  noStore()
  const [
    linksSnap,
    contactsSnap,
    socialsSnap,
    legalSnap,
    ctaSnap,
    settingsSnap,
    contactMethodsSnap,
  ] = await Promise.all([
    getDocs(query(collection(firestore, "footer_links"))),
    getDocs(query(collection(firestore, "footer_contacts"))),
    getDocs(query(collection(firestore, "footer_socials"))),
    getDocs(query(collection(firestore, "footer_legal"))),
    getDoc(doc(firestore, "footer_cta", "cta")),
    getDoc(doc(firestore, "settings", "site")),
    getDocs(query(collection(firestore, "contact_methods"))),
  ])

  const settings = settingsSnap.exists() ? (settingsSnap.data() as Record<string, unknown>) : {}
  const branding = (settings.branding || {}) as Record<string, unknown>
  const siteName = String(settings.siteName || "Sallify Technologies")
  const logoUrl = String(branding.logo || settings.logo || settings.logoUrl || "")
  const siteDescription = String(
    settings.footerDescription ||
      settings.tagline ||
      "We design and deliver digital products that help ambitious teams grow."
  )

  const groupedLinksMap = new Map<string, FooterLinkItem[]>()
  for (const item of linksSnap.docs) {
    const raw = item.data() as Record<string, unknown>
    const category = String(raw.category || "Company")
    const link: FooterLinkItem = {
      id: item.id,
      label: String(raw.label || ""),
      url: normalizeUrl(String(raw.url || "")),
      order: Number(raw.order || 0),
    }
    if (!link.label || !link.url) continue
    const current = groupedLinksMap.get(category) || []
    current.push(link)
    groupedLinksMap.set(category, current)
  }

  const links = Array.from(groupedLinksMap.entries())
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => {
      const priority = (category: string) => {
        const normalized = category.toLowerCase()
        if (normalized === "quick links") return 0
        if (normalized === "company") return 1
        if (normalized === "services") return 2
        if (normalized === "resources") return 3
        if (normalized === "legal") return 4
        return 10
      }
      return priority(a.category) - priority(b.category) || a.category.localeCompare(b.category)
    })

  const footerContactsRaw = contactsSnap.docs[0]?.data() as Record<string, unknown> | undefined
  const contacts: FooterContact = {
    contactText: String(footerContactsRaw?.contactText || "Get in touch"),
    email: String(footerContactsRaw?.email || settings.email || ""),
    phone: String(footerContactsRaw?.phone || settings.phone || ""),
    address: String(footerContactsRaw?.address || settings.address || ""),
  }

  const contactMethodSocials = contactMethodsSnap.docs
    .map((item) => {
      const raw = item.data() as Record<string, unknown>
      return { id: item.id, ...raw } as Record<string, unknown> & { id: string }
    })
    .filter((item) => item.active !== false)
    .filter((item) => SOCIAL_PLATFORMS.some((platform) => String(item.platform || "").toLowerCase().includes(platform)))
    .map((item) => ({
      id: String(item.id),
      platform: String(item.platform || ""),
      platformKey: normalizePlatform(String(item.platform || "")),
      url: normalizeSocialHref(String(item.platform || ""), String(item.value || "")),
      iconUrl: String(item.iconUrl || item.icon_url || ""),
      order: Number(item.order || 0),
    }))
    .filter((item) => item.platform && item.url)

  const footerSocialsRaw = socialsSnap.docs
    .map((item) => {
      const raw = item.data() as Record<string, unknown>
      return { id: item.id, ...raw } as Record<string, unknown> & { id: string }
    })
    .map((item) => {
      const platform = String(item.platform || "")
      const normalized = normalizeSocialHref(platform, String(item.url || item.value || ""))
      const matchedContact = contactMethodSocials.find(
        (social) =>
          social.platformKey === normalizePlatform(platform) ||
          social.platform.toLowerCase() === platform.toLowerCase()
      )
      return {
        id: String(item.id),
        platform,
        platformKey: normalizePlatform(platform),
        url: normalized,
        // Keep footer icons in sync with contact_methods, fallback to footer value.
        iconUrl: String(matchedContact?.iconUrl || item.iconUrl || ""),
        order: Number(item.order || 0),
      }
    })
    .filter((item) => item.platform && item.url)

  const footerByPlatform = new Map(footerSocialsRaw.map((item) => [item.platformKey, item]))
  const mergedSocials = contactMethodSocials.map((item) => {
    const footerOverride = footerByPlatform.get(item.platformKey)
    return {
      id: footerOverride?.id || item.id,
      platform: item.platform,
      url: footerOverride?.url || item.url,
      iconUrl: item.iconUrl || footerOverride?.iconUrl || "",
      order: footerOverride?.order ?? item.order,
    } satisfies FooterSocial
  })

  const extraFooterSocials = footerSocialsRaw
    .filter((item) => !mergedSocials.some((social) => normalizePlatform(social.platform) === item.platformKey))
    .map((item) => ({
      id: item.id,
      platform: item.platform,
      url: item.url,
      iconUrl: item.iconUrl,
      order: item.order,
    } satisfies FooterSocial))

  const socials = [...mergedSocials, ...extraFooterSocials].sort((a, b) => a.order - b.order)

  const legal = legalSnap.docs
    .map((item) => {
      const raw = item.data() as Record<string, unknown>
      return {
        id: item.id,
        label: String(raw.label || ""),
        url: normalizeUrl(String(raw.url || "")),
        order: Number(raw.order || 0),
      } satisfies FooterLinkItem
    })
    .filter((item) => item.label && item.url)
    .sort((a, b) => a.order - b.order)

  const ctaRaw = ctaSnap.exists() ? (ctaSnap.data() as Record<string, unknown>) : {}
  const cta = {
    title: String(ctaRaw.title || "Ready to build your next product?"),
    subtitle: String(ctaRaw.subtitle || "Let us turn your requirements into a clear delivery plan."),
    buttonText: String(ctaRaw.buttonText || "Start a Project"),
    buttonLink: normalizeUrl(String(ctaRaw.buttonLink || "/contact")),
  }

  return {
    brand: {
      siteName,
      description: siteDescription,
      logoUrl,
    },
    links,
    contacts,
    socials,
    cta,
    legal,
  }
}
