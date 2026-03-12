"use client"

import { useMemo, useState } from "react"
import { serverTimestamp } from "firebase/firestore"
import EditorLayout from "@/components/admin/EditorLayout"
import FormBuilder from "@/components/admin/FormBuilder"
import ImageUploader from "@/components/admin/ImageUploader"
import DataTable from "@/components/admin/DataTable"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import { Service } from "@/types/cms"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument, removeDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"

type ServiceFaq = {
  question?: string
  answer?: string
}

type ServicePricingPlan = {
  name?: string
  priceKESRange?: string
  priceUSDRange?: string
  features?: string[]
  recommended?: boolean
}

const basicFields = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug" },
  { name: "shortDescription", label: "Short Description", type: "textarea" as const },
  { name: "longDescription", label: "Long Description", type: "textarea" as const },
  { name: "category", label: "Category" },
  { name: "pricingModel", label: "Pricing Model" },
  { name: "icon", label: "Icon" },
  { name: "order", label: "Order", type: "number" as const },
  { name: "ctaText", label: "CTA Text", type: "textarea" as const },
  { name: "ctaButtonText", label: "CTA Button Text" },
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

const textAreaClass =
  "min-h-[120px] w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)] placeholder:text-[var(--color-muted)] dark:placeholder:text-[var(--color-muted)]"

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)] placeholder:text-[var(--color-muted)] dark:placeholder:text-[var(--color-muted)]"

function parseLines(text: string) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function toLines(items?: string[]) {
  return (items || []).join("\n")
}

function parseCsv(text: string) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function ServicesManager() {
  const { data, loading } = useCollection<Service>("services")
  const { notify } = useToast()
  const [values, setValues] = useState<Service>({ status: "published" })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [faqDraft, setFaqDraft] = useState<ServiceFaq>({})
  const [pricingDraft, setPricingDraft] = useState<ServicePricingPlan>({ recommended: false })
  const [pricingFeaturesDraft, setPricingFeaturesDraft] = useState("")
  const [seoKeywordsDraft, setSeoKeywordsDraft] = useState("")

  const sortedData = useMemo(
    () => [...data].sort((a, b) => (Number(a.order || 0) || 0) - (Number(b.order || 0) || 0)),
    [data]
  )

  if (loading) return <LoadingSkeleton rows={10} />

  const saveService = async () => {
    if (!values.slug) {
      notify("Slug is required")
      return
    }

    const id = values.id || values.slug
    const existingCreatedAt = (values as Service & { createdAt?: unknown }).createdAt
    await upsertDocument("services", id, {
      ...values,
      id,
      fullDescription: values.longDescription || values.fullDescription || "",
      coverImage: values.heroImage || values.coverImage || "",
      seo: {
        ...(values.seo || {}),
        keywords: parseCsv(seoKeywordsDraft || (values.seo?.keywords || []).join(", ")),
      },
      updatedAt: serverTimestamp(),
      createdAt: existingCreatedAt || serverTimestamp(),
    })

    setValues({ status: "published" })
    setFaqDraft({})
    setPricingDraft({ recommended: false })
    setPricingFeaturesDraft("")
    setSeoKeywordsDraft("")
    notify("Service saved")
  }

  const deleteService = async () => {
    if (!deleteId) return
    await removeDocument("services", deleteId)
    setDeleteId(null)
    notify("Service deleted")
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Services"
        subtitle="Advanced editor for service content, process, FAQ, and pricing plans."
        actions={
          <button
            onClick={saveService}
            className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]"
          >
            Save Service
          </button>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Basic Content</h2>
              <FormBuilder
                fields={basicFields}
                values={values as unknown as Record<string, unknown>}
                onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value as never }))}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]">
                  <span className="font-medium">Features (one per line)</span>
                  <textarea
                    value={toLines(values.features)}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        features: parseLines(event.target.value),
                      }))
                    }
                    className={textAreaClass}
                  />
                </label>
                <label className="space-y-2 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]">
                  <span className="font-medium">Technologies (one per line)</span>
                  <textarea
                    value={toLines(values.technologies)}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        technologies: parseLines(event.target.value),
                      }))
                    }
                    className={textAreaClass}
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Process Steps</h2>
              <label className="space-y-2 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]">
                <span className="font-medium">Process (one step per line)</span>
                <textarea
                  value={toLines(values.process)}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      process: parseLines(event.target.value),
                    }))
                  }
                  className={textAreaClass}
                />
              </label>
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">FAQ Section</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Question"
                  value={faqDraft.question || ""}
                  onChange={(event) => setFaqDraft((prev) => ({ ...prev, question: event.target.value }))}
                  className={inputClass}
                />
                <input
                  placeholder="Answer"
                  value={faqDraft.answer || ""}
                  onChange={(event) => setFaqDraft((prev) => ({ ...prev, answer: event.target.value }))}
                  className={inputClass}
                />
              </div>
              <button
                onClick={() => {
                  if (!faqDraft.question || !faqDraft.answer) return
                  setValues((prev) => ({
                    ...prev,
                    faqs: [...(prev.faqs || []), { ...faqDraft }],
                  }))
                  setFaqDraft({})
                }}
                className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-body)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
              >
                Add FAQ
              </button>
              <div className="space-y-2">
                {(values.faqs || []).map((faq, index) => (
                  <div
                    key={`${faq.question}-${index}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-border)] p-3 dark:border-[var(--color-border)]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-heading)] dark:text-[var(--color-heading)]">{faq.question}</p>
                      <p className="text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]/85">{faq.answer}</p>
                    </div>
                    <button
                      onClick={() =>
                        setValues((prev) => ({
                          ...prev,
                          faqs: (prev.faqs || []).filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                      className="text-xs font-semibold text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
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
                className={textAreaClass}
              />
              <input
                placeholder="Keywords (comma separated)"
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
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Hero / Media</h2>
              <ImageUploader
                folder="media/services"
                label="Hero Image"
                onUploaded={(url) =>
                  setValues((prev) => ({
                    ...prev,
                    heroImage: url,
                    coverImage: url,
                  }))
                }
              />
              {values.heroImage ? (
                <p className="rounded-lg bg-[var(--color-bg)] p-2 text-xs text-[var(--color-body)] dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]/80 break-all">
                  {values.heroImage}
                </p>
              ) : null}
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Pricing Plans</h2>
              <div className="space-y-3">
                <input
                  placeholder="Plan name"
                  value={pricingDraft.name || ""}
                  onChange={(event) => setPricingDraft((prev) => ({ ...prev, name: event.target.value }))}
                  className={inputClass}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    placeholder="KES range"
                    value={pricingDraft.priceKESRange || ""}
                    onChange={(event) =>
                      setPricingDraft((prev) => ({ ...prev, priceKESRange: event.target.value }))
                    }
                    className={inputClass}
                  />
                  <input
                    placeholder="USD range"
                    value={pricingDraft.priceUSDRange || ""}
                    onChange={(event) =>
                      setPricingDraft((prev) => ({ ...prev, priceUSDRange: event.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <input
                  placeholder="Plan features (comma-separated)"
                  value={pricingFeaturesDraft}
                  onChange={(event) => setPricingFeaturesDraft(event.target.value)}
                  className={inputClass}
                />
                <label className="flex items-center gap-2 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]">
                  <input
                    type="checkbox"
                    checked={Boolean(pricingDraft.recommended)}
                    onChange={(event) =>
                      setPricingDraft((prev) => ({
                        ...prev,
                        recommended: event.target.checked,
                      }))
                    }
                  />
                  Recommended plan
                </label>
                <button
                  onClick={() => {
                    if (!pricingDraft.name) return
                    setValues((prev) => ({
                      ...prev,
                      pricingPlans: [
                        ...(prev.pricingPlans || []),
                        {
                          ...pricingDraft,
                          features: parseCsv(pricingFeaturesDraft),
                        },
                      ],
                    }))
                    setPricingDraft({ recommended: false })
                    setPricingFeaturesDraft("")
                  }}
                  className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-body)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
                >
                  Add Pricing Plan
                </button>
              </div>

              <div className="space-y-2">
                {(values.pricingPlans || []).map((plan, index) => (
                  <div
                    key={`${plan.name}-${index}`}
                    className="rounded-xl border border-[var(--color-border)] p-3 dark:border-[var(--color-border)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-heading)] dark:text-[var(--color-heading)]">
                        {plan.name} {plan.recommended ? "(Recommended)" : ""}
                      </p>
                      <button
                        onClick={() =>
                          setValues((prev) => ({
                            ...prev,
                            pricingPlans: (prev.pricingPlans || []).filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                        className="text-xs font-semibold text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-xs text-[var(--color-muted)] dark:text-[var(--color-subheading)]/85">KES: {plan.priceKESRange}</p>
                    <p className="text-xs text-[var(--color-muted)] dark:text-[var(--color-subheading)]/85">USD: {plan.priceUSDRange}</p>
                    <p className="mt-1 text-xs text-[var(--color-body)] dark:text-[var(--color-heading)]/80">{(plan.features || []).join(" • ")}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </EditorLayout>

      <DataTable
        data={sortedData}
        columns={[
          { header: "Title", accessor: (row) => row.title },
          { header: "Slug", accessor: (row) => row.slug },
          { header: "Category", accessor: (row) => row.category },
          { header: "Status", accessor: (row) => row.status },
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
        title="Delete service"
        description="This will permanently remove the service."
        onCancel={() => setDeleteId(null)}
        onConfirm={deleteService}
      />
    </div>
  )
}
