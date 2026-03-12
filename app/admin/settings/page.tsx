"use client"

import { useEffect, useState } from "react"
import EditorLayout from "@/components/admin/EditorLayout"
import FormBuilder from "@/components/admin/FormBuilder"
import ImageUploader from "@/components/admin/ImageUploader"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import { SiteSettings } from "@/types/cms"
import { useDocument } from "@/hooks/admin/useDocument"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"

type ContactMethod = {
  id?: string
  platform?: string
  value?: string
  iconUrl?: string
  order?: number
  active?: boolean
}

type StaticSeoDoc = {
  id?: string
  slug?: string
  title?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    canonicalUrl?: string
    ogImage?: string
    noIndex?: boolean
  }
  updatedAt?: unknown
}

const STATIC_PAGE_IDS = ["home", "about", "services", "portfolio", "blog", "process", "testimonials", "contact"]

function getMethodByPlatform(methods: ContactMethod[], ...platforms: string[]) {
  const normalized = platforms.map((item) => item.trim().toLowerCase())
  return methods.find((item) =>
    normalized.includes(String(item.platform || "").trim().toLowerCase())
  )
}

export default function SettingsManager() {
  const settings = useDocument<SiteSettings>("settings", "site")
  const methods = useCollection<ContactMethod>("contact_methods")
  const staticSeo = useCollection<StaticSeoDoc>("static_pages")
  const { notify } = useToast()
  const [values, setValues] = useState<SiteSettings>({})
  const [selectedStaticPage, setSelectedStaticPage] = useState("home")
  const [seoKeywordsDraft, setSeoKeywordsDraft] = useState("")
  const [staticSeoValues, setStaticSeoValues] = useState<StaticSeoDoc>({ slug: "home", seo: {} })

  useEffect(() => {
    const settingsData = settings.data
    if (!settingsData) return
    const emailMethod = getMethodByPlatform(methods.data, "Email")
    const phoneMethod = getMethodByPlatform(methods.data, "WhatsApp", "Phone")
    const frame = requestAnimationFrame(() =>
      setValues({
        ...settingsData,
        email: emailMethod?.value || settingsData.email || "",
        phone: phoneMethod?.value || settingsData.phone || "",
      })
    )
    return () => cancelAnimationFrame(frame)
  }, [settings.data, methods.data])

  useEffect(() => {
    const current = staticSeo.data.find((item) => (item.slug || item.id) === selectedStaticPage)
    const next: StaticSeoDoc = current || { slug: selectedStaticPage, title: selectedStaticPage, seo: {} }
    const frame = requestAnimationFrame(() => {
      setStaticSeoValues(next)
      setSeoKeywordsDraft((next.seo?.keywords || []).join(", "))
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedStaticPage, staticSeo.data])

  if (settings.loading || methods.loading || staticSeo.loading) return <LoadingSkeleton rows={8} />

  const saveSettings = async () => {
    const emailMethod = getMethodByPlatform(methods.data, "Email")
    const whatsappMethod = getMethodByPlatform(methods.data, "WhatsApp")
    const phoneMethod = getMethodByPlatform(methods.data, "Phone")

    await Promise.all([
      upsertDocument("settings", "site", values),
      upsertDocument("contact_methods", "method-email", {
        id: "method-email",
        platform: "Email",
        value: values.email || "",
        iconUrl:
          emailMethod?.iconUrl || "gs://sallify-tech.appspot.com/media/contact/icon-email.svg",
        order: emailMethod?.order ?? 1,
        active: true,
      }),
      upsertDocument("contact_methods", "method-whatsapp", {
        id: "method-whatsapp",
        platform: "WhatsApp",
        value: values.phone || "",
        iconUrl:
          whatsappMethod?.iconUrl || "gs://sallify-tech.appspot.com/media/contact/icon-whatsapp.svg",
        order: whatsappMethod?.order ?? 2,
        active: true,
      }),
      upsertDocument("contact_methods", "method-phone", {
        id: "method-phone",
        platform: "Phone",
        value: values.phone || "",
        iconUrl: phoneMethod?.iconUrl || "",
        order: phoneMethod?.order ?? 6,
        active: true,
      }),
    ])
    notify("Settings updated")
  }

  const saveBrandingAsset = async (field: "logo" | "favicon", url: string) => {
    setValues((prev) => ({
      ...prev,
      branding: { ...(prev.branding || {}), [field]: url },
    }))

    await upsertDocument("settings", "site", {
      branding: { ...(values.branding || {}), [field]: url },
      ...(field === "logo" ? { logo: url, logoUrl: url } : {}),
    })

    notify(`${field === "logo" ? "Logo" : "Favicon"} uploaded`)
  }

  const removeBrandingAsset = async (field: "logo" | "favicon") => {
    const nextBranding = { ...(values.branding || {}) }
    delete nextBranding[field]
    setValues((prev) => ({ ...prev, branding: nextBranding }))
    await upsertDocument("settings", "site", {
      branding: nextBranding,
      ...(field === "logo" ? { logo: "", logoUrl: "" } : {}),
    })
    notify(`${field === "logo" ? "Logo" : "Favicon"} removed`)
  }

  const saveStaticSeo = async () => {
    const slug = selectedStaticPage
    await upsertDocument("static_pages", slug, {
      id: slug,
      slug,
      title: staticSeoValues.title || slug,
      seo: {
        ...(staticSeoValues.seo || {}),
        keywords: seoKeywordsDraft
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
      updatedAt: new Date().toISOString(),
    })
    notify("Static page SEO updated")
  }

  return (
    <EditorLayout
      title="Site Settings"
      subtitle="Manage global branding and contact information."
      actions={
        <button
          onClick={saveSettings}
          className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]"
        >
          Save Settings
        </button>
      }
    >
      <FormBuilder
        fields={[
          { name: "siteName", label: "Site Name" },
          { name: "domain", label: "Domain" },
          { name: "email", label: "Email" },
          { name: "phone", label: "Phone" },
          { name: "address", label: "Address", type: "textarea" as const },
        ]}
        values={values as unknown as Record<string, unknown>}
        onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
      />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <ImageUploader
          folder="media/branding"
          label="Logo"
          currentUrl={values.branding?.logo}
          relatedCollection="settings"
          relatedId="site"
          relatedTitle="Global site logo"
          onDeleted={() => void removeBrandingAsset("logo")}
          onUploaded={(url) => saveBrandingAsset("logo", url)}
        />
        <ImageUploader
          folder="media/branding"
          label="Favicon"
          currentUrl={values.branding?.favicon}
          relatedCollection="settings"
          relatedId="site"
          relatedTitle="Global site favicon"
          onDeleted={() => void removeBrandingAsset("favicon")}
          onUploaded={(url) => saveBrandingAsset("favicon", url)}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--color-heading)]">Static Pages SEO</h3>
          <button
            onClick={saveStaticSeo}
            className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]"
          >
            Save SEO
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-[var(--color-body)]">
            Page
            <select
              value={selectedStaticPage}
              onChange={(event) => setSelectedStaticPage(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            >
              {STATIC_PAGE_IDS.map((pageId) => (
                <option key={pageId} value={pageId}>
                  {pageId}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[var(--color-body)]">
            Label
            <input
              value={staticSeoValues.title || ""}
              onChange={(event) => setStaticSeoValues((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            />
          </label>
          <label className="text-sm font-medium text-[var(--color-body)] md:col-span-2">
            Meta Title
            <input
              value={staticSeoValues.seo?.metaTitle || ""}
              onChange={(event) =>
                setStaticSeoValues((prev) => ({
                  ...prev,
                  seo: { ...(prev.seo || {}), metaTitle: event.target.value },
                }))
              }
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            />
          </label>
          <label className="text-sm font-medium text-[var(--color-body)] md:col-span-2">
            Meta Description
            <textarea
              value={staticSeoValues.seo?.metaDescription || ""}
              onChange={(event) =>
                setStaticSeoValues((prev) => ({
                  ...prev,
                  seo: { ...(prev.seo || {}), metaDescription: event.target.value },
                }))
              }
              className="mt-2 min-h-[100px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            />
          </label>
          <label className="text-sm font-medium text-[var(--color-body)] md:col-span-2">
            Keywords (comma-separated)
            <input
              value={seoKeywordsDraft}
              onChange={(event) => setSeoKeywordsDraft(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            />
          </label>
          <label className="text-sm font-medium text-[var(--color-body)] md:col-span-2">
            Canonical URL
            <input
              value={staticSeoValues.seo?.canonicalUrl || ""}
              onChange={(event) =>
                setStaticSeoValues((prev) => ({
                  ...prev,
                  seo: { ...(prev.seo || {}), canonicalUrl: event.target.value },
                }))
              }
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            />
          </label>
          <label className="text-sm font-medium text-[var(--color-body)] md:col-span-2">
            OG Image URL
            <input
              value={staticSeoValues.seo?.ogImage || ""}
              onChange={(event) =>
                setStaticSeoValues((prev) => ({
                  ...prev,
                  seo: { ...(prev.seo || {}), ogImage: event.target.value },
                }))
              }
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-body)]">
            <input
              type="checkbox"
              checked={Boolean(staticSeoValues.seo?.noIndex)}
              onChange={(event) =>
                setStaticSeoValues((prev) => ({
                  ...prev,
                  seo: { ...(prev.seo || {}), noIndex: event.target.checked },
                }))
              }
            />
            No index
          </label>
        </div>
      </section>
    </EditorLayout>
  )
}
