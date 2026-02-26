"use client"

import { useMemo, useState } from "react"
import EditorLayout from "@/components/admin/EditorLayout"
import FormBuilder from "@/components/admin/FormBuilder"
import ImageUploader from "@/components/admin/ImageUploader"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import { useDocument } from "@/hooks/admin/useDocument"
import { useCollection } from "@/hooks/admin/useCollection"
import { useToast } from "@/components/admin/ToastProvider"
import { HomepageHero, HomepageCta, HomepageMain, Service } from "@/types/cms"
import { removeDocument, upsertDocument } from "@/services/firestore"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"

const heroFields = [
  { name: "title", label: "Title" },
  { name: "subtitle", label: "Subtitle" },
  { name: "description", label: "Description", type: "textarea" as const },
  { name: "primaryCTA.label", label: "Primary Button Label" },
  { name: "primaryCTA.href", label: "Primary Button Link" },
  { name: "secondaryCTA.label", label: "Secondary Button Label" },
  { name: "secondaryCTA.href", label: "Secondary Button Link" },
  { name: "servicesPreviewText", label: "Services Preview", type: "textarea" as const },
  { name: "portfolioPreviewText", label: "Portfolio Preview", type: "textarea" as const },
  { name: "blogPreviewText", label: "Blog Preview", type: "textarea" as const },
]

const ctaFields = [
  { name: "title", label: "CTA Title" },
  { name: "description", label: "CTA Description", type: "textarea" as const },
  { name: "buttonText", label: "CTA Button Text" },
  { name: "href", label: "CTA Button Link" },
]

const heroSectionFields = [
  { name: "hero.eyebrow", label: "Hero Eyebrow" },
  { name: "hero.heading", label: "Hero Heading" },
]

const servicesSectionFields = [
  { name: "services.eyebrow", label: "Services Eyebrow" },
  { name: "services.heading", label: "Services Heading" },
  { name: "services.title", label: "Services Title" },
  { name: "services.description", label: "Services Description", type: "textarea" as const },
  { name: "services.buttonText", label: "Services Button Text" },
  { name: "services.buttonHref", label: "Services Button Link" },
  { name: "services.emptyText", label: "Services Empty Text" },
]

const whyChooseUsSectionFields = [
  { name: "whyChooseUs.eyebrow", label: "Why Choose Us Eyebrow" },
  { name: "whyChooseUs.heading", label: "Why Choose Us Heading" },
  { name: "whyChooseUs.title", label: "Why Choose Us Title" },
  { name: "whyChooseUs.description", label: "Why Choose Us Description", type: "textarea" as const },
  { name: "whyChooseUs.emptyText", label: "Why Choose Us Empty Text" },
]

const portfolioSectionFields = [
  { name: "portfolio.eyebrow", label: "Portfolio Eyebrow" },
  { name: "portfolio.heading", label: "Portfolio Heading" },
  { name: "portfolio.title", label: "Portfolio Title" },
  { name: "portfolio.description", label: "Portfolio Description", type: "textarea" as const },
  { name: "portfolio.buttonText", label: "Portfolio Button Text" },
  { name: "portfolio.buttonHref", label: "Portfolio Button Link" },
  { name: "portfolio.emptyText", label: "Portfolio Empty Text" },
]

const processSectionFields = [
  { name: "process.eyebrow", label: "Process Eyebrow" },
  { name: "process.heading", label: "Process Heading" },
  { name: "process.title", label: "Process Title" },
  { name: "process.description", label: "Process Description", type: "textarea" as const },
  { name: "process.stepLabel", label: "Process Step Label" },
  { name: "process.buttonText", label: "Process Button Text" },
  { name: "process.buttonHref", label: "Process Button Link" },
  { name: "process.emptyText", label: "Process Empty Text" },
]

const ctaSectionFields = [
  { name: "cta.eyebrow", label: "CTA Eyebrow" },
  { name: "cta.heading", label: "CTA Heading" },
  { name: "cta.imageAlt", label: "CTA Image Alt" },
]

const mainSections = [
  { title: "Hero Section", fields: heroSectionFields },
  { title: "Services Section", fields: servicesSectionFields },
  { title: "Why Choose Us Section", fields: whyChooseUsSectionFields },
  { title: "Portfolio Section", fields: portfolioSectionFields },
  { title: "Process Section", fields: processSectionFields },
  { title: "CTA Section", fields: ctaSectionFields },
]

const homepageServiceFields = [
  { name: "title", label: "Service Title" },
  { name: "slug", label: "Slug (e.g. web-development)" },
  { name: "shortDescription", label: "Short Description", type: "textarea" as const },
  { name: "icon", label: "Icon Key (e.g. globe, mobile, layers, palette)" },
  { name: "iconUrl", label: "Icon URL (optional, overrides icon key)" },
  { name: "order", label: "Order", type: "number" as const },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Published", value: "published" },
      { label: "Draft", value: "draft" },
    ],
  },
]

function setByPath<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".")
  const clone: Record<string, unknown> = { ...obj }
  let cursor: Record<string, unknown> = clone

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i]
    const next = cursor[key]
    if (!next || typeof next !== "object") {
      cursor[key] = {}
    }
    cursor = cursor[key] as Record<string, unknown>
  }

  cursor[keys[keys.length - 1]] = value
  return clone as T
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function HomepageManager() {
  const hero = useDocument<HomepageHero>("homepage", "hero")
  const cta = useDocument<HomepageCta>("homepage", "cta")
  const main = useDocument<HomepageMain>("homepage", "main")
  const services = useCollection<Service>("services")
  const { notify } = useToast()

  const [heroDraft, setHeroDraft] = useState<HomepageHero | null>(null)
  const [ctaDraft, setCtaDraft] = useState<HomepageCta | null>(null)
  const [mainDraft, setMainDraft] = useState<HomepageMain | null>(null)
  const [serviceDraft, setServiceDraft] = useState<Service>({
    status: "published",
    order: 1,
  })
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null)

  const heroValues = useMemo(() => heroDraft ?? hero.data ?? {}, [heroDraft, hero.data])
  const ctaValues = useMemo(() => ctaDraft ?? cta.data ?? {}, [ctaDraft, cta.data])
  const mainValues = useMemo(() => mainDraft ?? main.data ?? {}, [mainDraft, main.data])
  const serviceRows = useMemo(
    () => [...services.data].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [services.data]
  )

  if (hero.loading || cta.loading || main.loading || services.loading) {
    return <LoadingSkeleton rows={10} />
  }

  const saveHero = async () => {
    await upsertDocument("homepage", "hero", heroValues)
    setHeroDraft(null)
    notify("Homepage hero updated")
  }

  const saveCta = async () => {
    await upsertDocument("homepage", "cta", ctaValues)
    setCtaDraft(null)
    notify("Homepage CTA updated")
  }

  const saveMain = async () => {
    await upsertDocument("homepage", "main", mainValues)
    setMainDraft(null)
    notify("Homepage section config updated")
  }

  const saveHomepageService = async () => {
    if (!serviceDraft.title || !serviceDraft.shortDescription) {
      notify("Service title and short description are required")
      return
    }

    const slug = serviceDraft.slug?.trim() || slugify(serviceDraft.title || "")
    if (!slug) {
      notify("Service slug is required")
      return
    }

    const id = serviceDraft.id || slug
    await upsertDocument("services", id, {
      ...serviceDraft,
      id,
      slug,
      status: serviceDraft.status || "published",
      order: Number(serviceDraft.order || 0),
      category: serviceDraft.category || "Homepage",
      updated_at: new Date().toISOString(),
    })

    setServiceDraft({ status: "published", order: 1 })
    notify("Homepage service saved")
  }

  const deleteHomepageService = async () => {
    if (!deleteServiceId) return
    await removeDocument("services", deleteServiceId)
    setDeleteServiceId(null)
    notify("Service removed")
  }

  return (
    <div className="space-y-10">
      <EditorLayout
        title="Homepage Hero"
        subtitle="Manage hero copy, image, and both hero buttons."
        actions={
          <button
            onClick={saveHero}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]"
          >
            Save Hero
          </button>
        }
      >
        <FormBuilder
          fields={heroFields}
          values={heroValues as unknown as Record<string, unknown>}
          onChange={(name, value) =>
            setHeroDraft((prev) =>
              setByPath((prev ?? heroValues) as Record<string, unknown>, name, value) as HomepageHero
            )
          }
        />
        <div className="mt-4">
          <ImageUploader
            folder="media/home"
            label="Hero Image"
            onUploaded={(url) => setHeroDraft((prev) => ({ ...(prev ?? heroValues), heroImage: url }))}
          />
        </div>
      </EditorLayout>

      <EditorLayout
        title="Homepage CTA"
        subtitle="Configure CTA headline, body, button and background image."
        actions={
          <button
            onClick={saveCta}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]"
          >
            Save CTA
          </button>
        }
      >
        <FormBuilder
          fields={ctaFields}
          values={ctaValues as unknown as Record<string, unknown>}
          onChange={(name, value) =>
            setCtaDraft((prev) =>
              setByPath((prev ?? ctaValues) as Record<string, unknown>, name, value) as HomepageCta
            )
          }
        />
        <div className="mt-4">
          <ImageUploader
            folder="media/home"
            label="CTA Background Image"
            onUploaded={(url) => setCtaDraft((prev) => ({ ...(prev ?? ctaValues), backgroundImage: url }))}
          />
        </div>
      </EditorLayout>

      <EditorLayout
        title="Homepage Sections Config"
        subtitle="Control all homepage section headings, descriptions, button labels, links, and empty-state text."
        actions={
          <button
            onClick={saveMain}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]"
          >
            Save Sections Config
          </button>
        }
      >
        <div className="space-y-8">
          {mainSections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5"
            >
              <h3 className="mb-4 text-lg font-semibold text-[var(--color-heading)]">
                {section.title}
              </h3>
              <FormBuilder
                fields={section.fields}
                values={mainValues as unknown as Record<string, unknown>}
                onChange={(name, value) =>
                  setMainDraft((prev) =>
                    setByPath((prev ?? mainValues) as Record<string, unknown>, name, value) as HomepageMain
                  )
                }
              />
            </section>
          ))}
        </div>
      </EditorLayout>

      <EditorLayout
        title="Homepage Services Preview Items"
        subtitle="Add, edit, and remove service cards shown in the homepage services section."
        actions={
          <button
            onClick={saveHomepageService}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]"
          >
            Save Service Item
          </button>
        }
      >
        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5">
            <FormBuilder
              fields={homepageServiceFields}
              values={serviceDraft as unknown as Record<string, unknown>}
              onChange={(name, value) =>
                setServiceDraft((prev) => ({
                  ...prev,
                  [name]: name === "order" ? Number(value || 0) : (value as never),
                }))
              }
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ImageUploader
                folder="media/services"
                label="Service Cover Image (Optional)"
                onUploaded={(url) => setServiceDraft((prev) => ({ ...prev, heroImage: url, coverImage: url }))}
              />
              <ImageUploader
                folder="media/services/icons"
                label="Service Icon Image (Optional)"
                onUploaded={(url) => setServiceDraft((prev) => ({ ...prev, iconUrl: url }))}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-heading)]">Existing Service Items</h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {serviceRows.map((service) => (
                <article
                  key={service.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section-alt)] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    {service.status || "draft"} • Order {service.order ?? 0}
                  </p>
                  <h4 className="mt-2 text-base font-semibold text-[var(--color-heading)]">
                    {service.title || "Untitled"}
                  </h4>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">/{service.slug || ""}</p>
                  <p className="mt-2 text-sm text-[var(--color-body)]">
                    {service.shortDescription || ""}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-muted)]">Icon: {service.icon || "-"}</p>
                  {service.iconUrl ? (
                    <p className="mt-1 text-xs text-[var(--color-muted)] break-all">
                      Icon URL: {service.iconUrl}
                    </p>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setServiceDraft(service)}
                      className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-body)]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteServiceId(service.id || "")}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </EditorLayout>

      <ConfirmDialog
        open={Boolean(deleteServiceId)}
        title="Delete Service Item"
        description="This removes the service item from the homepage services preview."
        onCancel={() => setDeleteServiceId(null)}
        onConfirm={deleteHomepageService}
      />
    </div>
  )
}
