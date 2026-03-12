"use client"

import { useMemo, useState } from "react"
import { serverTimestamp } from "firebase/firestore"
import EditorLayout from "@/components/admin/EditorLayout"
import FormBuilder from "@/components/admin/FormBuilder"
import ImageUploader from "@/components/admin/ImageUploader"
import DataTable from "@/components/admin/DataTable"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import RichTextEditor from "@/components/admin/RichTextEditor"
import { PortfolioItem } from "@/types/cms"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument, removeDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"

type EditorPortfolio = PortfolioItem & {
  servicesUsed?: string[]
  galleryImages?: string[]
  createdAt?: unknown
  updatedAt?: unknown
}

const categories = [
  "Web Development",
  "Mobile Development",
  "System Development",
  "Graphics",
  "SEO",
  "Digital Marketing",
]

const basicFields = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug" },
  {
    name: "category",
    label: "Category",
    type: "select" as const,
    options: categories.map((item) => ({ label: item, value: item })),
  },
  { name: "clientName", label: "Client Name" },
  { name: "projectSummary", label: "Project Summary", type: "textarea" as const },
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

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)] placeholder:text-[var(--color-muted)] dark:placeholder:text-[var(--color-muted)]"

function parseCsv(text: string) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseLines(text: string) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function toLines(values?: string[]) {
  return (values || []).join("\n")
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

function normalizeRecord(item: PortfolioItem): EditorPortfolio {
  return {
    ...item,
    slug: item.slug || (item.title ? slugify(item.title) : ""),
    clientName: item.clientName || item.client_name || "",
    projectSummary: item.projectSummary || item.project_summary || item.description || "",
    fullDescription: item.fullDescription || item.full_description || item.description || "",
    servicesUsed: item.servicesUsed || item.services_used || [],
    galleryImages: item.galleryImages || item.gallery_images || item.images || [],
    thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || item.thumbnail || "",
    coverImageUrl: item.coverImageUrl || item.cover_image_url || item.thumbnail || "",
    liveUrl: item.liveUrl || item.live_url || "",
    githubUrl: item.githubUrl || item.github_url || "",
    testimonialAuthor: item.testimonialAuthor || item.testimonial_author || "",
  }
}

export default function PortfolioManager() {
  const { data, loading } = useCollection<PortfolioItem>("portfolio_projects")
  const { notify } = useToast()
  const [values, setValues] = useState<EditorPortfolio>({ status: "published" })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [reorderingId, setReorderingId] = useState<string | null>(null)
  const [seoKeywordsDraft, setSeoKeywordsDraft] = useState("")

  const records = useMemo(
    () => data.map(normalizeRecord).sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [data]
  )

  if (loading) return <LoadingSkeleton rows={10} />

  const saveItem = async () => {
    const generatedSlug = values.slug || (values.title ? slugify(values.title) : "")
    if (!values.title || !generatedSlug) {
      notify("Title and slug are required")
      return
    }

    const id = values.id || generatedSlug
    const completionDate = values.completionDate || values.completion_date || ""

    const payload: EditorPortfolio = {
      ...values,
      id,
      slug: generatedSlug,
      clientName: values.clientName || "",
      client_name: values.clientName || "",
      projectSummary: values.projectSummary || "",
      project_summary: values.projectSummary || "",
      fullDescription: values.fullDescription || "",
      full_description: values.fullDescription || "",
      description: values.fullDescription || values.projectSummary || "",
      servicesUsed: values.servicesUsed || [],
      services_used: values.servicesUsed || [],
      thumbnailUrl: values.thumbnailUrl || "",
      thumbnail_url: values.thumbnailUrl || "",
      coverImageUrl: values.coverImageUrl || values.thumbnailUrl || "",
      cover_image_url: values.coverImageUrl || values.thumbnailUrl || "",
      galleryImages: values.galleryImages || [],
      gallery_images: values.galleryImages || [],
      images: values.galleryImages || [],
      thumbnail: values.thumbnailUrl || "",
      liveUrl: values.liveUrl || "",
      live_url: values.liveUrl || "",
      githubUrl: values.githubUrl || "",
      github_url: values.githubUrl || "",
      testimonialAuthor: values.testimonialAuthor || "",
      testimonial_author: values.testimonialAuthor || "",
      completionDate,
      completion_date: completionDate,
      seo: {
        ...(values.seo || {}),
        keywords: parseCsv(seoKeywordsDraft || (values.seo?.keywords || []).join(", ")),
      },
      createdAt: values.createdAt || serverTimestamp(),
      created_at: values.created_at || serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await Promise.all([
      upsertDocument("portfolio_projects", id, payload),
      upsertDocument("portfolio", id, payload),
    ])

    setValues({ status: "published" })
    setSeoKeywordsDraft("")
    notify("Portfolio project saved")
  }

  const deleteItem = async () => {
    if (!deleteId) return
    await Promise.all([
      removeDocument("portfolio_projects", deleteId),
      removeDocument("portfolio", deleteId),
    ])
    setDeleteId(null)
    notify("Portfolio project deleted")
  }

  const updateOrderForItem = async (id: string, order: number) => {
    await Promise.all([
      upsertDocument("portfolio_projects", id, {
        order,
        updatedAt: serverTimestamp(),
      }),
      upsertDocument("portfolio", id, {
        order,
        updatedAt: serverTimestamp(),
      }),
    ])
  }

  const moveOrder = async (id: string, direction: "up" | "down") => {
    const index = records.findIndex((item) => item.id === id)
    if (index === -1) return

    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= records.length) return

    const current = records[index]
    const target = records[targetIndex]
    if (!current.id || !target.id) return

    const currentOrder = Number(current.order || index + 1)
    const targetOrder = Number(target.order || targetIndex + 1)

    setReorderingId(id)
    try {
      await Promise.all([
        updateOrderForItem(current.id, targetOrder),
        updateOrderForItem(target.id, currentOrder),
      ])
      notify("Project order updated")
    } finally {
      setReorderingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Portfolio"
        subtitle="Manage complete case study content used by the public portfolio page."
        actions={
          <button
            onClick={saveItem}
            className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]"
          >
            Save Project
          </button>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Project Overview</h2>
              <FormBuilder
                fields={basicFields}
                values={values as unknown as Record<string, unknown>}
                onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value as never }))}
              />
              <label className="block space-y-2 text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                Full Description
                <RichTextEditor
                  value={values.fullDescription || ""}
                  onChange={(value) => setValues((prev) => ({ ...prev, fullDescription: value }))}
                />
              </label>
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Service & Tech Details</h2>
              <label className="block space-y-2 text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                Services Used (comma-separated)
                <input
                  value={(values.servicesUsed || []).join(", ")}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, servicesUsed: parseCsv(event.target.value) }))
                  }
                  className={inputClass}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                Technologies (comma-separated)
                <input
                  value={(values.technologies || []).join(", ")}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, technologies: parseCsv(event.target.value) }))
                  }
                  className={inputClass}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                Completion Date
                <input
                  type="date"
                  value={
                    typeof values.completionDate === "string" && values.completionDate
                      ? values.completionDate.slice(0, 10)
                      : ""
                  }
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, completionDate: event.target.value }))
                  }
                  className={inputClass}
                />
              </label>
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Social Proof & Links</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  placeholder="Live URL"
                  value={values.liveUrl || ""}
                  onChange={(event) => setValues((prev) => ({ ...prev, liveUrl: event.target.value }))}
                  className={inputClass}
                />
                <input
                  placeholder="GitHub URL"
                  value={values.githubUrl || ""}
                  onChange={(event) => setValues((prev) => ({ ...prev, githubUrl: event.target.value }))}
                  className={inputClass}
                />
                <input
                  placeholder="Testimonial Author"
                  value={values.testimonialAuthor || ""}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, testimonialAuthor: event.target.value }))
                  }
                  className={inputClass}
                />
                <label className="flex items-center gap-2 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]">
                  <input
                    type="checkbox"
                    checked={Boolean(values.featured)}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, featured: event.target.checked }))
                    }
                  />
                  Featured Project
                </label>
              </div>
              <textarea
                placeholder="Client testimonial"
                value={values.testimonial || ""}
                onChange={(event) => setValues((prev) => ({ ...prev, testimonial: event.target.value }))}
                className="min-h-[120px] w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)]"
              />
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">SEO</h2>
              <input
                placeholder="Meta title"
                value={values.seo?.metaTitle || ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    seo: { ...(prev.seo || {}), metaTitle: event.target.value },
                  }))
                }
                className={inputClass}
              />
              <textarea
                placeholder="Meta description"
                value={values.seo?.metaDescription || ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    seo: { ...(prev.seo || {}), metaDescription: event.target.value },
                  }))
                }
                className={inputClass}
              />
              <input
                placeholder="Keywords (comma-separated)"
                value={seoKeywordsDraft || (values.seo?.keywords || []).join(", ")}
                onChange={(event) => setSeoKeywordsDraft(event.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Canonical URL (optional)"
                value={values.seo?.canonicalUrl || ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    seo: { ...(prev.seo || {}), canonicalUrl: event.target.value },
                  }))
                }
                className={inputClass}
              />
              <input
                placeholder="OG image URL (optional)"
                value={values.seo?.ogImage || ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    seo: { ...(prev.seo || {}), ogImage: event.target.value },
                  }))
                }
                className={inputClass}
              />
              <label className="flex items-center gap-2 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]">
                <input
                  type="checkbox"
                  checked={Boolean(values.seo?.noIndex)}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      seo: { ...(prev.seo || {}), noIndex: event.target.checked },
                    }))
                  }
                />
                No index
              </label>
            </section>
          </div>

          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Images</h2>
              <ImageUploader
                folder="media/portfolio"
                label="Thumbnail"
                onUploaded={(url) => setValues((prev) => ({ ...prev, thumbnailUrl: url }))}
              />
              <ImageUploader
                folder="media/portfolio"
                label="Cover Image"
                onUploaded={(url) => setValues((prev) => ({ ...prev, coverImageUrl: url }))}
              />
              <ImageUploader
                folder="media/portfolio"
                label="Add Gallery Image"
                onUploaded={(url) =>
                  setValues((prev) => ({
                    ...prev,
                    galleryImages: [...(prev.galleryImages || []), url],
                  }))
                }
              />
              <label className="block space-y-2 text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                Gallery Images (one URL per line)
                <textarea
                  value={toLines(values.galleryImages)}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, galleryImages: parseLines(event.target.value) }))
                  }
                  className="min-h-[160px] w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-body)] dark:text-[var(--color-heading)]"
                />
              </label>
            </section>
          </div>
        </div>
      </EditorLayout>

      <DataTable
        data={records}
        columns={[
          { header: "Title", accessor: (row) => row.title || "" },
          {
            header: "Order",
            accessor: (row) => {
              const rowIndex = records.findIndex((item) => item.id === row.id)
              const orderLabel = Number(row.order || rowIndex + 1)
              return (
                <div className="flex items-center gap-2">
                  <span className="min-w-8 text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]">
                    {orderLabel}
                  </span>
                  <button
                    className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs font-semibold text-[var(--color-body)] disabled:opacity-50 dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
                    onClick={() => row.id && moveOrder(row.id, "up")}
                    disabled={reorderingId === row.id || rowIndex <= 0}
                  >
                    Up
                  </button>
                  <button
                    className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs font-semibold text-[var(--color-body)] disabled:opacity-50 dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
                    onClick={() => row.id && moveOrder(row.id, "down")}
                    disabled={reorderingId === row.id || rowIndex === records.length - 1}
                  >
                    Down
                  </button>
                </div>
              )
            },
          },
          { header: "Category", accessor: (row) => row.category || "" },
          { header: "Client", accessor: (row) => row.clientName || "" },
          { header: "Featured", accessor: (row) => (row.featured ? "Yes" : "No") },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="flex gap-3">
                <button
                  className="text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]"
                  onClick={() => {
                    setValues(row)
                    setSeoKeywordsDraft("")
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-xs font-semibold text-red-500"
                  onClick={() => setDeleteId(row.id || "")}
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete portfolio item"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={deleteItem}
      />
    </div>
  )
}
