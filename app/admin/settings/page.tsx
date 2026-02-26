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

function getMethodByPlatform(methods: ContactMethod[], ...platforms: string[]) {
  const normalized = platforms.map((item) => item.trim().toLowerCase())
  return methods.find((item) =>
    normalized.includes(String(item.platform || "").trim().toLowerCase())
  )
}

export default function SettingsManager() {
  const settings = useDocument<SiteSettings>("settings", "site")
  const methods = useCollection<ContactMethod>("contact_methods")
  const { notify } = useToast()
  const [values, setValues] = useState<SiteSettings>({})

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

  if (settings.loading || methods.loading) return <LoadingSkeleton rows={8} />

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
    </EditorLayout>
  )
}
