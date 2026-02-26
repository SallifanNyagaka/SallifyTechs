"use client"

import { useMemo, useState } from "react"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import DataTable from "@/components/admin/DataTable"
import EditorLayout from "@/components/admin/EditorLayout"
import FormBuilder from "@/components/admin/FormBuilder"
import ImageUploader from "@/components/admin/ImageUploader"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import { useToast } from "@/components/admin/ToastProvider"
import { useCollection } from "@/hooks/admin/useCollection"
import { useDocument } from "@/hooks/admin/useDocument"
import { removeDocument, upsertDocument } from "@/services/firestore"

type FooterLink = {
  id?: string
  category?: string
  label?: string
  url?: string
  order?: number
  status?: "draft" | "published"
}

type FooterSocial = {
  id?: string
  platform?: string
  url?: string
  iconUrl?: string
  order?: number
  status?: "draft" | "published"
}

type FooterLegal = {
  id?: string
  label?: string
  url?: string
  order?: number
  status?: "draft" | "published"
}

type FooterContacts = {
  id?: string
  contactText?: string
  email?: string
  phone?: string
  address?: string
  status?: "draft" | "published"
}

type FooterCta = {
  id?: string
  title?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  status?: "draft" | "published"
}

export default function FooterAdminPage() {
  const { notify } = useToast()

  const links = useCollection<FooterLink>("footer_links")
  const socials = useCollection<FooterSocial>("footer_socials")
  const legal = useCollection<FooterLegal>("footer_legal")
  const contacts = useDocument<FooterContacts>("footer_contacts", "primary")
  const cta = useDocument<FooterCta>("footer_cta", "cta")

  const [linkValues, setLinkValues] = useState<FooterLink>({ status: "published", category: "Quick Links" })
  const [socialValues, setSocialValues] = useState<FooterSocial>({ status: "published" })
  const [legalValues, setLegalValues] = useState<FooterLegal>({ status: "published" })
  const [contactsValues, setContactsValues] = useState<FooterContacts | null>(null)
  const [ctaValues, setCtaValues] = useState<FooterCta | null>(null)

  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null)
  const [deleteSocialId, setDeleteSocialId] = useState<string | null>(null)
  const [deleteLegalId, setDeleteLegalId] = useState<string | null>(null)

  const loading = links.loading || socials.loading || legal.loading || contacts.loading || cta.loading
  const effectiveContacts = (contactsValues || contacts.data || { status: "published" }) as FooterContacts
  const effectiveCta = (ctaValues || cta.data || { status: "published" }) as FooterCta

  const sortedLinks = useMemo(
    () => [...links.data].sort((a, b) => String(a.category || "").localeCompare(String(b.category || "")) || Number(a.order || 0) - Number(b.order || 0)),
    [links.data]
  )
  const sortedSocials = useMemo(
    () => [...socials.data].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [socials.data]
  )
  const sortedLegal = useMemo(
    () => [...legal.data].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [legal.data]
  )

  if (loading) return <LoadingSkeleton rows={10} />

  const saveLink = async () => {
    if (!linkValues.category || !linkValues.label || !linkValues.url) {
      notify("Category, label, and URL are required for footer links")
      return
    }

    const id =
      linkValues.id ||
      `${linkValues.category}-${linkValues.label}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    await upsertDocument("footer_links", id, {
      ...linkValues,
      id,
      order: Number(linkValues.order || 0),
      status: linkValues.status || "published",
    })
    setLinkValues({ status: "published", category: "Quick Links" })
    notify("Footer link saved")
  }

  const saveSocial = async () => {
    if (!socialValues.platform || !socialValues.url) {
      notify("Platform and URL are required for footer socials")
      return
    }
    const id =
      socialValues.id ||
      `social-${socialValues.platform}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    await upsertDocument("footer_socials", id, {
      ...socialValues,
      id,
      order: Number(socialValues.order || 0),
      status: socialValues.status || "published",
    })
    setSocialValues({ status: "published" })
    notify("Footer social saved")
  }

  const saveLegal = async () => {
    if (!legalValues.label || !legalValues.url) {
      notify("Label and URL are required for legal links")
      return
    }
    const id =
      legalValues.id ||
      `legal-${legalValues.label}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    await upsertDocument("footer_legal", id, {
      ...legalValues,
      id,
      order: Number(legalValues.order || 0),
      status: legalValues.status || "published",
    })
    setLegalValues({ status: "published" })
    notify("Footer legal link saved")
  }

  const saveContacts = async () => {
    const values = effectiveContacts
    await upsertDocument("footer_contacts", "primary", {
      contactText: values.contactText || "Get in touch",
      email: values.email || "",
      phone: values.phone || "",
      address: values.address || "",
      status: values.status || "published",
    })
    notify("Footer contact block saved")
  }

  const saveCta = async () => {
    const values = effectiveCta
    await upsertDocument("footer_cta", "cta", {
      title: values.title || "Ready to build your next product?",
      subtitle: values.subtitle || "",
      buttonText: values.buttonText || "Start a Project",
      buttonLink: values.buttonLink || "/contact",
      status: values.status || "published",
    })
    notify("Footer CTA saved")
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Footer Manager"
        subtitle="Add, edit, publish, and remove footer content blocks and links."
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5">
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">Footer Contacts</h2>
            <FormBuilder
              fields={[
                { name: "contactText", label: "Heading Text" },
                { name: "email", label: "Email" },
                { name: "phone", label: "Phone" },
                { name: "address", label: "Address", type: "textarea" },
              ]}
              values={effectiveContacts as Record<string, unknown>}
              onChange={(name, value) => setContactsValues((prev) => ({ ...(prev || effectiveContacts), [name]: value as never }))}
            />
            <button onClick={saveContacts} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
              Save Footer Contacts
            </button>
          </section>

          <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5">
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">Footer CTA</h2>
            <FormBuilder
              fields={[
                { name: "title", label: "Title" },
                { name: "subtitle", label: "Subtitle", type: "textarea" },
                { name: "buttonText", label: "Button Text" },
                { name: "buttonLink", label: "Button Link" },
              ]}
              values={effectiveCta as Record<string, unknown>}
              onChange={(name, value) => setCtaValues((prev) => ({ ...(prev || effectiveCta), [name]: value as never }))}
            />
            <button onClick={saveCta} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
              Save Footer CTA
            </button>
          </section>
        </div>
      </EditorLayout>

      <EditorLayout title="Footer Links" subtitle="Manage grouped navigation links in the footer.">
        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5">
          <FormBuilder
            fields={[
              { name: "category", label: "Category (e.g., Quick Links)" },
              { name: "label", label: "Label" },
              { name: "url", label: "URL" },
              { name: "order", label: "Order", type: "number" },
              {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                  { label: "Published", value: "published" },
                  { label: "Draft", value: "draft" },
                ],
              },
            ]}
            values={linkValues as Record<string, unknown>}
            onChange={(name, value) => setLinkValues((prev) => ({ ...prev, [name]: value as never }))}
          />
          <button onClick={saveLink} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
            Save Footer Link
          </button>
        </section>

        <DataTable
          data={sortedLinks}
          columns={[
            { header: "Category", accessor: (row) => row.category || "" },
            { header: "Label", accessor: (row) => row.label || "" },
            { header: "URL", accessor: (row) => row.url || "" },
            { header: "Order", accessor: (row) => row.order ?? 0 },
            { header: "Status", accessor: (row) => row.status || "published" },
            {
              header: "Actions",
              accessor: (row) => (
                <div className="flex gap-2">
                  <button className="text-xs font-semibold text-[var(--color-body)]" onClick={() => setLinkValues(row)}>
                    Edit
                  </button>
                  <button className="text-xs font-semibold text-red-500" onClick={() => setDeleteLinkId(row.id || "")}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </EditorLayout>

      <EditorLayout title="Footer Socials" subtitle="Manage social links and icons shown in footer.">
        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5">
          <FormBuilder
            fields={[
              { name: "platform", label: "Platform" },
              { name: "url", label: "URL / Deep Link" },
              { name: "iconUrl", label: "Icon URL" },
              { name: "order", label: "Order", type: "number" },
              {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                  { label: "Published", value: "published" },
                  { label: "Draft", value: "draft" },
                ],
              },
            ]}
            values={socialValues as Record<string, unknown>}
            onChange={(name, value) => setSocialValues((prev) => ({ ...prev, [name]: value as never }))}
          />
          <ImageUploader
            folder="media/footer-social-icons"
            label="Upload Social Icon"
            onUploaded={(url) => setSocialValues((prev) => ({ ...prev, iconUrl: url }))}
          />
          <button onClick={saveSocial} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
            Save Footer Social
          </button>
        </section>

        <DataTable
          data={sortedSocials}
          columns={[
            { header: "Platform", accessor: (row) => row.platform || "" },
            { header: "URL", accessor: (row) => row.url || "" },
            { header: "Icon", accessor: (row) => (row.iconUrl ? "Uploaded" : "None") },
            { header: "Order", accessor: (row) => row.order ?? 0 },
            { header: "Status", accessor: (row) => row.status || "published" },
            {
              header: "Actions",
              accessor: (row) => (
                <div className="flex gap-2">
                  <button className="text-xs font-semibold text-[var(--color-body)]" onClick={() => setSocialValues(row)}>
                    Edit
                  </button>
                  <button className="text-xs font-semibold text-red-500" onClick={() => setDeleteSocialId(row.id || "")}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </EditorLayout>

      <EditorLayout title="Footer Legal Links" subtitle="Manage privacy/terms and other legal links.">
        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5">
          <FormBuilder
            fields={[
              { name: "label", label: "Label" },
              { name: "url", label: "URL" },
              { name: "order", label: "Order", type: "number" },
              {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                  { label: "Published", value: "published" },
                  { label: "Draft", value: "draft" },
                ],
              },
            ]}
            values={legalValues as Record<string, unknown>}
            onChange={(name, value) => setLegalValues((prev) => ({ ...prev, [name]: value as never }))}
          />
          <button onClick={saveLegal} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
            Save Legal Link
          </button>
        </section>

        <DataTable
          data={sortedLegal}
          columns={[
            { header: "Label", accessor: (row) => row.label || "" },
            { header: "URL", accessor: (row) => row.url || "" },
            { header: "Order", accessor: (row) => row.order ?? 0 },
            { header: "Status", accessor: (row) => row.status || "published" },
            {
              header: "Actions",
              accessor: (row) => (
                <div className="flex gap-2">
                  <button className="text-xs font-semibold text-[var(--color-body)]" onClick={() => setLegalValues(row)}>
                    Edit
                  </button>
                  <button className="text-xs font-semibold text-red-500" onClick={() => setDeleteLegalId(row.id || "")}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </EditorLayout>

      <ConfirmDialog
        open={Boolean(deleteLinkId)}
        title="Delete footer link"
        description="This link will be removed from the footer."
        onCancel={() => setDeleteLinkId(null)}
        onConfirm={async () => {
          if (!deleteLinkId) return
          await removeDocument("footer_links", deleteLinkId)
          setDeleteLinkId(null)
          notify("Footer link removed")
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteSocialId)}
        title="Delete footer social"
        description="This social item will be removed from the footer."
        onCancel={() => setDeleteSocialId(null)}
        onConfirm={async () => {
          if (!deleteSocialId) return
          await removeDocument("footer_socials", deleteSocialId)
          setDeleteSocialId(null)
          notify("Footer social removed")
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteLegalId)}
        title="Delete legal link"
        description="This legal link will be removed from the footer."
        onCancel={() => setDeleteLegalId(null)}
        onConfirm={async () => {
          if (!deleteLegalId) return
          await removeDocument("footer_legal", deleteLegalId)
          setDeleteLegalId(null)
          notify("Legal link removed")
        }}
      />
    </div>
  )
}
