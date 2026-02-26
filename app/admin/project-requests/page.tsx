"use client"

import { useMemo, useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import EditorLayout from "@/components/admin/EditorLayout"
import DataTable from "@/components/admin/DataTable"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"
import { firestore } from "@/lib/firebase"

type ProjectRequestRecord = {
  id?: string
  client_info?: {
    name?: string
    email?: string
    phone?: string
    company?: string
    country?: string
    timezone?: string
  }
  project_overview?: {
    title?: string
    type?: string
    service_id?: string
    summary?: string
    is_redesign?: boolean
  }
  requirements?: {
    description?: string
    features?: string[]
    target_audience?: string
    goals?: string
    examples?: string
  }
  budget?: {
    range?: string
    currency?: string
    start_date?: string
    deadline?: string
  }
  preferences?: {
    style?: string
    branding?: boolean
    hosting?: boolean
    maintenance?: boolean
    seo?: boolean
    accessibility?: string
  }
  files?: { name?: string; url?: string }[]
  communication_preference?: string
  status?: "pending" | "reviewed" | "won" | "lost" | "new" | "proposal sent" | "negotiation"
  created_at?: unknown
  delivery_status?: string
  delivery_error?: string
  pdf_url?: string
  project_id?: string
  invoice_id?: string
}

function formatTimestamp(value: unknown) {
  if (!value) return ""
  if (typeof value === "string") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
  }
  if (typeof value === "object" && value && "seconds" in (value as Record<string, unknown>)) {
    const seconds = Number((value as { seconds?: number }).seconds || 0)
    return new Date(seconds * 1000).toLocaleString()
  }
  return ""
}

function sanitizePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function buildClientContact(
  row: ProjectRequestRecord
): { href: string; label: string; external?: boolean } {
  const preferred = String(row.communication_preference || "").toLowerCase()
  const email = String(row.client_info?.email || "").trim()
  const phone = String(row.client_info?.phone || "").trim()
  const phoneDigits = phone.replace(/[^\d+]/g, "")
  const projectTitle = row.project_overview?.title || "Project Request Follow-up"
  const subject = encodeURIComponent(projectTitle)

  if (preferred === "whatsapp" && phoneDigits) {
    const wa = phoneDigits.startsWith("+")
      ? phoneDigits.slice(1)
      : phoneDigits.startsWith("00")
        ? phoneDigits.slice(2)
        : phoneDigits
    return {
      href: `https://wa.me/${wa}`,
      label: "Contact (WhatsApp)",
      external: true,
    }
  }

  if (preferred === "phone" && phoneDigits) {
    return {
      href: `tel:${phoneDigits}`,
      label: "Contact (Call)",
    }
  }

  if (preferred === "video call" && email) {
    return {
      href: `mailto:${email}?subject=${subject}`,
      label: "Contact (Schedule Call)",
    }
  }

  if (email) {
    return {
      href: `mailto:${email}?subject=${subject}`,
      label: "Contact (Email)",
    }
  }

  if (phoneDigits) {
    return {
      href: `tel:${phoneDigits}`,
      label: "Contact (Call)",
    }
  }

  return {
    href: "#",
    label: "No contact method",
  }
}

function parseAmountRange(range: string) {
  const numbers = Array.from(range.matchAll(/[\d,.]+/g))
    .map((item) => Number(String(item[0]).replace(/,/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0)

  if (!numbers.length) return 0
  if (numbers.length === 1) return numbers[0]
  return Math.round((numbers[0] + numbers[1]) / 2)
}

function estimateInvoiceAmount(range: string) {
  const parsed = parseAmountRange(range)
  if (parsed > 0) return parsed

  const normalized = range.toLowerCase()
  if (normalized.includes("5000")) return 6500
  if (normalized.includes("1500")) return 1000
  if (normalized.includes("500")) return 400
  return 1500
}

export default function ProjectRequestsPage() {
  const { notify } = useToast()
  const requests = useCollection<ProjectRequestRecord>("project_requests")

  const [serviceFilter, setServiceFilter] = useState("all")
  const [budgetFilter, setBudgetFilter] = useState("all")

  const sorted = useMemo(
    () =>
      [...requests.data].sort((a, b) => {
        const aDate = formatTimestamp(a.created_at)
        const bDate = formatTimestamp(b.created_at)
        return bDate.localeCompare(aDate)
      }),
    [requests.data]
  )

  const serviceTypes = useMemo(
    () =>
      Array.from(
        new Set(
          sorted
            .map((item) => item.project_overview?.type || "")
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [sorted]
  )

  const budgetRanges = useMemo(
    () =>
      Array.from(
        new Set(
          sorted
            .map((item) => item.budget?.range || "")
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [sorted]
  )

  const filtered = useMemo(
    () =>
      sorted.filter((item) => {
        const serviceOk = serviceFilter === "all" || (item.project_overview?.type || "") === serviceFilter
        const budgetOk = budgetFilter === "all" || (item.budget?.range || "") === budgetFilter
        return serviceOk && budgetOk
      }),
    [budgetFilter, serviceFilter, sorted]
  )

  if (requests.loading) {
    return <LoadingSkeleton rows={8} />
  }

  const downloadSummary = async (item: ProjectRequestRecord) => {
    if (!item.id) return
    try {
      const response = await fetch("/api/project-request-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission: item }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error || "Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      const userPart = sanitizePart(item.client_info?.name || "user")
      const projectPart = sanitizePart(item.project_overview?.title || "project")
      anchor.download = `${userPart}_${projectPart}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to download PDF")
    }
  }

  const setStatus = async (
    item: ProjectRequestRecord,
    status: "pending" | "reviewed" | "won" | "lost" | "new" | "proposal sent" | "negotiation"
  ) => {
    if (!item.id) return
    await upsertDocument("project_requests", item.id, { status })
    notify(`Project request marked as ${status}`)
  }

  const runDelivery = async (item: ProjectRequestRecord) => {
    if (!item.id) return
    try {
      const response = await fetch("/api/project-request-deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: item.id }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        warning?: string
        alreadyDelivered?: boolean
      }
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || "Delivery failed")
      }

      if (payload.alreadyDelivered) {
        notify("Already delivered")
        return
      }
      notify(payload.warning || "Delivery pipeline executed")
    } catch (error) {
      notify(error instanceof Error ? error.message : "Delivery failed")
    }
  }

  const activateProject = async (item: ProjectRequestRecord) => {
    if (!item.id) return
    if (item.project_id) {
      notify("Project already activated for this request")
      return
    }

    try {
      const projectTitle = item.project_overview?.title?.trim() || "Client Project"
      const clientName = item.client_info?.name?.trim() || "Client"
      const serviceType = item.project_overview?.type?.trim() || "General"
      const budgetRange = item.budget?.range?.trim() || ""
      const currency = (item.budget?.currency?.trim() || "USD").toUpperCase()
      const estimatedBaseUsd = estimateInvoiceAmount(budgetRange)
      let usdKesRate = Number(process.env.NEXT_PUBLIC_USD_TO_KES_RATE || 155)
      if (currency === "KES") {
        try {
          const response = await fetch("/api/exchange-rate")
          const payload = (await response.json().catch(() => ({}))) as { rate?: number }
          if (Number(payload.rate || 0) > 0) {
            usdKesRate = Number(payload.rate)
          }
        } catch {
          // fallback rate is used
        }
      }
      const estimatedAmount =
        currency === "KES"
          ? Math.round(estimatedBaseUsd * usdKesRate * 100) / 100
          : estimatedBaseUsd

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 7)

      const projectRef = await addDoc(collection(firestore, "projects"), {
        name: projectTitle,
        client_name: clientName,
        status: "awaiting_commitment",
        progress: 0,
        assigned_to: "Unassigned",
        service_type: serviceType,
        source_request_id: item.id,
        project_summary: item.project_overview?.summary || "",
        deadline: item.budget?.deadline || "",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      const invoiceRef = await addDoc(collection(firestore, "invoices"), {
        project_id: projectRef.id,
        project_name: projectTitle,
        client_name: clientName,
        request_id: item.id,
        amount: estimatedAmount,
        currency,
        exchange_rate_usd_kes: usdKesRate,
        final_agreed_cost: estimatedAmount,
        amount_paid: 0,
        remaining_balance: estimatedAmount,
        payment_status: "unpaid",
        commitment_required_percent: 25,
        commitment_required_amount: Math.round(estimatedAmount * 0.25 * 100) / 100,
        commitment_paid: false,
        commitment_paid_amount: 0,
        budget_range: budgetRange,
        status: "unpaid",
        issued_date: serverTimestamp(),
        due_date: dueDate.toISOString(),
        notes: "Auto-generated invoice at project activation",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      await upsertDocument("project_requests", item.id, {
        status: "won",
        project_started: true,
        project_id: projectRef.id,
        invoice_id: invoiceRef.id,
        activated_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      notify("Project activated and invoice generated")
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to activate project")
    }
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Project Requests"
        subtitle="Review submissions, activate projects, and manage delivery and invoicing."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[var(--color-body)]">
            Filter by Service Type
            <select
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            >
              <option value="all">All service types</option>
              {serviceTypes.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-[var(--color-body)]">
            Filter by Budget
            <select
              value={budgetFilter}
              onChange={(event) => setBudgetFilter(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
            >
              <option value="all">All budget ranges</option>
              {budgetRanges.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
      </EditorLayout>

      <DataTable
        data={filtered}
        emptyLabel="No project requests match the selected filters."
        columns={[
          {
            header: "Client",
            accessor: (row) => (
              <div>
                <p className="font-semibold text-[var(--color-heading)]">{row.client_info?.name || ""}</p>
                <p className="text-xs text-[var(--color-muted)]">{row.client_info?.company || ""}</p>
              </div>
            ),
          },
          {
            header: "Project",
            accessor: (row) => (
              <div>
                <p className="font-semibold text-[var(--color-heading)]">{row.project_overview?.title || ""}</p>
                <p className="text-xs text-[var(--color-muted)]">{row.project_overview?.type || ""}</p>
              </div>
            ),
          },
          {
            header: "Budget",
            accessor: (row) => `${row.budget?.range || ""} ${row.budget?.currency ? `(${row.budget.currency})` : ""}`,
          },
          {
            header: "Status",
            accessor: (row) => row.status || "pending",
          },
          {
            header: "Project",
            accessor: (row) => (
              <div className="space-y-1">
                {row.project_id ? (
                  <p className="text-xs text-[var(--color-body)]">Project ID: {row.project_id}</p>
                ) : (
                  <p className="text-xs text-[var(--color-muted)]">Not started</p>
                )}
                {row.invoice_id ? (
                  <p className="text-xs text-[var(--color-body)]">Invoice ID: {row.invoice_id}</p>
                ) : null}
              </div>
            ),
          },
          {
            header: "Delivery",
            accessor: (row) => (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[var(--color-body)]">
                  {row.delivery_status || "queued"}
                </p>
                {row.pdf_url ? (
                  <a
                    href={row.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-[var(--color-body)] underline"
                  >
                    Open PDF
                  </a>
                ) : null}
                {row.delivery_error ? (
                  <p className="max-w-xs text-xs text-red-600">{row.delivery_error}</p>
                ) : null}
              </div>
            ),
          },
          {
            header: "Files",
            accessor: (row) => (
              <div className="space-y-1">
                {(row.files || []).length ? (
                  (row.files || []).map((file, index) => (
                    <a
                      key={`${file.url}-${index}`}
                      href={file.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs font-semibold text-[var(--color-body)] underline"
                    >
                      {file.name || `File ${index + 1}`}
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-[var(--color-muted)]">No files</span>
                )}
              </div>
            ),
          },
          {
            header: "Submitted",
            accessor: (row) => formatTimestamp(row.created_at),
          },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="min-w-[420px] flex flex-wrap gap-2">
                <button type="button" className="text-xs font-semibold text-[var(--color-body)]" onClick={() => void setStatus(row, "reviewed")}>
                  Mark Reviewed
                </button>
                <button type="button" className="text-xs font-semibold text-[var(--color-secondary)]" onClick={() => void setStatus(row, "pending")}>
                  Mark Pending
                </button>
                <button type="button" className="text-xs font-semibold text-emerald-700 underline" onClick={() => void activateProject(row)}>
                  Activate Project
                </button>
                {(() => {
                  const contact = buildClientContact(row)
                  return contact.href === "#" ? (
                    <span className="text-xs text-[var(--color-muted)]">No contact</span>
                  ) : (
                    <a
                      href={contact.href}
                      target={contact.external ? "_blank" : undefined}
                      rel={contact.external ? "noreferrer" : undefined}
                      className="text-xs font-semibold text-[var(--color-body)] underline"
                    >
                      {contact.label}
                    </a>
                  )
                })()}
                <button type="button" className="text-xs font-semibold text-[var(--color-body)]" onClick={() => void downloadSummary(row)}>
                  Download PDF
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--color-body)] underline"
                  onClick={() => void runDelivery(row)}
                >
                  Retry Delivery
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
