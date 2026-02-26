import { Buffer } from "node:buffer"
import { randomUUID } from "node:crypto"
import * as admin from "firebase-admin"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

if (!admin.apps.length) {
  admin.initializeApp()
}

const WHATSAPP_CLOUD_ACCESS_TOKEN = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN || ""
const WHATSAPP_CLOUD_PHONE_NUMBER_ID = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID || ""
const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || ""
const WHATSAPP_TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "en_US"
const WHATSAPP_ADMIN_NUMBER = process.env.WHATSAPP_ADMIN_NUMBER || ""

type UnknownRecord = Record<string, unknown>

function sanitizePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return "-"
  if (Array.isArray(value)) return value.length ? value.map((item) => valueToString(item)).join(", ") : "-"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function addSectionRows(
  rows: Array<{ label: string; value: string; section?: boolean }>,
  heading: string,
  data: UnknownRecord | undefined
) {
  rows.push({ label: heading, value: "", section: true })
  if (!data) {
    rows.push({ label: "-", value: "-" })
    return
  }
  for (const [key, value] of Object.entries(data)) {
    rows.push({ label: key.replace(/_/g, " "), value: valueToString(value) })
  }
}

function mapProjectRequestToRows(input: UnknownRecord) {
  const rows: Array<{ label: string; value: string; section?: boolean }> = []
  rows.push({ label: "Submission ID", value: valueToString(input.id) })
  rows.push({ label: "Status", value: valueToString(input.status) })

  addSectionRows(rows, "Client Information", input.client_info as UnknownRecord | undefined)
  addSectionRows(rows, "Project Overview", input.project_overview as UnknownRecord | undefined)
  addSectionRows(rows, "Requirements", input.requirements as UnknownRecord | undefined)
  addSectionRows(rows, "Budget", input.budget as UnknownRecord | undefined)
  addSectionRows(rows, "Preferences", input.preferences as UnknownRecord | undefined)

  const files = (input.files as Array<Record<string, unknown>> | undefined) || []
  rows.push({ label: "Files", value: "", section: true })
  if (!files.length) {
    rows.push({ label: "-", value: "-" })
  } else {
    files.forEach((file, index) => {
      rows.push({
        label: `File ${index + 1}`,
        value: `${valueToString(file.name)} | ${valueToString(file.url)}`,
      })
    })
  }

  return rows
}

type PDFFontLike = {
  widthOfTextAtSize(text: string, size: number): number
}

function wrapText(text: string, maxWidth: number, fontSize: number, font: PDFFontLike) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    const width = font.widthOfTextAtSize(next, fontSize)
    if (width <= maxWidth) {
      current = next
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : [""]
}

async function buildProjectRequestPdf(input: UnknownRecord): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595
  const pageHeight = 842
  const margin = 36
  const labelColWidth = 165
  const valueColWidth = pageWidth - margin * 2 - labelColWidth
  const lineHeight = 12
  const cellPad = 4

  let page = pdf.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  page.drawText("Sallify Technologies - Project Request Summary", {
    x: margin,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0.08, 0.1, 0.14),
  })
  y -= 20
  page.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: margin,
    y,
    size: 9,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.35),
  })
  y -= 20

  const drawHeader = () => {
    page.drawRectangle({
      x: margin,
      y: y - 18,
      width: labelColWidth,
      height: 18,
      color: rgb(0.12, 0.16, 0.22),
    })
    page.drawRectangle({
      x: margin + labelColWidth,
      y: y - 18,
      width: valueColWidth,
      height: 18,
      color: rgb(0.16, 0.2, 0.26),
    })
    page.drawText("Field", { x: margin + cellPad, y: y - 13, size: 9, font: fontBold, color: rgb(1, 1, 1) })
    page.drawText("Value", {
      x: margin + labelColWidth + cellPad,
      y: y - 13,
      size: 9,
      font: fontBold,
      color: rgb(1, 1, 1),
    })
    y -= 18
  }

  drawHeader()
  const rows = mapProjectRequestToRows(input)

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    if (row.section) {
      if (y - 18 < margin) {
        page = pdf.addPage([pageWidth, pageHeight])
        y = pageHeight - margin
        drawHeader()
      }
      page.drawRectangle({
        x: margin,
        y: y - 18,
        width: labelColWidth + valueColWidth,
        height: 18,
        color: rgb(0.9, 0.92, 0.95),
      })
      page.drawText(row.label, {
        x: margin + cellPad,
        y: y - 13,
        size: 9,
        font: fontBold,
        color: rgb(0.08, 0.1, 0.14),
      })
      y -= 18
      continue
    }

    const labelLines = wrapText(row.label, labelColWidth - cellPad * 2, 8.5, fontRegular)
    const valueLines = wrapText(row.value || "-", valueColWidth - cellPad * 2, 8.5, fontRegular)
    const rowHeight = Math.max(labelLines.length, valueLines.length) * lineHeight + cellPad * 2

    if (y - rowHeight < margin) {
      page = pdf.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
      drawHeader()
    }

    const bg = i % 2 === 0 ? rgb(1, 1, 1) : rgb(0.97, 0.98, 0.99)
    page.drawRectangle({ x: margin, y: y - rowHeight, width: labelColWidth, height: rowHeight, color: bg })
    page.drawRectangle({
      x: margin + labelColWidth,
      y: y - rowHeight,
      width: valueColWidth,
      height: rowHeight,
      color: bg,
    })

    page.drawRectangle({
      x: margin,
      y: y - rowHeight,
      width: labelColWidth,
      height: rowHeight,
      borderColor: rgb(0.82, 0.85, 0.9),
      borderWidth: 0.5,
    })
    page.drawRectangle({
      x: margin + labelColWidth,
      y: y - rowHeight,
      width: valueColWidth,
      height: rowHeight,
      borderColor: rgb(0.82, 0.85, 0.9),
      borderWidth: 0.5,
    })

    labelLines.forEach((line, idx) => {
      page.drawText(line, {
        x: margin + cellPad,
        y: y - cellPad - lineHeight * (idx + 1) + 2,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.1, 0.12, 0.16),
      })
    })

    valueLines.forEach((line, idx) => {
      page.drawText(line, {
        x: margin + labelColWidth + cellPad,
        y: y - cellPad - lineHeight * (idx + 1) + 2,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.22, 0.26, 0.32),
      })
    })

    y -= rowHeight
  }

  const bytes = await pdf.save()
  return Buffer.from(bytes)
}

async function sendWhatsappTemplateMessage({
  to,
  clientName,
  serviceType,
  summary,
  pdfUrl,
}: {
  to: string
  clientName: string
  serviceType: string
  summary: string
  pdfUrl: string
}) {
  const payload = {
    messaging_product: "whatsapp",
    to: to.replace(/^\+/, ""),
    type: "template",
    template: {
      name: WHATSAPP_TEMPLATE_NAME,
      language: { code: WHATSAPP_TEMPLATE_LANG || "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", parameter_name: "client_name", text: clientName || "Client" },
            { type: "text", parameter_name: "service_type", text: serviceType || "N/A" },
            {
              type: "text",
              parameter_name: "request_summary",
              text: summary || "New project request received.",
            },
            { type: "text", parameter_name: "pdf_link", text: pdfUrl },
          ],
        },
      ],
    },
  }

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${WHATSAPP_CLOUD_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_CLOUD_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    const details = await response.text().catch(() => "")
    throw new Error(details || "WhatsApp Cloud API template send failed")
  }
}

export async function handleProjectRequestCreated(submissionId: string, data: UnknownRecord) {
  const db = admin.firestore()

  try {
    const clientInfo = (data.client_info || {}) as UnknownRecord
    const projectOverview = (data.project_overview || {}) as UnknownRecord
    const requirements = (data.requirements || {}) as UnknownRecord
    const clientName = String(clientInfo.name || "user")
    const projectTitle = String(projectOverview.title || "project")
    const serviceType = String(projectOverview.type || "N/A")
    const summary = String(requirements.description || projectOverview.summary || "Project request received.")

    const fileName = `${sanitizePart(clientName)}_${sanitizePart(projectTitle)}.pdf`
    const storagePath = `project_requests/${submissionId}/${fileName}`

    const pdfBuffer = await buildProjectRequestPdf({ id: submissionId, ...data })

    const bucket = admin.storage().bucket()
    const file = bucket.file(storagePath)
    const downloadToken = randomUUID()
    await file.save(pdfBuffer, {
      metadata: {
        contentType: "application/pdf",
        cacheControl: "private,max-age=0,no-cache",
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    })

    const encodedPath = encodeURIComponent(storagePath)
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`

    await db.collection("project_requests").doc(submissionId).update({
      pdf_url: downloadUrl,
      pdf_storage_path: storagePath,
      delivery_status: "pdf_ready",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    })

    if (!WHATSAPP_ADMIN_NUMBER) {
      await db.collection("project_requests").doc(submissionId).update({
        delivery_status: "warning",
        delivery_error: "WHATSAPP_ADMIN_NUMBER is not configured",
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.warn("WHATSAPP_ADMIN_NUMBER missing; PDF created but WhatsApp skipped", { submissionId })
      return
    }

    await sendWhatsappTemplateMessage({
      to: WHATSAPP_ADMIN_NUMBER,
      clientName,
      serviceType,
      summary: summary.slice(0, 300),
      pdfUrl: downloadUrl,
    })

    await db.collection("project_requests").doc(submissionId).update({
      delivery_status: "delivered",
      delivery_error: "",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delivery pipeline failed"
    console.error("Project request delivery pipeline failed", { submissionId, error: message })
    await db.collection("project_requests").doc(submissionId).update({
      delivery_status: "failed",
      delivery_error: message,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    })
  }
}
