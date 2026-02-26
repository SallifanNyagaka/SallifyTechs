"use client"

import { useMemo, useState } from "react"
import { serverTimestamp } from "firebase/firestore"
import EditorLayout from "@/components/admin/EditorLayout"
import FormBuilder from "@/components/admin/FormBuilder"
import ImageUploader from "@/components/admin/ImageUploader"
import DataTable from "@/components/admin/DataTable"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import { Testimonial } from "@/types/cms"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument, removeDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"

type Submission = {
  id?: string
  name?: string
  email?: string
  content?: string
  rating?: number
  submitted_at?: unknown
  approved?: boolean
  reviewed?: boolean
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

function toDateLabel(value: unknown) {
  if (!value) return ""
  if (typeof value === "string") {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString()
  }
  if (typeof value === "object" && value && "seconds" in (value as Record<string, unknown>)) {
    const seconds = Number((value as { seconds?: number }).seconds || 0)
    return new Date(seconds * 1000).toLocaleDateString()
  }
  return ""
}

export default function TestimonialsManager() {
  const { data, loading } = useCollection<Testimonial>("testimonials")
  const submissions = useCollection<Submission>("testimonial_submissions")
  const { notify } = useToast()

  const [values, setValues] = useState<Testimonial>({ featured: false })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteSubmissionId, setDeleteSubmissionId] = useState<string | null>(null)
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([])

  const sortedTestimonials = useMemo(
    () => [...data].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [data]
  )

  const sortedSubmissions = useMemo(
    () => [...submissions.data].sort((a, b) => Number(Boolean(a.approved)) - Number(Boolean(b.approved))),
    [submissions.data]
  )

  const pendingCount = sortedSubmissions.filter((item) => !item.reviewed).length

  if (loading || submissions.loading) return <LoadingSkeleton rows={12} />

  const saveTestimonial = async () => {
    const id = values.id || slugify(values.name || "testimonial") || `${Date.now()}`
    await upsertDocument("testimonials", id, {
      ...values,
      id,
      content: values.content || values.message || "",
      message: values.content || values.message || "",
      photo_url: values.photo_url || values.photoUrl || values.image || "",
      image: values.photo_url || values.photoUrl || values.image || "",
      updated_at: serverTimestamp(),
      updatedAt: serverTimestamp(),
      created_at: values.created_at || serverTimestamp(),
      createdAt: values.created_at || serverTimestamp(),
    })
    setValues({ featured: false })
    notify("Testimonial saved")
  }

  const deleteTestimonial = async () => {
    if (!deleteId) return
    await removeDocument("testimonials", deleteId)
    setDeleteId(null)
    notify("Testimonial deleted")
  }

  const approveSubmission = async (submission: Submission) => {
    if (!submission.id) return

    const testimonialId = `submission-${submission.id}`
    await Promise.all([
      upsertDocument("testimonial_submissions", submission.id, {
        approved: true,
        reviewed: true,
        updated_at: serverTimestamp(),
      }),
      upsertDocument("testimonials", testimonialId, {
        id: testimonialId,
        name: submission.name || "",
        content: submission.content || "",
        message: submission.content || "",
        rating: submission.rating || 5,
        featured: false,
        approved: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }),
    ])

    setSelectedSubmissionIds((prev) => prev.filter((id) => id !== submission.id))
    notify("Submission approved and published")
  }

  const rejectSubmission = async (submission: Submission) => {
    if (!submission.id) return
    await upsertDocument("testimonial_submissions", submission.id, {
      approved: false,
      reviewed: true,
      updated_at: serverTimestamp(),
    })
    setSelectedSubmissionIds((prev) => prev.filter((id) => id !== submission.id))
    notify("Submission marked as reviewed")
  }

  const bulkApprove = async () => {
    const selected = sortedSubmissions.filter((item) => item.id && selectedSubmissionIds.includes(item.id))
    await Promise.all(selected.map((item) => approveSubmission(item)))
    setSelectedSubmissionIds([])
  }

  const deleteSubmission = async () => {
    if (!deleteSubmissionId) return
    await removeDocument("testimonial_submissions", deleteSubmissionId)
    setDeleteSubmissionId(null)
    setSelectedSubmissionIds((prev) => prev.filter((id) => id !== deleteSubmissionId))
    notify("Submission deleted")
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Testimonials"
        subtitle={`Manage published testimonials and review submissions. Pending submissions: ${pendingCount}`}
        actions={
          <button
            onClick={saveTestimonial}
            className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]"
          >
            Save Testimonial
          </button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormBuilder
            fields={[
              { name: "name", label: "Name" },
              { name: "role", label: "Role / Company" },
              { name: "rating", label: "Rating", type: "number" },
              { name: "order", label: "Order", type: "number" },
              { name: "content", label: "Content", type: "textarea" },
            ]}
            values={values as unknown as Record<string, unknown>}
            onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value as never }))}
          />
          <div className="space-y-4">
            <ImageUploader
              folder="media/testimonials"
              label="Photo"
              onUploaded={(url) =>
                setValues((prev) => ({
                  ...prev,
                  photo_url: url,
                  photoUrl: url,
                  image: url,
                }))
              }
            />
            <label className="flex items-center gap-2 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]">
              <input
                type="checkbox"
                checked={Boolean(values.featured)}
                onChange={(event) => setValues((prev) => ({ ...prev, featured: event.target.checked }))}
              />
              Featured testimonial
            </label>
          </div>
        </div>
      </EditorLayout>

      <DataTable
        data={sortedTestimonials}
        columns={[
          { header: "Name", accessor: (row) => row.name },
          { header: "Role", accessor: (row) => row.role || row.company || "" },
          { header: "Rating", accessor: (row) => row.rating || "" },
          { header: "Featured", accessor: (row) => (row.featured ? "Yes" : "No") },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="flex gap-2">
                <button className="text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]" onClick={() => setValues(row)}>
                  Edit
                </button>
                <button
                  className="text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]"
                  onClick={async () => {
                    if (!row.id) return
                    await upsertDocument("testimonials", row.id, {
                      featured: !row.featured,
                      updated_at: serverTimestamp(),
                    })
                    notify(row.featured ? "Removed from featured" : "Marked as featured")
                  }}
                >
                  {row.featured ? "Unfeature" : "Feature"}
                </button>
                <button className="text-xs font-semibold text-red-500" onClick={() => setDeleteId(row.id || "")}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Testimonial Submissions</h2>
          <button
            onClick={bulkApprove}
            disabled={!selectedSubmissionIds.length}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-body)] disabled:opacity-50 dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
          >
            Approve Selected ({selectedSubmissionIds.length})
          </button>
        </div>

        <DataTable
          data={sortedSubmissions}
          columns={[
            {
              header: "Select",
              accessor: (row) => (
                <input
                  type="checkbox"
                  checked={Boolean(row.id && selectedSubmissionIds.includes(row.id))}
                  onChange={(event) => {
                    if (!row.id) return
                    setSelectedSubmissionIds((prev) =>
                      event.target.checked ? [...prev, row.id as string] : prev.filter((id) => id !== row.id)
                    )
                  }}
                  aria-label={`Select submission from ${row.name || "unknown"}`}
                />
              ),
            },
            { header: "Name", accessor: (row) => row.name || "" },
            { header: "Email", accessor: (row) => row.email || "" },
            { header: "Submitted", accessor: (row) => toDateLabel(row.submitted_at) || "" },
            { header: "Approved", accessor: (row) => (row.approved ? "Yes" : "No") },
            {
              header: "Actions",
              accessor: (row) => (
                <div className="flex gap-2">
                  <button className="text-xs font-semibold text-emerald-600" onClick={() => approveSubmission(row)}>
                    Approve
                  </button>
                  <button className="text-xs font-semibold text-[var(--color-secondary)]" onClick={() => rejectSubmission(row)}>
                    Review
                  </button>
                  <button className="text-xs font-semibold text-red-500" onClick={() => setDeleteSubmissionId(row.id || "")}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </section>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete testimonial"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={deleteTestimonial}
      />

      <ConfirmDialog
        open={Boolean(deleteSubmissionId)}
        title="Delete submission"
        description="This action cannot be undone."
        onCancel={() => setDeleteSubmissionId(null)}
        onConfirm={deleteSubmission}
      />
    </div>
  )
}
