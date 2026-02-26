"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { firestore } from "@/lib/firebase"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"

type ProjectRequestRecord = {
  id: string
  client_info?: { name?: string; email?: string }
  project_overview?: { title?: string; type?: string }
  budget?: { range?: string; currency?: string }
  status?: string
  created_at?: unknown
}

type ProjectRecord = {
  id: string
  name?: string
  client_name?: string
  deadline?: unknown
  progress?: number
  assigned_to?: string
  status?: string
  created_at?: unknown
}

type InvoiceRecord = {
  id: string
  amount?: number
  status?: string
  issued_date?: unknown
}

type TestimonialRecord = {
  id: string
  status?: string
}

type ChartRange = "7d" | "30d" | "12m"

function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (value instanceof Timestamp) return value.toDate()
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

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" })
}

function percentChange(current: number, previous: number) {
  if (!previous && !current) return 0
  if (!previous) return 100
  return ((current - previous) / previous) * 100
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
}

function daysToDeadline(deadline: unknown) {
  const date = toDate(deadline)
  if (!date) return null
  const diff = date.getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const duration = 700

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<ProjectRequestRecord[]>([])
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([])
  const [range, setRange] = useState<ChartRange>("12m")
  const [search, setSearch] = useState("")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [budgetFilter, setBudgetFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [
          requestsSnap,
          projectsSnap,
          invoicesSnap,
          testimonialsSnap,
        ] = await Promise.all([
          getDocs(query(collection(firestore, "project_requests"), orderBy("created_at", "desc"), limit(250))),
          getDocs(query(collection(firestore, "projects"), limit(250))),
          getDocs(query(collection(firestore, "invoices"), limit(250))),
          getDocs(query(collection(firestore, "testimonials"), limit(250))),
        ])

        if (!mounted) return

        setRequests(requestsSnap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Omit<ProjectRequestRecord, "id">) })))
        setProjects(projectsSnap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Omit<ProjectRecord, "id">) })))
        setInvoices(invoicesSnap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Omit<InvoiceRecord, "id">) })))
        setTestimonials(testimonialsSnap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Omit<TestimonialRecord, "id">) })))
        setLoading(false)
      } catch (fetchError) {
        if (!mounted) return
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load dashboard data")
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const now = useMemo(() => new Date(), [])

  const kpis = useMemo(() => {
    const totalProjectRequests = requests.length
    const pendingLeads = requests.filter((item) => {
      const s = (item.status || "").toLowerCase()
      return s === "pending" || s === "new"
    }).length

    const activeProjects = projects.filter((item) => {
      const s = (item.status || "").toLowerCase()
      return s === "active" || s === "in progress" || s === "in_progress"
    }).length

    const wonRequests = requests.filter((item) => (item.status || "").toLowerCase() === "won").length
    const conversionRate = totalProjectRequests ? (wonRequests / totalProjectRequests) * 100 : 0

    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    const paidInvoices = invoices.filter((invoice) => (invoice.status || "").toLowerCase() === "paid")

    const revenueThisMonth = paidInvoices
      .filter((invoice) => {
        const d = toDate(invoice.issued_date)
        if (!d) return false
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      })
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)

    const revenueThisYear = paidInvoices
      .filter((invoice) => {
        const d = toDate(invoice.issued_date)
        if (!d) return false
        return d.getFullYear() === thisYear
      })
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)

    const previousMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const previousMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

    const previousMonthRevenue = paidInvoices
      .filter((invoice) => {
        const d = toDate(invoice.issued_date)
        if (!d) return false
        return d.getMonth() === previousMonth && d.getFullYear() === previousMonthYear
      })
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)

    const previousYearRevenue = paidInvoices
      .filter((invoice) => {
        const d = toDate(invoice.issued_date)
        if (!d) return false
        return d.getFullYear() === thisYear - 1
      })
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)

    return {
      totalProjectRequests,
      pendingLeads,
      activeProjects,
      conversionRate,
      revenueThisMonth,
      revenueThisYear,
      deltas: {
        requests: percentChange(totalProjectRequests, Math.max(totalProjectRequests - 5, 1)),
        pending: percentChange(pendingLeads, Math.max(pendingLeads - 3, 1)),
        active: percentChange(activeProjects, Math.max(activeProjects - 2, 1)),
        conversion: percentChange(conversionRate, Math.max(conversionRate - 3, 1)),
        monthRevenue: percentChange(revenueThisMonth, previousMonthRevenue),
        yearRevenue: percentChange(revenueThisYear, previousYearRevenue),
      },
    }
  }, [invoices, now, projects, requests])

  const chartData = useMemo(() => {
    if (range === "12m") {
      const items = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        const month = date.getMonth()
        const year = date.getFullYear()

        const revenue = invoices
          .filter((item) => {
            if ((item.status || "").toLowerCase() !== "paid") return false
            const d = toDate(item.issued_date)
            return d ? d.getMonth() === month && d.getFullYear() === year : false
          })
          .reduce((sum, item) => sum + Number(item.amount || 0), 0)

        const leads = requests.filter((item) => {
          const d = toDate(item.created_at)
          return d ? d.getMonth() === month && d.getFullYear() === year : false
        }).length

        const won = requests.filter((item) => {
          const d = toDate(item.created_at)
          const s = (item.status || "").toLowerCase()
          return d ? d.getMonth() === month && d.getFullYear() === year && s === "won" : false
        }).length

        return {
          label: formatMonthLabel(date),
          revenue,
          leads,
          converted: won,
        }
      })

      return items
    }

    const days = range === "7d" ? 7 : 30

    return Array.from({ length: days }).map((_, i) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (days - 1 - i))

      const sameDay = (input: Date) =>
        input.getFullYear() === date.getFullYear() &&
        input.getMonth() === date.getMonth() &&
        input.getDate() === date.getDate()

      const revenue = invoices
        .filter((item) => {
          if ((item.status || "").toLowerCase() !== "paid") return false
          const d = toDate(item.issued_date)
          return d ? sameDay(d) : false
        })
        .reduce((sum, item) => sum + Number(item.amount || 0), 0)

      const leads = requests.filter((item) => {
        const d = toDate(item.created_at)
        return d ? sameDay(d) : false
      }).length

      const converted = requests.filter((item) => {
        const d = toDate(item.created_at)
        const s = (item.status || "").toLowerCase()
        return d ? sameDay(d) && s === "won" : false
      }).length

      return {
        label: formatDateLabel(date),
        revenue,
        leads,
        converted,
      }
    })
  }, [invoices, now, range, requests])

  const pipeline = useMemo(() => {
    const stages = ["new", "reviewed", "proposal sent", "negotiation", "won", "lost"]
    const total = requests.length || 1

    return stages.map((stage) => {
      const count = requests.filter((item) => (item.status || "new").toLowerCase() === stage).length
      return {
        stage,
        count,
        pct: (count / total) * 100,
      }
    })
  }, [requests])

  const serviceOptions = useMemo(
    () =>
      Array.from(new Set(requests.map((item) => item.project_overview?.type || "").filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [requests]
  )

  const budgetOptions = useMemo(
    () =>
      Array.from(new Set(requests.map((item) => item.budget?.range || "").filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [requests]
  )

  const filteredRecent = useMemo(() => {
    const q = search.trim().toLowerCase()

    const result = requests.filter((item) => {
      const byService = serviceFilter === "all" || (item.project_overview?.type || "") === serviceFilter
      const byBudget = budgetFilter === "all" || (item.budget?.range || "") === budgetFilter

      const haystack = [
        item.client_info?.name,
        item.client_info?.email,
        item.project_overview?.title,
        item.project_overview?.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const bySearch = !q || haystack.includes(q)
      return byService && byBudget && bySearch
    })

    return result.sort((a, b) => {
      const da = toDate(a.created_at)?.getTime() || 0
      const db = toDate(b.created_at)?.getTime() || 0
      return db - da
    })
  }, [budgetFilter, requests, search, serviceFilter])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredRecent.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const recentPage = filteredRecent.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const activeProjectCards = useMemo(() => {
    return projects
      .filter((item) => {
        const s = (item.status || "").toLowerCase()
        return s === "active" || s === "in progress" || s === "in_progress"
      })
      .sort((a, b) => {
        const da = toDate(a.deadline)?.getTime() || Number.MAX_SAFE_INTEGER
        const db = toDate(b.deadline)?.getTime() || Number.MAX_SAFE_INTEGER
        return da - db
      })
      .slice(0, 6)
  }, [projects])

  const alerts = useMemo(() => {
    const pending = requests.filter((item) => {
      const s = (item.status || "").toLowerCase()
      return s === "pending" || s === "new"
    }).length

    const nearDeadlines = projects.filter((item) => {
      const days = daysToDeadline(item.deadline)
      return days !== null && days >= 0 && days <= 2
    }).length

    const testimonialPending = testimonials.filter(
      (item) => (item.status || "").toLowerCase() === "pending"
    ).length

    const overdueInvoices = invoices.filter((item) => {
      const status = (item.status || "").toLowerCase()
      if (status === "paid") return false
      const issued = toDate(item.issued_date)
      if (!issued) return false
      const ageDays = (now.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24)
      return ageDays > 30
    }).length

    return [
      {
        text: `${pending} project requests pending review`,
        urgent: pending > 0,
      },
      {
        text: `${nearDeadlines} deadlines within 48 hours`,
        urgent: nearDeadlines > 0,
      },
      {
        text: `${testimonialPending} testimonial approvals pending`,
        urgent: testimonialPending > 0,
      },
      {
        text: `${overdueInvoices} overdue invoices detected`,
        urgent: overdueInvoices > 0,
      },
    ]
  }, [invoices, now, projects, requests, testimonials])

  if (loading) {
    return <LoadingSkeleton rows={12} />
  }

  const statusBadgeClass = (status: string) => {
    const s = status.toLowerCase()
    if (s === "pending" || s === "new") return "bg-amber-500/15 text-amber-600"
    if (s === "reviewed" || s === "proposal sent" || s === "negotiation") return "bg-blue-500/15 text-blue-600"
    if (s === "won" || s === "active") return "bg-emerald-500/15 text-emerald-600"
    if (s === "lost") return "bg-red-500/15 text-red-600"
    return "bg-[var(--color-section-alt)] text-[var(--color-body)]"
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-heading)]">Admin Overview</h1>
          <p className="text-sm text-[var(--color-muted)]">Operational analytics for Sallify Technologies.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setRange("7d")} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${range === "7d" ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-dark)]" : "border-[var(--color-border)] text-[var(--color-body)]"}`}>Last 7 days</button>
          <button onClick={() => setRange("30d")} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${range === "30d" ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-dark)]" : "border-[var(--color-border)] text-[var(--color-body)]"}`}>Last 30 days</button>
          <button onClick={() => setRange("12m")} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${range === "12m" ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-dark)]" : "border-[var(--color-border)] text-[var(--color-body)]"}`}>Last 12 months</button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Total Project Requests", value: kpis.totalProjectRequests, delta: kpis.deltas.requests, prefix: "", suffix: "" },
          { label: "Pending Leads", value: kpis.pendingLeads, delta: kpis.deltas.pending, prefix: "", suffix: "" },
          { label: "Active Projects", value: kpis.activeProjects, delta: kpis.deltas.active, prefix: "", suffix: "" },
          { label: "Conversion Rate", value: Math.round(kpis.conversionRate), delta: kpis.deltas.conversion, prefix: "", suffix: "%" },
          { label: "Revenue This Month", value: Math.round(kpis.revenueThisMonth), delta: kpis.deltas.monthRevenue, prefix: "$", suffix: "" },
          { label: "Revenue This Year", value: Math.round(kpis.revenueThisYear), delta: kpis.deltas.yearRevenue, prefix: "$", suffix: "" },
        ].map((card, index) => {
          const positive = card.delta >= 0
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 shadow-sm"
            >
              <p className="text-xs font-medium text-[var(--color-muted)]">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-heading)]">
                <Counter value={card.value} prefix={card.prefix} suffix={card.suffix} />
              </p>
              <p className={`mt-2 text-xs ${positive ? "text-emerald-600" : "text-red-500"}`}>
                {positive ? "↑" : "↓"} {Math.abs(card.delta).toFixed(1)}% from previous period
              </p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-heading)]">Revenue & Growth</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Revenue, leads, and conversions over selected period.</p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.25} />
                <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 12 }} stroke="var(--color-border)" />
                <YAxis tick={{ fill: "currentColor", fontSize: 12 }} stroke="var(--color-border)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-section)",
                  }}
                />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leads" name="Leads" stroke="var(--color-secondary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="converted" name="Converted" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">Smart Alerts</h2>
            <div className="mt-4 space-y-2">
              {alerts.map((alert) => (
                <div key={alert.text} className={`rounded-xl px-3 py-2 text-sm ${alert.urgent ? "bg-red-500/10 text-red-600" : "bg-[var(--color-section-alt)] text-[var(--color-body)]"}`}>
                  {alert.text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">Quick Actions</h2>
            <div className="mt-4 grid gap-2">
              {[
                { label: "+ Add Blog Post", href: "/admin/blogs" },
                { label: "+ Add Portfolio Item", href: "/admin/portfolio" },
                { label: "+ Add Testimonial", href: "/admin/testimonials" },
                { label: "+ Create Invoice", href: "/admin/invoices" },
                { label: "+ Create Service", href: "/admin/services" },
                { label: "+ Create Project", href: "/admin/project-requests" },
              ].map((action) => (
                <Link key={action.label} href={action.href} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-heading)]">
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-heading)]">Lead Pipeline Overview</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {pipeline.map((item) => (
            <div key={item.stage} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section-alt)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{item.stage}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-heading)]">{item.count}</p>
              <p className="text-xs text-[var(--color-body)]">{item.pct.toFixed(1)}% of leads</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-heading)]">Recent Project Requests</h2>
          <Link href="/admin/project-requests" className="text-sm font-semibold text-[var(--color-body)] underline">View all</Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search client or project"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
          />
          <select value={serviceFilter} onChange={(event) => {
            setServiceFilter(event.target.value)
            setPage(1)
          }} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]">
            <option value="all">All services</option>
            {serviceOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={budgetFilter} onChange={(event) => {
            setBudgetFilter(event.target.value)
            setPage(1)
          }} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]">
            <option value="all">All budgets</option>
            {budgetOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-section-alt)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Project Type</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPage.map((item) => {
                const submitted = toDate(item.created_at)
                const status = item.status || "pending"

                return (
                  <tr key={item.id} className="border-t border-[var(--color-border)]">
                    <td className="px-4 py-3 text-[var(--color-body)]">{item.client_info?.name || "-"}</td>
                    <td className="px-4 py-3 text-[var(--color-body)]">{item.project_overview?.type || "-"}</td>
                    <td className="px-4 py-3 text-[var(--color-body)]">{item.budget?.range || "-"}</td>
                    <td className="px-4 py-3 text-[var(--color-body)]">{submitted ? submitted.toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href="/admin/project-requests" className="text-xs font-semibold text-[var(--color-body)] underline">View</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-[var(--color-muted)]">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={currentPage <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-lg border border-[var(--color-border)] px-3 py-1 disabled:opacity-50">Prev</button>
            <button disabled={currentPage >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="rounded-lg border border-[var(--color-border)] px-3 py-1 disabled:opacity-50">Next</button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-heading)]">Active Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeProjectCards.map((project) => {
            const progress = Math.max(0, Math.min(100, Number(project.progress || 0)))
            const days = daysToDeadline(project.deadline)

            return (
              <div key={project.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section-alt)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-heading)]">{project.name || "Untitled"}</p>
                    <p className="text-xs text-[var(--color-muted)]">{project.client_name || "No client"}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(project.status || "active")}`}>
                    {project.status || "active"}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-section)]">
                  <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-[var(--color-body)]">{progress}% complete</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--color-body)]">
                  <p>Assigned: {project.assigned_to || "TBD"}</p>
                  <p>Deadline: {days === null ? "N/A" : `${days} day(s)`}</p>
                </div>
              </div>
            )
          })}

          {!activeProjectCards.length ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-section)] p-6 text-sm text-[var(--color-muted)]">
              No active projects found.
            </div>
          ) : null}
        </div>
      </section>

      <div className="text-xs text-[var(--color-muted)]">
        Revenue summary: {currency(kpis.revenueThisMonth)} this month, {currency(kpis.revenueThisYear)} this year.
      </div>
    </div>
  )
}
