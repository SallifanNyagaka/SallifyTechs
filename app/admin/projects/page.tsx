"use client"

import { useMemo } from "react"
import DataTable from "@/components/admin/DataTable"
import EditorLayout from "@/components/admin/EditorLayout"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import { useToast } from "@/components/admin/ToastProvider"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument } from "@/services/firestore"

type ProjectRecord = {
  id?: string
  name?: string
  client_name?: string
  service_type?: string
  status?: string
  progress?: number
  deadline?: unknown
  assigned_to?: string
  source_request_id?: string
  invoice_id?: string
  created_at?: unknown
}

function toDateLabel(value: unknown) {
  if (!value) return "-"
  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
  }
  if (typeof value === "object" && value && "seconds" in (value as Record<string, unknown>)) {
    const seconds = Number((value as { seconds?: number }).seconds || 0)
    return new Date(seconds * 1000).toLocaleDateString()
  }
  return "-"
}

export default function ProjectsPage() {
  const { notify } = useToast()
  const projects = useCollection<ProjectRecord>("projects")

  const rows = useMemo(
    () =>
      [...projects.data].sort((a, b) => {
        const pa = Number(a.progress || 0)
        const pb = Number(b.progress || 0)
        return pb - pa
      }),
    [projects.data]
  )

  if (projects.loading) {
    return <LoadingSkeleton rows={10} />
  }

  const updateProgress = async (row: ProjectRecord, progress: number) => {
    if (!row.id) return
    await upsertDocument("projects", row.id, {
      progress: Math.max(0, Math.min(100, progress)),
      updated_at: new Date().toISOString(),
    })
    notify("Project progress updated")
  }

  const updateStatus = async (row: ProjectRecord, status: string) => {
    if (!row.id) return
    await upsertDocument("projects", row.id, {
      status,
      updated_at: new Date().toISOString(),
    })
    notify(`Project marked ${status}`)
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Projects"
        subtitle="Track active project delivery, progress, deadlines, and ownership."
      >
        <div />
      </EditorLayout>

      <DataTable
        data={rows}
        emptyLabel="No projects yet. Activate a request from Project Requests."
        columns={[
          {
            header: "Project",
            accessor: (row) => (
              <div>
                <p className="font-semibold text-[var(--color-heading)]">{row.name || "Untitled"}</p>
                <p className="text-xs text-[var(--color-muted)]">{row.service_type || "General"}</p>
              </div>
            ),
          },
          {
            header: "Client",
            accessor: (row) => (
              <div>
                <p>{row.client_name || "-"}</p>
                <p className="text-xs text-[var(--color-muted)]">Assigned: {row.assigned_to || "Unassigned"}</p>
              </div>
            ),
          },
          {
            header: "Progress",
            accessor: (row) => {
              const progress = Math.max(0, Math.min(100, Number(row.progress || 0)))
              return (
                <div className="min-w-[180px] space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--color-section-alt)]">
                    <div className="h-full bg-[var(--color-primary)]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs" onClick={() => void updateProgress(row, progress - 10)}>-10%</button>
                    <span className="text-xs font-semibold">{progress}%</span>
                    <button type="button" className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs" onClick={() => void updateProgress(row, progress + 10)}>+10%</button>
                  </div>
                </div>
              )
            },
          },
          {
            header: "Deadline",
            accessor: (row) => toDateLabel(row.deadline),
          },
          {
            header: "Linked IDs",
            accessor: (row) => (
              <div className="space-y-1 text-xs">
                <p>Request: {row.source_request_id || "-"}</p>
                <p>Invoice: {row.invoice_id || "-"}</p>
              </div>
            ),
          },
          {
            header: "Status",
            accessor: (row) => (
              <select
                value={row.status || "active"}
                onChange={(event) => void updateStatus(row, event.target.value)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-section)] px-2 py-1 text-xs"
              >
                <option value="active">active</option>
                <option value="in_progress">in_progress</option>
                <option value="on_hold">on_hold</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            ),
          },
        ]}
      />
    </div>
  )
}
