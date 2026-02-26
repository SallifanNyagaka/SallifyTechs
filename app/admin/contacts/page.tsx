"use client"

import { useMemo, useState } from "react"
import EditorLayout from "@/components/admin/EditorLayout"
import DataTable from "@/components/admin/DataTable"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import FormBuilder from "@/components/admin/FormBuilder"
import ImageUploader from "@/components/admin/ImageUploader"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import { ContactSubmission } from "@/types/cms"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument, removeDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"

type ContactMethod = {
  id?: string
  platform?: string
  value?: string
  iconUrl?: string
  order?: number
  active?: boolean
}

function toDateLabel(value: unknown) {
  if (!value) return ""
  if (typeof value === "string") {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }
  if (typeof value === "object" && value && "seconds" in (value as Record<string, unknown>)) {
    const seconds = Number((value as { seconds?: number }).seconds || 0)
    return new Date(seconds * 1000).toLocaleString()
  }
  return ""
}

export default function ContactsManager() {
  const { notify } = useToast()
  const submissions = useCollection<ContactSubmission>("contact_submissions")
  const methods = useCollection<ContactMethod>("contact_methods")

  const [methodValues, setMethodValues] = useState<ContactMethod>({ active: true })
  const [deleteSubmissionId, setDeleteSubmissionId] = useState<string | null>(null)
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null)

  const sortedSubmissions = useMemo(
    () =>
      [...submissions.data].sort((a, b) => {
        const aTime = toDateLabel(a.submitted_at || a.createdAt)
        const bTime = toDateLabel(b.submitted_at || b.createdAt)
        return bTime.localeCompare(aTime)
      }),
    [submissions.data]
  )

  const sortedMethods = useMemo(
    () => [...methods.data].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [methods.data]
  )

  const loading = submissions.loading || methods.loading
  if (loading) return <LoadingSkeleton rows={8} />

  const saveMethod = async () => {
    if (!methodValues.platform || !methodValues.value) {
      notify("Platform and value are required")
      return
    }

    const platform = methodValues.platform.trim().toLowerCase()
    const fixedIds: Record<string, string> = {
      email: "method-email",
      whatsapp: "method-whatsapp",
      phone: "method-phone",
    }
    const id =
      fixedIds[platform] ||
      methodValues.id ||
      `${methodValues.platform.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

    await upsertDocument("contact_methods", id, {
      ...methodValues,
      id,
      order: Number(methodValues.order || 0),
      active: methodValues.active !== false,
    })

    if (platform === "email") {
      await upsertDocument("settings", "site", { email: methodValues.value.trim() })
    }
    if (platform === "phone" || platform === "whatsapp") {
      await upsertDocument("settings", "site", { phone: methodValues.value.trim() })
    }

    setMethodValues({ active: true })
    notify("Contact method saved")
  }

  const sendStatusEmail = async ({
    name,
    email,
    status,
    projectType,
  }: {
    name: string
    email: string
    status: "pending" | "reviewed"
    projectType?: string
  }) => {
    const response = await fetch("/api/contact-status-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, status, projectType }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(payload.error || "Failed to send status email")
    }
  }

  const markSubmissionStatus = async (submission: ContactSubmission, status: "pending" | "reviewed") => {
    if (!submission.id) return
    await upsertDocument("contact_submissions", submission.id, { status })

    try {
      if (submission.email && submission.name) {
        await sendStatusEmail({
          name: submission.name,
          email: submission.email,
          status,
          projectType:
            submission.project_type ||
            submission.projectType ||
            submission.serviceInterested ||
            "",
        })
      }
      notify(`Submission marked as ${status} and email sent`)
    } catch (error) {
      notify(
        error instanceof Error
          ? `Submission marked as ${status}, but email failed: ${error.message}`
          : `Submission marked as ${status}, but email failed`
      )
    }
  }

  const deleteSubmission = async () => {
    if (!deleteSubmissionId) return
    await removeDocument("contact_submissions", deleteSubmissionId)
    setDeleteSubmissionId(null)
    notify("Submission deleted")
  }

  const deleteMethod = async () => {
    if (!deleteMethodId) return
    await removeDocument("contact_methods", deleteMethodId)
    setDeleteMethodId(null)
    notify("Contact method deleted")
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Contacts"
        subtitle="Review project inquiries and manage alternative contact channels."
      >
        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
          <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Contact Methods</h2>
          <FormBuilder
            fields={[
              { name: "platform", label: "Platform" },
              { name: "value", label: "Value (email, phone, URL)" },
              { name: "iconUrl", label: "Icon URL" },
              { name: "order", label: "Order", type: "number" },
              {
                name: "active",
                label: "Active",
                type: "select",
                options: [
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" },
                ],
              },
            ]}
            values={{
              ...methodValues,
              active: methodValues.active === false ? "false" : "true",
            } as unknown as Record<string, unknown>}
            onChange={(name, value) =>
              setMethodValues((prev) => ({
                ...prev,
                [name]: name === "active" ? String(value) === "true" : (value as never),
              }))
            }
          />
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section-alt)] p-4">
            <p className="text-sm font-medium text-[var(--color-heading)]">Platform Icon Upload</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Upload an icon to Firebase Storage. The URL will be saved in this contact method and displayed on the public contact page.
            </p>
            <div className="mt-3">
              <ImageUploader
                folder="media/contact-method-icons"
                label="Upload Platform Icon"
                onUploaded={(url) =>
                  setMethodValues((prev) => ({
                    ...prev,
                    iconUrl: url,
                  }))
                }
              />
            </div>
            {methodValues.iconUrl ? (
              <a
                href={methodValues.iconUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-xs font-semibold text-[var(--color-body)] underline"
              >
                Preview current icon URL
              </a>
            ) : null}
          </div>
          <button
            onClick={saveMethod}
            className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]"
          >
            Save Contact Method
          </button>
        </section>
      </EditorLayout>

      <DataTable
        data={sortedMethods}
        columns={[
          { header: "Icon", accessor: (row) => (row.iconUrl ? "Uploaded" : "None") },
          { header: "Platform", accessor: (row) => row.platform || "" },
          { header: "Value", accessor: (row) => row.value || "" },
          { header: "Order", accessor: (row) => row.order ?? "" },
          { header: "Active", accessor: (row) => (row.active === false ? "No" : "Yes") },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="flex gap-2">
                <button className="text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]" onClick={() => setMethodValues(row)}>
                  Edit
                </button>
                <button className="text-xs font-semibold text-red-500" onClick={() => setDeleteMethodId(row.id || "")}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <EditorLayout
        title="Contact Submissions"
        subtitle="Review inbound inquiries from the public contact forms."
      >
        <DataTable
          data={sortedSubmissions}
          columns={[
            { header: "Name", accessor: (row) => row.name || "" },
            { header: "Email", accessor: (row) => row.email || "" },
            { header: "Phone", accessor: (row) => row.phone || "" },
            {
              header: "Project Type",
              accessor: (row) => row.project_type || row.projectType || row.serviceInterested || "",
            },
            {
              header: "Submitted",
              accessor: (row) => toDateLabel(row.submitted_at || row.createdAt),
            },
            {
              header: "File",
              accessor: (row) =>
                row.file_url || row.fileUrl ? (
                  <a
                    href={(row.file_url || row.fileUrl) as string}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[var(--color-body)] underline dark:text-[var(--color-heading)]"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-[var(--color-muted)] dark:text-[var(--color-subheading)]/70">No file</span>
                ),
            },
            { header: "Status", accessor: (row) => row.status || "pending" },
            {
              header: "Actions",
              accessor: (row) => (
                <div className="flex gap-2">
                  <button
                    className="text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]"
                    onClick={() => markSubmissionStatus(row, "reviewed")}
                  >
                    Mark Reviewed
                  </button>
                  <button
                    className="text-xs font-semibold text-[var(--color-secondary)]"
                    onClick={() => markSubmissionStatus(row, "pending")}
                  >
                    Mark Pending
                  </button>
                  <button
                    className="text-xs font-semibold text-red-500"
                    onClick={() => setDeleteSubmissionId(row.id || "")}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </EditorLayout>

      <ConfirmDialog
        open={Boolean(deleteSubmissionId)}
        title="Delete submission"
        description="This action cannot be undone."
        onCancel={() => setDeleteSubmissionId(null)}
        onConfirm={deleteSubmission}
      />

      <ConfirmDialog
        open={Boolean(deleteMethodId)}
        title="Delete contact method"
        description="This action cannot be undone."
        onCancel={() => setDeleteMethodId(null)}
        onConfirm={deleteMethod}
      />
    </div>
  )
}
