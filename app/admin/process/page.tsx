"use client"

import { useEffect, useMemo, useState } from "react"
import EditorLayout from "@/components/admin/EditorLayout"
import FormBuilder from "@/components/admin/FormBuilder"
import DataTable from "@/components/admin/DataTable"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import ImageUploader from "@/components/admin/ImageUploader"
import { ProcessStep } from "@/types/cms"
import { useCollection } from "@/hooks/admin/useCollection"
import { useDocument } from "@/hooks/admin/useDocument"
import { upsertDocument, removeDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"

type ProcessPageHero = {
  title?: string
  description?: string
  backgroundImage?: string
}

type ProcessTextBlock = {
  title?: string
  description?: string
}

type ProcessFaq = {
  id?: string
  question?: string
  answer?: string
  order?: number
  status?: string
}

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)]"

export default function ProcessManager() {
  const { notify } = useToast()

  const steps = useCollection<ProcessStep>("process")
  const faqs = useCollection<ProcessFaq>("processFaqs")

  const hero = useDocument<ProcessPageHero>("processPage", "hero")
  const why = useDocument<ProcessTextBlock>("processPage", "why")
  const cta = useDocument<ProcessTextBlock>("processPage", "cta")

  const [stepValues, setStepValues] = useState<ProcessStep>({ status: "published" })
  const [faqValues, setFaqValues] = useState<ProcessFaq>({ status: "published" })

  const [heroValues, setHeroValues] = useState<ProcessPageHero>({})
  const [whyValues, setWhyValues] = useState<ProcessTextBlock>({})
  const [ctaValues, setCtaValues] = useState<ProcessTextBlock>({})

  const [deleteStepId, setDeleteStepId] = useState<string | null>(null)
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null)

  useEffect(() => {
    const nextValue = hero.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setHeroValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [hero.data])

  useEffect(() => {
    const nextValue = why.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setWhyValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [why.data])

  useEffect(() => {
    const nextValue = cta.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setCtaValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [cta.data])

  const sortedSteps = useMemo(
    () => [...steps.data].sort((a, b) => Number(a.stepNumber || a.order || 0) - Number(b.stepNumber || b.order || 0)),
    [steps.data]
  )

  const sortedFaqs = useMemo(
    () => [...faqs.data].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [faqs.data]
  )

  const loading = hero.loading || why.loading || cta.loading || steps.loading || faqs.loading
  if (loading) return <LoadingSkeleton rows={12} />

  const saveHero = async () => {
    await upsertDocument("processPage", "hero", heroValues)
    notify("Process hero updated")
  }

  const saveWhy = async () => {
    await upsertDocument("processPage", "why", whyValues)
    notify("Why block updated")
  }

  const saveCta = async () => {
    await upsertDocument("processPage", "cta", ctaValues)
    notify("CTA block updated")
  }

  const saveStep = async () => {
    const id = stepValues.id || `${stepValues.stepNumber || Date.now()}`
    await upsertDocument("process", id, {
      ...stepValues,
      id,
      order: Number(stepValues.order || stepValues.stepNumber || 0),
      stepNumber: Number(stepValues.stepNumber || stepValues.order || 0),
    })
    setStepValues({ status: "published" })
    notify("Process step saved")
  }

  const deleteStep = async () => {
    if (!deleteStepId) return
    await removeDocument("process", deleteStepId)
    setDeleteStepId(null)
    notify("Process step deleted")
  }

  const saveFaq = async () => {
    const id = faqValues.id || `faq-${Date.now()}`
    await upsertDocument("processFaqs", id, {
      ...faqValues,
      id,
      order: Number(faqValues.order || 0),
    })
    setFaqValues({ status: "published" })
    notify("FAQ saved")
  }

  const deleteFaq = async () => {
    if (!deleteFaqId) return
    await removeDocument("processFaqs", deleteFaqId)
    setDeleteFaqId(null)
    notify("FAQ deleted")
  }

  return (
    <div className="space-y-8">
      <EditorLayout title="Process" subtitle="Manage process page hero, workflow steps, FAQs, and CTA blocks.">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Hero Section</h2>
              <FormBuilder
                fields={[
                  { name: "title", label: "Title" },
                  { name: "description", label: "Description", type: "textarea" as const },
                ]}
                values={heroValues as unknown as Record<string, unknown>}
                onChange={(name, value) => setHeroValues((prev) => ({ ...prev, [name]: value as never }))}
              />
              <ImageUploader
                folder="media/process"
                label="Hero Background"
                onUploaded={(url) => setHeroValues((prev) => ({ ...prev, backgroundImage: url }))}
              />
              <button onClick={saveHero} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
                Save Hero
              </button>
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Workflow Step</h2>
              <FormBuilder
                fields={[
                  { name: "stepNumber", label: "Step Number", type: "number" as const },
                  { name: "order", label: "Order", type: "number" as const },
                  { name: "title", label: "Title" },
                  { name: "description", label: "Description", type: "textarea" as const },
                  {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    options: [
                      { label: "Published", value: "published" },
                      { label: "Draft", value: "draft" },
                    ],
                  },
                ]}
                values={stepValues as unknown as Record<string, unknown>}
                onChange={(name, value) => setStepValues((prev) => ({ ...prev, [name]: value as never }))}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">Icon URL</label>
                <input
                  className={inputClass}
                  value={stepValues.iconUrl || ""}
                  onChange={(event) => setStepValues((prev) => ({ ...prev, iconUrl: event.target.value }))}
                />
              </div>
              <ImageUploader
                folder="media/process"
                label="Upload Step Icon"
                onUploaded={(url) => setStepValues((prev) => ({ ...prev, iconUrl: url }))}
              />
              <button onClick={saveStep} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
                Save Step
              </button>
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">FAQ Item</h2>
              <FormBuilder
                fields={[
                  { name: "question", label: "Question" },
                  { name: "answer", label: "Answer", type: "textarea" as const },
                  { name: "order", label: "Order", type: "number" as const },
                ]}
                values={faqValues as unknown as Record<string, unknown>}
                onChange={(name, value) => setFaqValues((prev) => ({ ...prev, [name]: value as never }))}
              />
              <button onClick={saveFaq} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
                Save FAQ
              </button>
            </section>
          </div>

          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Why This Works</h2>
              <FormBuilder
                fields={[
                  { name: "title", label: "Title" },
                  { name: "description", label: "Description", type: "textarea" as const },
                ]}
                values={whyValues as unknown as Record<string, unknown>}
                onChange={(name, value) => setWhyValues((prev) => ({ ...prev, [name]: value as never }))}
              />
              <button onClick={saveWhy} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
                Save Why Block
              </button>
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">CTA Section</h2>
              <FormBuilder
                fields={[
                  { name: "title", label: "Title" },
                  { name: "description", label: "Description", type: "textarea" as const },
                ]}
                values={ctaValues as unknown as Record<string, unknown>}
                onChange={(name, value) => setCtaValues((prev) => ({ ...prev, [name]: value as never }))}
              />
              <button onClick={saveCta} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">
                Save CTA Block
              </button>
            </section>
          </div>
        </div>
      </EditorLayout>

      <DataTable
        data={sortedSteps}
        columns={[
          { header: "Step", accessor: (row) => row.stepNumber },
          { header: "Order", accessor: (row) => row.order ?? "" },
          { header: "Title", accessor: (row) => row.title },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="flex gap-2">
                <button className="text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]" onClick={() => setStepValues(row)}>
                  Edit
                </button>
                <button className="text-xs font-semibold text-red-500" onClick={() => setDeleteStepId(row.id || "")}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <DataTable
        data={sortedFaqs}
        columns={[
          { header: "Order", accessor: (row) => row.order ?? "" },
          { header: "Question", accessor: (row) => row.question },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="flex gap-2">
                <button className="text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]" onClick={() => setFaqValues(row)}>
                  Edit
                </button>
                <button className="text-xs font-semibold text-red-500" onClick={() => setDeleteFaqId(row.id || "")}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={Boolean(deleteStepId)}
        title="Delete process step"
        description="This action cannot be undone."
        onCancel={() => setDeleteStepId(null)}
        onConfirm={deleteStep}
      />

      <ConfirmDialog
        open={Boolean(deleteFaqId)}
        title="Delete FAQ"
        description="This action cannot be undone."
        onCancel={() => setDeleteFaqId(null)}
        onConfirm={deleteFaq}
      />
    </div>
  )
}
