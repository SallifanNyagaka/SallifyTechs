import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { PDFDocument, PDFFont, PDFImage, StandardFonts, rgb } from "pdf-lib"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { getServerFirestore } from "@/lib/server/firebase-server"
import { uploadPdfAndGetUrl } from "@/lib/server/firebase-storage-server"
import { getUsdToKesRate } from "@/lib/server/exchange-rate"

export const runtime = "nodejs"

type InvoiceStatus = "unpaid" | "partially_paid" | "paid"

type InvoiceRecord = {
  id?: string
  invoice_number?: string
  invoice_date?: string
  due_date?: string
  project_id?: string
  project_name?: string
  client_name?: string
  request_id?: string
  amount?: number
  currency?: "USD" | "KES" | string
  exchange_rate_usd_kes?: number
  budget_range?: string
  status?: string
  issued_date?: unknown
  commitment_required_percent?: number
  commitment_required_amount?: number
  commitment_paid?: boolean
  commitment_paid_amount?: number
  final_agreed_cost?: number
  amount_paid?: number
  remaining_balance?: number
  payment_status?: InvoiceStatus
  notes?: string
}

type ProjectRequestRecord = {
  client_info?: {
    name?: string
    email?: string
    phone?: string
    company?: string
    address?: string
  }
  project_overview?: {
    title?: string
    type?: string
    summary?: string
  }
  requirements?: {
    description?: string
    features?: string[]
  }
  budget?: {
    range?: string
    start_date?: string
    deadline?: string
    currency?: "USD" | "KES" | string
  }
  preferences?: {
    hosting?: boolean
    maintenance?: boolean
  }
}

type BusinessProfile = {
  phone: string
  email: string
  logoUrl: string
  mpesa: string
  bankTransfer: string
  paypal: string
}

function sanitizePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function resolveFirebaseImageUrl(raw?: string) {
  if (!raw) return ""
  if (raw.startsWith("https://")) return raw
  if (raw.startsWith("gs://")) {
    const path = raw.replace("gs://", "")
    const separator = path.indexOf("/")
    if (separator === -1) return ""
    const bucket = path.slice(0, separator)
    const objectPath = path.slice(separator + 1)
    return `https://storage.googleapis.com/${bucket}/${objectPath}`
  }
  return ""
}

function normalizeCurrency(value?: string) {
  return (value || "USD").toUpperCase() === "KES" ? "KES" : "USD"
}

function formatCurrency(amount: number, currency: "USD" | "KES") {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  const number = new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `KES ${number}`
}

function toDateISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

function toDateLabel(value?: string) {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" })
}

function dateToken(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}${m}${d}`
}

async function generateSequentialInvoiceNumber(firestore: ReturnType<typeof getServerFirestore>) {
  const token = dateToken()
  const sequenceRef = doc(firestore, "invoice_sequences", token)

  const nextNumber = await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(sequenceRef)
    const last = snap.exists() ? Number((snap.data() as Record<string, unknown>).last || 0) : 0
    const next = last + 1
    tx.set(
      sequenceRef,
      {
        date: token,
        last: next,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    )
    return next
  })

  return `ST-${token}-${String(nextNumber).padStart(3, "0")}`
}

function complexityWeight(input: string) {
  const text = input.toLowerCase()
  let score = 1
  if (/(ai|machine learning|integration|payment|gateway|real[- ]?time|api|microservice|architecture|security)/.test(text)) score += 2.2
  if (/(mobile|android|ios|dashboard|admin|analytics|role|auth|workflow|multi[- ]?step)/.test(text)) score += 1.4
  if (/(seo|landing|cms|blog|form|ui|ux|branding|hosting|maintenance)/.test(text)) score += 0.8
  return score
}

function weightedSplit(total: number, labels: string[]) {
  if (!labels.length) return [total]
  const weights = labels.map((label) => complexityWeight(label))
  const weightSum = weights.reduce((s, v) => s + v, 0) || 1
  const raw = weights.map((w) => (w / weightSum) * total)
  const rounded = raw.map((v) => Math.floor(v * 100) / 100)
  const delta = Math.round((total - rounded.reduce((s, v) => s + v, 0)) * 100) / 100
  rounded[rounded.length - 1] += delta
  return rounded
}

function wrapText(text: string, maxWidth: number, size: number, font: PDFFont) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ""

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate
    } else {
      if (line) lines.push(line)
      line = word
    }
  }

  if (line) lines.push(line)
  return lines.length ? lines : [""]
}

async function embedLogo(pdf: PDFDocument, url: string): Promise<PDFImage | null> {
  if (!url) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const contentType = response.headers.get("content-type") || ""
    const bytes = new Uint8Array(await response.arrayBuffer())

    if (contentType.includes("png")) return await pdf.embedPng(bytes)
    if (contentType.includes("jpeg") || contentType.includes("jpg")) return await pdf.embedJpg(bytes)

    try {
      return await pdf.embedPng(bytes)
    } catch {
      return await pdf.embedJpg(bytes)
    }
  } catch {
    return null
  }
}

function computeStatus(finalCost: number, paid: number): InvoiceStatus {
  if (paid <= 0) return "unpaid"
  if (paid < finalCost) return "partially_paid"
  return "paid"
}

function clampMoney(value: number) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  return Math.round(value * 100) / 100
}

async function resolveBusinessProfile(): Promise<BusinessProfile> {
  const firestore = getServerFirestore()
  const [methodsSnap, siteSnap] = await Promise.all([
    getDocs(query(collection(firestore, "contact_methods"))),
    getDoc(doc(firestore, "settings", "site")),
  ])

  const methods = methodsSnap.docs
    .map((item) => item.data() as Record<string, unknown>)
    .filter((item) => item.active !== false)

  const pick = (name: string) =>
    String(
      methods.find((item) => String(item.platform || "").toLowerCase() === name.toLowerCase())?.value || ""
    ).trim()

  const site = siteSnap.exists() ? (siteSnap.data() as Record<string, unknown>) : {}
  const branding = (site.branding || {}) as Record<string, unknown>

  return {
    phone: pick("Phone") || pick("WhatsApp") || String(site.phone || "").trim(),
    email: pick("Email") || String(site.email || "").trim(),
    logoUrl: resolveFirebaseImageUrl(String(branding.logo || "")),
    mpesa: pick("M-Pesa") || pick("Phone") || pick("WhatsApp"),
    bankTransfer: pick("Bank") || pick("Bank Transfer"),
    paypal: pick("PayPal"),
  }
}

async function buildInvoicePdf(
  invoice: InvoiceRecord,
  request: ProjectRequestRecord,
  business: BusinessProfile,
  currency: "USD" | "KES",
  finalAgreedCost: number,
  amountPaid: number,
  commitmentRequired: number,
  commitmentPaid: number
) {
  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const logo = await embedLogo(pdf, business.logoUrl)

  const pageWidth = 595
  const pageHeight = 842
  const margin = 40
  const contentWidth = pageWidth - margin * 2

  let page = pdf.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  const drawHeader = () => {
    const headerTop = y
    let logoWidth = 0
    const targetLogoHeight = 34

    if (logo) {
      const scale = targetLogoHeight / logo.height
      logoWidth = logo.width * scale
      page.drawImage(logo, {
        x: margin,
        y: headerTop - targetLogoHeight + 2,
        width: logoWidth,
        height: targetLogoHeight,
      })

      page.drawImage(logo, {
        x: pageWidth / 2 - 140,
        y: pageHeight / 2 - 140,
        width: 280,
        height: 280,
        opacity: 0.06,
      })
    }

    const brandX = margin + (logoWidth ? logoWidth + 12 : 0)
    page.drawText("SallifyTechs", {
      x: brandX,
      y: headerTop - 10,
      size: 16,
      font: bold,
      color: rgb(0.09, 0.12, 0.18),
    })
    page.drawText("Software Development Invoice", {
      x: brandX,
      y: headerTop - 24,
      size: 8.5,
      font: regular,
      color: rgb(0.35, 0.38, 0.44),
    })

    const rightX = pageWidth - margin - 190
    page.drawText(`Invoice #: ${invoice.invoice_number || "-"}`, { x: rightX, y: headerTop - 10, size: 9.5, font: bold })
    page.drawText(`Invoice Date: ${toDateLabel(invoice.invoice_date)}`, { x: rightX, y: headerTop - 22, size: 8.5, font: regular })
    page.drawText(`Due Date: ${toDateLabel(invoice.due_date)}`, { x: rightX, y: headerTop - 34, size: 8.5, font: regular })

    const headerHeight = 46
    y = headerTop - headerHeight
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.86, 0.88, 0.92) })
    y -= 20
  }

  const ensureSpace = (needed: number) => {
    if (y - needed >= margin + 70) return
    page = pdf.addPage([pageWidth, pageHeight])
    y = pageHeight - margin
    drawHeader()
  }

  const drawSectionTitle = (title: string) => {
    ensureSpace(24)
    page.drawText(title, {
      x: margin,
      y,
      size: 12,
      font: bold,
      color: rgb(0.1, 0.12, 0.18),
    })
    y -= 16
  }

  const drawLabelValue = (label: string, value: string) => {
    const lines = wrapText(value || "-", contentWidth - 170, 9, regular)
    ensureSpace(lines.length * 12 + 8)
    page.drawText(label, { x: margin, y, size: 9, font: bold, color: rgb(0.2, 0.22, 0.28) })
    lines.forEach((line, idx) => {
      page.drawText(line, { x: margin + 160, y: y - idx * 12, size: 9, font: regular, color: rgb(0.22, 0.25, 0.3) })
    })
    y -= lines.length * 12 + 4
  }

  const fullName = request.client_info?.name || invoice.client_name || "-"
  const clientCompany = request.client_info?.company || "-"
  const clientEmail = request.client_info?.email || "-"
  const clientPhone = request.client_info?.phone || "-"
  const clientAddress = request.client_info?.address || "-"

  const projectType = request.project_overview?.type || "-"
  const projectDescription = request.requirements?.description || request.project_overview?.summary || "-"
  const selectedFeatures = request.requirements?.features || []
  const timeline = [request.budget?.start_date || "", request.budget?.deadline || ""].filter(Boolean).join(" -> ") || "-"
  const hostingRequirement = request.preferences?.hosting ? "Required" : "Not requested"
  const maintenancePlan = request.preferences?.maintenance ? "Selected" : "Not selected"

  const serviceRows = [
    {
      name: projectType || "Software Development Service",
      description: request.project_overview?.summary || "Core implementation and delivery",
    },
    ...selectedFeatures.map((feature) => ({
      name: feature,
      description: `Feature implementation: ${feature}`,
    })),
  ]

  const budgetRangeLower = String(request.budget?.range || "").toLowerCase()
  const budgetMultiplier = budgetRangeLower.includes("under") ? 0.9 : budgetRangeLower.includes("5000") ? 1.15 : 1
  const adjustedTotal = Math.round(finalAgreedCost * budgetMultiplier * 100) / 100
  const amounts = weightedSplit(
    adjustedTotal,
    serviceRows.map((row) => `${row.name} ${row.description}`)
  )

  const taxEnabled = process.env.INVOICE_TAX_ENABLED === "true"
  const taxRate = Number(process.env.INVOICE_TAX_RATE || 0.16)
  const subtotal = amounts.reduce((sum, amount) => sum + amount, 0)
  const tax = taxEnabled ? subtotal * taxRate : 0
  const grandTotal = subtotal + tax
  const remainingBalance = Math.max(0, grandTotal - amountPaid)
  const paymentStatus = computeStatus(grandTotal, amountPaid)

  drawHeader()

  drawSectionTitle("Business Details")
  drawLabelValue("Business", "SallifyTechs")
  drawLabelValue("Owner", "Sallifan Nyagaka")
  drawLabelValue("Phone", business.phone || "-")
  drawLabelValue("Email", business.email || "-")
  drawLabelValue("Country", "Kenya")
  y -= 8

  drawSectionTitle("Client Details")
  drawLabelValue("Full Name", fullName)
  drawLabelValue("Company Name", clientCompany)
  drawLabelValue("Email", clientEmail)
  drawLabelValue("Phone", clientPhone)
  drawLabelValue("Address", clientAddress)
  y -= 8

  drawSectionTitle("Project Details")
  drawLabelValue("Project Type", projectType)
  drawLabelValue("Project Description", projectDescription)
  drawLabelValue("Selected Features", selectedFeatures.length ? selectedFeatures.join(", ") : "-")
  drawLabelValue("Timeline", timeline)
  drawLabelValue("Hosting Requirement", hostingRequirement)
  drawLabelValue("Maintenance Plan", maintenancePlan)
  y -= 8

  drawSectionTitle(`Pricing (${currency})`)
  ensureSpace(24)
  const tableX = margin
  const colService = 150
  const colDesc = 280

  page.drawRectangle({ x: tableX, y: y - 16, width: contentWidth, height: 16, color: rgb(0.12, 0.16, 0.22) })
  page.drawText("Service", { x: tableX + 6, y: y - 12, size: 8.5, font: bold, color: rgb(1, 1, 1) })
  page.drawText("Description", { x: tableX + colService + 6, y: y - 12, size: 8.5, font: bold, color: rgb(1, 1, 1) })
  page.drawText("Amount", { x: tableX + colService + colDesc + 6, y: y - 12, size: 8.5, font: bold, color: rgb(1, 1, 1) })
  y -= 16

  serviceRows.forEach((row, index) => {
    const amount = amounts[index] || 0
    const descLines = wrapText(row.description || "-", colDesc - 10, 8.5, regular)
    const rowHeight = Math.max(16, descLines.length * 11 + 6)
    ensureSpace(rowHeight + 2)

    const bg = index % 2 === 0 ? rgb(1, 1, 1) : rgb(0.97, 0.98, 0.99)
    page.drawRectangle({ x: tableX, y: y - rowHeight, width: contentWidth, height: rowHeight, color: bg })
    page.drawRectangle({ x: tableX, y: y - rowHeight, width: contentWidth, height: rowHeight, borderWidth: 0.5, borderColor: rgb(0.86, 0.88, 0.92) })

    page.drawText(row.name, { x: tableX + 6, y: y - 11, size: 8.5, font: regular, color: rgb(0.2, 0.22, 0.28) })
    descLines.forEach((line, i) => {
      page.drawText(line, { x: tableX + colService + 6, y: y - 11 - i * 10, size: 8.5, font: regular, color: rgb(0.2, 0.22, 0.28) })
    })
    page.drawText(formatCurrency(amount, currency), {
      x: tableX + colService + colDesc + 6,
      y: y - 11,
      size: 8.5,
      font: regular,
      color: rgb(0.2, 0.22, 0.28),
    })

    y -= rowHeight
  })

  ensureSpace(120)
  const totalsX = margin + contentWidth - 220
  page.drawText(`Subtotal: ${formatCurrency(subtotal, currency)}`, { x: totalsX, y: y - 16, size: 10, font: regular })
  page.drawText(`Tax${taxEnabled ? ` (${Math.round(taxRate * 100)}%)` : " (0%)"}: ${formatCurrency(tax, currency)}`, {
    x: totalsX,
    y: y - 30,
    size: 10,
    font: regular,
  })
  page.drawText(`Grand Total: ${formatCurrency(grandTotal, currency)}`, {
    x: totalsX,
    y: y - 48,
    size: 12,
    font: bold,
    color: rgb(0.08, 0.1, 0.14),
  })
  page.drawText(`Commitment Fee (${invoice.commitment_required_percent || 25}%): ${formatCurrency(commitmentRequired, currency)}`, {
    x: totalsX,
    y: y - 64,
    size: 10,
    font: bold,
    color: rgb(0.12, 0.2, 0.32),
  })
  page.drawText(`Commitment Paid: ${formatCurrency(commitmentPaid, currency)}`, {
    x: totalsX,
    y: y - 78,
    size: 9.5,
    font: regular,
    color: commitmentPaid >= commitmentRequired ? rgb(0.08, 0.42, 0.22) : rgb(0.62, 0.42, 0.06),
  })
  page.drawText(`Amount Paid So Far: ${formatCurrency(amountPaid, currency)}`, {
    x: totalsX,
    y: y - 92,
    size: 9.5,
    font: regular,
    color: rgb(0.2, 0.22, 0.28),
  })
  page.drawText(`Remaining Balance: ${formatCurrency(remainingBalance, currency)}`, {
    x: totalsX,
    y: y - 106,
    size: 9.5,
    font: regular,
    color: rgb(0.2, 0.22, 0.28),
  })
  page.drawText(`Payment Status: ${paymentStatus}`, {
    x: totalsX,
    y: y - 120,
    size: 9.5,
    font: bold,
    color: paymentStatus === "paid" ? rgb(0.08, 0.42, 0.22) : paymentStatus === "partially_paid" ? rgb(0.62, 0.42, 0.06) : rgb(0.63, 0.17, 0.16),
  })
  y -= 132

  drawSectionTitle("Payment Terms")
  drawLabelValue("Terms", "50% deposit before project start")
  drawLabelValue("Completion", "50% after project completion")
  drawLabelValue("Due", "Payment due within 7 days")
  drawLabelValue("Late Fee", "Late payments may attract a 5% fee after 14 days")
  drawLabelValue("Commitment", `Project cannot start without commitment fee (${invoice.commitment_required_percent || 25}%) payment`)
  y -= 8

  drawSectionTitle("Payment Methods")
  drawLabelValue("M-Pesa", business.mpesa || "Available on request")
  drawLabelValue("Bank Transfer", business.bankTransfer || "Available on request")
  drawLabelValue("PayPal", business.paypal || "Available for international clients on request")
  drawLabelValue("Notes", invoice.notes || "-")
  y -= 8

  ensureSpace(90)
  page.drawLine({ start: { x: margin, y: y - 10 }, end: { x: pageWidth - margin, y: y - 10 }, thickness: 1, color: rgb(0.86, 0.88, 0.92) })
  y -= 26
  page.drawText("Thank you for choosing SallifyTechs.", { x: margin, y, size: 10, font: bold })
  y -= 16
  page.drawText("Digital Signature: ______________________________", { x: margin, y, size: 9, font: regular })
  y -= 14
  page.drawText("This is a system-generated invoice and does not require a physical signature.", {
    x: margin,
    y,
    size: 8.5,
    font: regular,
    color: rgb(0.36, 0.38, 0.45),
  })

  if (logo) {
    const footerLogo = logo.scale(0.12)
    page.drawImage(logo, {
      x: pageWidth - margin - footerLogo.width,
      y: 28,
      width: footerLogo.width,
      height: footerLogo.height,
      opacity: 0.9,
    })
  }

  return {
    bytes: await pdf.save(),
    subtotal,
    tax,
    grandTotal,
    commitmentRequired,
    commitmentPaid,
    amountPaid,
    remainingBalance,
    paymentStatus,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { invoiceId?: string }
    const invoiceId = String(body.invoiceId || "").trim()

    if (!invoiceId) {
      return NextResponse.json({ ok: false, error: "invoiceId is required" }, { status: 400 })
    }

    const firestore = getServerFirestore()
    const invoiceRef = doc(firestore, "invoices", invoiceId)
    const invoiceSnap = await getDoc(invoiceRef)

    if (!invoiceSnap.exists()) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 })
    }

    const invoice = { id: invoiceSnap.id, ...(invoiceSnap.data() as InvoiceRecord) }
    const requestId = String(invoice.request_id || "")
    const requestSnap = requestId ? await getDoc(doc(firestore, "project_requests", requestId)) : null
    const requestData = (requestSnap?.exists() ? requestSnap.data() : {}) as ProjectRequestRecord
    const clientEmail = String(requestData.client_info?.email || "").trim()

    if (!clientEmail) {
      return NextResponse.json(
        { ok: false, error: "Client email not found on linked project request" },
        { status: 400 }
      )
    }

    const invoiceDate = invoice.invoice_date || toDateISO(new Date())
    const dueDate = invoice.due_date || toDateISO(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    const invoiceNumber = invoice.invoice_number || (await generateSequentialInvoiceNumber(firestore))

    const currency = normalizeCurrency(invoice.currency || requestData.budget?.currency)
    let exchangeRate = Number(invoice.exchange_rate_usd_kes || 0)
    if (!exchangeRate || exchangeRate <= 0) {
      const ratePayload = await getUsdToKesRate()
      exchangeRate = ratePayload.rate
    }

    let finalAgreedCost = clampMoney(Number(invoice.final_agreed_cost || 0))
    if (finalAgreedCost <= 0) {
      const base = clampMoney(Number(invoice.amount || 0))
      finalAgreedCost = currency === "KES" ? clampMoney(base * exchangeRate) : base
    }

    const amountPaid = clampMoney(Number(invoice.amount_paid || 0))
    const commitmentPercent = Number(invoice.commitment_required_percent || 25) > 0 ? Number(invoice.commitment_required_percent || 25) : 25
    const commitmentRequired = clampMoney(Number(invoice.commitment_required_amount || finalAgreedCost * (commitmentPercent / 100)))
    const commitmentPaid = clampMoney(Number(invoice.commitment_paid_amount || 0))

    if (amountPaid > finalAgreedCost * 1.5) {
      return NextResponse.json({ ok: false, error: "Amount paid exceeds allowed threshold" }, { status: 400 })
    }

    await updateDoc(invoiceRef, {
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate,
      currency,
      exchange_rate_usd_kes: exchangeRate,
      final_agreed_cost: finalAgreedCost,
      amount_paid: amountPaid,
      commitment_required_percent: commitmentPercent,
      commitment_required_amount: commitmentRequired,
      commitment_paid_amount: commitmentPaid,
      commitment_paid: commitmentPaid >= commitmentRequired && commitmentRequired > 0,
      delivery_status: "processing",
      delivery_error: "",
      updated_at: serverTimestamp(),
    })

    const business = await resolveBusinessProfile()
    const pdfResult = await buildInvoicePdf(
      {
        ...invoice,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        currency,
        final_agreed_cost: finalAgreedCost,
        amount_paid: amountPaid,
        commitment_required_percent: commitmentPercent,
        commitment_required_amount: commitmentRequired,
        commitment_paid_amount: commitmentPaid,
      },
      requestData,
      business,
      currency,
      finalAgreedCost,
      amountPaid,
      commitmentRequired,
      commitmentPaid
    )

    const fileName = `${sanitizePart(requestData.client_info?.name || "client")}_${sanitizePart(requestData.project_overview?.title || invoice.project_name || "project")}_${sanitizePart(invoiceNumber)}.pdf`
    const storagePath = `invoices/${invoiceId}/${fileName}`
    const pdfUrl = await uploadPdfAndGetUrl(storagePath, new Uint8Array(pdfResult.bytes))

    const host = process.env.SMTP_HOST || ""
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER || ""
    const pass = process.env.SMTP_PASS || ""
    const from = process.env.SMTP_FROM || `Sallify Technologies <${user}>`
    if (!host || !user || !pass) {
      throw new Error("SMTP environment variables are not configured")
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    await transporter.sendMail({
      from,
      to: clientEmail,
      subject: `Invoice ${invoiceNumber} - ${invoice.project_name || requestData.project_overview?.title || "Project"}`,
      text: [
        `Hi ${requestData.client_info?.name || invoice.client_name || "Client"},`,
        "",
        `Please find invoice ${invoiceNumber} attached.`,
        `Grand Total: ${formatCurrency(pdfResult.grandTotal, currency)}`,
        `Due Date: ${toDateLabel(dueDate)}`,
        "",
        "Regards,",
        "SallifyTechs",
      ].join("\n"),
      attachments: [
        {
          filename: fileName,
          content: Buffer.from(pdfResult.bytes),
          contentType: "application/pdf",
        },
      ],
    })

    await updateDoc(invoiceRef, {
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate,
      currency,
      exchange_rate_usd_kes: exchangeRate,
      subtotal: pdfResult.subtotal,
      tax: pdfResult.tax,
      grand_total: pdfResult.grandTotal,
      final_agreed_cost: finalAgreedCost,
      amount_paid: pdfResult.amountPaid,
      remaining_balance: pdfResult.remainingBalance,
      payment_status: pdfResult.paymentStatus,
      status: pdfResult.paymentStatus,
      commitment_required_amount: pdfResult.commitmentRequired,
      commitment_paid_amount: pdfResult.commitmentPaid,
      commitment_paid: pdfResult.commitmentPaid >= pdfResult.commitmentRequired && pdfResult.commitmentRequired > 0,
      pdf_url: pdfUrl,
      pdf_storage_path: storagePath,
      delivery_status: "delivered",
      delivery_error: "",
      sent_to: clientEmail,
      sent_at: new Date().toISOString(),
      updated_at: serverTimestamp(),
    })

    return NextResponse.json({ ok: true, pdfUrl, sentTo: clientEmail, invoiceNumber })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invoice delivery failed"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
