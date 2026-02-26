"use client"

import { useMemo, useState } from "react"
import DataTable from "@/components/admin/DataTable"
import EditorLayout from "@/components/admin/EditorLayout"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import { useToast } from "@/components/admin/ToastProvider"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument } from "@/services/firestore"

type InvoiceStatus = "unpaid" | "partially_paid" | "paid"

type InvoiceRecord = {
  id?: string
  invoice_number?: string
  invoice_date?: string
  project_id?: string
  project_name?: string
  client_name?: string
  request_id?: string
  amount?: number
  currency?: string
  budget_range?: string
  status?: string
  payment_status?: InvoiceStatus
  issued_date?: unknown
  due_date?: string
  pdf_url?: string
  delivery_status?: string
  delivery_error?: string
  sent_to?: string
  sent_at?: string
  commitment_required_percent?: number
  commitment_required_amount?: number
  commitment_paid?: boolean
  commitment_paid_amount?: number
  final_agreed_cost?: number
  amount_paid?: number
  remaining_balance?: number
  notes?: string

  // legacy fallback fields
  commitment_required_kes?: number
  commitment_paid_amount_kes?: number
  final_agreed_cost_kes?: number
  amount_paid_kes?: number
  remaining_balance_kes?: number
}

type InvoiceDraft = {
  final_agreed_cost: number
  amount_paid: number
  notes: string
}

function toDate(value: unknown): Date | null {
  if (!value) return null
  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  if (typeof value === "object" && value && "seconds" in (value as Record<string, unknown>)) {
    const seconds = Number((value as { seconds?: number }).seconds || 0)
    return new Date(seconds * 1000)
  }
  return null
}

function normalizeCurrency(value?: string) {
  return (value || "USD").toUpperCase() === "KES" ? "KES" : "USD"
}

function money(value: number, currency: string) {
  const code = normalizeCurrency(currency)
  if (code === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  const number = new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
  return `KES ${number}`
}

function clampMoney(value: number) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  return Math.round(value * 100) / 100
}

function computePaymentStatus(finalCost: number, paid: number): InvoiceStatus {
  if (paid <= 0) return "unpaid"
  if (paid < finalCost) return "partially_paid"
  return "paid"
}

export default function InvoicesPage() {
  const { notify } = useToast()
  const invoices = useCollection<InvoiceRecord>("invoices")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, InvoiceDraft>>({})

  const rows = useMemo(
    () =>
      [...invoices.data]
        .filter((item) => statusFilter === "all" || (item.payment_status || item.status || "unpaid") === statusFilter)
        .sort((a, b) => {
          const da = toDate(a.issued_date)?.getTime() || 0
          const db = toDate(b.issued_date)?.getTime() || 0
          return db - da
        }),
    [invoices.data, statusFilter]
  )

  const totals = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const paid = invoices.data.filter((item) => {
      const s = (item.payment_status || item.status || "").toLowerCase()
      return s === "paid"
    })

    const monthTotalUsd = paid
      .filter((item) => normalizeCurrency(item.currency) === "USD")
      .filter((item) => {
        const d = toDate(item.issued_date)
        return d ? d.getMonth() === month && d.getFullYear() === year : false
      })
      .reduce((sum, item) => sum + Number(item.final_agreed_cost || item.final_agreed_cost_kes || item.amount || 0), 0)

    const monthTotalKes = paid
      .filter((item) => normalizeCurrency(item.currency) === "KES")
      .filter((item) => {
        const d = toDate(item.issued_date)
        return d ? d.getMonth() === month && d.getFullYear() === year : false
      })
      .reduce((sum, item) => sum + Number(item.final_agreed_cost || item.final_agreed_cost_kes || item.amount || 0), 0)

    const yearTotalUsd = paid
      .filter((item) => normalizeCurrency(item.currency) === "USD")
      .filter((item) => {
        const d = toDate(item.issued_date)
        return d ? d.getFullYear() === year : false
      })
      .reduce((sum, item) => sum + Number(item.final_agreed_cost || item.final_agreed_cost_kes || item.amount || 0), 0)

    const yearTotalKes = paid
      .filter((item) => normalizeCurrency(item.currency) === "KES")
      .filter((item) => {
        const d = toDate(item.issued_date)
        return d ? d.getFullYear() === year : false
      })
      .reduce((sum, item) => sum + Number(item.final_agreed_cost || item.final_agreed_cost_kes || item.amount || 0), 0)

    return { monthTotalUsd, monthTotalKes, yearTotalUsd, yearTotalKes }
  }, [invoices.data])

  if (invoices.loading) {
    return <LoadingSkeleton rows={10} />
  }

  const getDraft = (row: InvoiceRecord): InvoiceDraft => {
    const id = row.id || ""
    return (
      drafts[id] || {
        final_agreed_cost: clampMoney(Number(row.final_agreed_cost || row.final_agreed_cost_kes || row.amount || 0)),
        amount_paid: clampMoney(Number(row.amount_paid || row.amount_paid_kes || 0)),
        notes: String(row.notes || ""),
      }
    )
  }

  const updateDraft = (row: InvoiceRecord, patch: Partial<InvoiceDraft>) => {
    if (!row.id) return
    setDrafts((prev) => ({ ...prev, [row.id as string]: { ...getDraft(row), ...patch } }))
  }

  const saveInvoice = async (row: InvoiceRecord) => {
    if (!row.id) return

    const currency = normalizeCurrency(row.currency)
    const draft = getDraft(row)
    const finalCost = clampMoney(draft.final_agreed_cost)
    const amountPaid = clampMoney(draft.amount_paid)

    if (finalCost <= 0) {
      notify("Final agreed cost must be greater than 0")
      return
    }
    if (amountPaid < 0) {
      notify("Amount paid cannot be negative")
      return
    }
    if (amountPaid > finalCost * 1.5) {
      notify("Amount paid exceeds allowed threshold")
      return
    }

    const paymentStatus = computePaymentStatus(finalCost, amountPaid)
    const remaining = Math.max(0, finalCost - amountPaid)

    await upsertDocument("invoices", row.id, {
      currency,
      final_agreed_cost: finalCost,
      amount_paid: amountPaid,
      remaining_balance: remaining,
      payment_status: paymentStatus,
      status: paymentStatus,
      notes: draft.notes,
      updated_at: new Date().toISOString(),
    })
    notify("Invoice updated")
  }

  const sendInvoice = async (row: InvoiceRecord) => {
    if (!row.id) return
    try {
      const response = await fetch("/api/invoice-deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: row.id }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
      }
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || "Failed to send invoice")
      }
      notify("Invoice PDF regenerated and emailed to client")
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to send invoice")
    }
  }

  const deleteInvoice = async () => {
    if (!deleteInvoiceId) return
    try {
      const response = await fetch("/api/invoice-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: deleteInvoiceId }),
      })
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || "Failed to delete invoice")
      }
      notify("Invoice deleted")
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to delete invoice")
    } finally {
      setDeleteInvoiceId(null)
    }
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Invoices"
        subtitle="Manage manual cost agreement, amount paid, regeneration, and deletion."
      >
        <div className="grid gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] p-3">
            <p className="text-xs text-[var(--color-muted)]">Paid This Month (USD)</p>
            <p className="text-xl font-semibold text-[var(--color-heading)]">{money(totals.monthTotalUsd, "USD")}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] p-3">
            <p className="text-xs text-[var(--color-muted)]">Paid This Month (KES)</p>
            <p className="text-xl font-semibold text-[var(--color-heading)]">{money(totals.monthTotalKes, "KES")}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] p-3">
            <p className="text-xs text-[var(--color-muted)]">Paid This Year (USD)</p>
            <p className="text-xl font-semibold text-[var(--color-heading)]">{money(totals.yearTotalUsd, "USD")}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] p-3">
            <p className="text-xs text-[var(--color-muted)]">Paid This Year (KES)</p>
            <p className="text-xl font-semibold text-[var(--color-heading)]">{money(totals.yearTotalKes, "KES")}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] p-3">
            <p className="text-xs text-[var(--color-muted)]">Payment Status Filter</p>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-section)] px-2 py-1 text-sm"
            >
              <option value="all">all</option>
              <option value="unpaid">unpaid</option>
              <option value="partially_paid">partially_paid</option>
              <option value="paid">paid</option>
            </select>
          </div>
        </div>
      </EditorLayout>

      <DataTable
        data={rows}
        emptyLabel="No invoices found."
        columns={[
          {
            header: "Invoice",
            accessor: (row) => (
              <div>
                <p className="font-semibold text-[var(--color-heading)]">{row.invoice_number || row.id}</p>
                <p className="text-xs text-[var(--color-muted)]">{row.project_name || row.project_id || "-"}</p>
              </div>
            ),
          },
          {
            header: "Client",
            accessor: (row) => row.client_name || "-",
          },
          {
            header: "Currency",
            accessor: (row) => normalizeCurrency(row.currency),
          },
          {
            header: "Financials",
            accessor: (row) => {
              const currency = normalizeCurrency(row.currency)
              const draft = getDraft(row)
              const finalCost = clampMoney(draft.final_agreed_cost)
              const amountPaid = clampMoney(draft.amount_paid)
              const remaining = Math.max(0, finalCost - amountPaid)
              const status = computePaymentStatus(finalCost, amountPaid)

              return (
                <div className="min-w-[300px] space-y-2 text-xs">
                  <label className="block">
                    <span>Final Agreed Cost ({currency})</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={Number.isFinite(draft.final_agreed_cost) ? draft.final_agreed_cost : 0}
                      onChange={(event) => updateDraft(row, { final_agreed_cost: Number(event.target.value || 0) })}
                      className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-section)] px-2 py-1"
                    />
                  </label>

                  <label className="block">
                    <span>Amount Paid So Far ({currency})</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={Number.isFinite(draft.amount_paid) ? draft.amount_paid : 0}
                      onChange={(event) => updateDraft(row, { amount_paid: Number(event.target.value || 0) })}
                      className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-section)] px-2 py-1"
                    />
                  </label>

                  <p>Remaining Balance: <strong>{money(remaining, currency)}</strong></p>
                  <p>Payment Status: <strong>{status}</strong></p>
                </div>
              )
            },
          },
          {
            header: "Issued / Due",
            accessor: (row) => (
              <div className="text-xs">
                <p>Issued: {row.invoice_date ? new Date(row.invoice_date).toLocaleDateString() : toDate(row.issued_date)?.toLocaleDateString() || "-"}</p>
                <p>Due: {row.due_date ? new Date(row.due_date).toLocaleDateString() : "-"}</p>
              </div>
            ),
          },
          {
            header: "Notes",
            accessor: (row) => {
              const draft = getDraft(row)
              return (
                <textarea
                  rows={4}
                  value={draft.notes}
                  onChange={(event) => updateDraft(row, { notes: event.target.value })}
                  className="min-w-[220px] rounded border border-[var(--color-border)] bg-[var(--color-section)] px-2 py-1 text-xs"
                  placeholder="Invoice notes"
                />
              )
            },
          },
          {
            header: "Delivery",
            accessor: (row) => (
              <div className="space-y-1 text-xs">
                <p>Status: {row.delivery_status || "not_sent"}</p>
                {row.sent_to ? <p>To: {row.sent_to}</p> : null}
                {row.sent_at ? <p>Sent: {new Date(row.sent_at).toLocaleString()}</p> : null}
                {row.pdf_url ? (
                  <a href={row.pdf_url} target="_blank" rel="noreferrer" className="underline">
                    Open PDF
                  </a>
                ) : null}
                {row.delivery_error ? <p className="text-red-600">{row.delivery_error}</p> : null}
              </div>
            ),
          },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="min-w-[210px] space-y-2">
                <button
                  type="button"
                  onClick={() => void saveInvoice(row)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)]"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => void sendInvoice(row)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)]"
                >
                  Regenerate + Send PDF
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteInvoiceId(row.id || null)}
                  className="w-full rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700"
                >
                  Delete Invoice
                </button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={Boolean(deleteInvoiceId)}
        title="Delete Invoice"
        description="This will permanently remove the invoice and its PDF file from storage."
        onCancel={() => setDeleteInvoiceId(null)}
        onConfirm={() => void deleteInvoice()}
      />
    </div>
  )
}
