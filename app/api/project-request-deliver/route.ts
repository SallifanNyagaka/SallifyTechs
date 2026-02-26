import { doc, getDoc, getDocs, query, collection, updateDoc, serverTimestamp } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { getServerFirestore } from "@/lib/server/firebase-server"
import { uploadPdfAndGetUrl } from "@/lib/server/firebase-storage-server"
import { buildProjectRequestPdf } from "@/lib/server/project-request-pdf"

export const runtime = "nodejs"

type ContactMethod = {
  platform?: string
  value?: string
  active?: boolean
}

function sanitizePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function normalizeWhatsappToE164(input: string) {
  const digits = input.replace(/[^\d+]/g, "")
  if (!digits) return ""
  if (digits.startsWith("+")) return digits
  if (digits.startsWith("00")) return `+${digits.slice(2)}`
  return `+${digits}`
}

async function resolveOwnerWhatsapp(firestore: ReturnType<typeof getServerFirestore>) {
  const methods = await getDocs(query(collection(firestore, "contact_methods")))
  const whatsapp = methods.docs
    .map((item) => item.data() as ContactMethod)
    .find((item) => item.active !== false && String(item.platform || "").toLowerCase() === "whatsapp")

  if (whatsapp?.value) return normalizeWhatsappToE164(String(whatsapp.value))

  const settingsSnap = await getDoc(doc(firestore, "settings", "site"))
  if (!settingsSnap.exists()) return ""
  return normalizeWhatsappToE164(String((settingsSnap.data() as Record<string, unknown>).phone || ""))
}

async function resolveOwnerEmail(firestore: ReturnType<typeof getServerFirestore>) {
  const envRecipient = String(process.env.OWNER_NOTIFICATION_EMAIL || "").trim()
  if (envRecipient) return envRecipient

  const methods = await getDocs(query(collection(firestore, "contact_methods")))
  const emailMethod = methods.docs
    .map((item) => item.data() as ContactMethod)
    .find((item) => item.active !== false && String(item.platform || "").toLowerCase() === "email")

  if (emailMethod?.value) return String(emailMethod.value).trim()

  const settingsSnap = await getDoc(doc(firestore, "settings", "site"))
  if (!settingsSnap.exists()) return ""
  return String((settingsSnap.data() as Record<string, unknown>).email || "").trim()
}

async function sendProjectRequestEmail({
  to,
  clientName,
  clientEmail,
  projectType,
  summary,
  pdfFileName,
  pdfBytes,
}: {
  to: string
  clientName: string
  clientEmail: string
  projectType: string
  summary: string
  pdfFileName: string
  pdfBytes: Uint8Array
}) {
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
    to,
    subject: `New Project Request - ${clientName || "Client"} (${projectType || "N/A"})`,
    text: [
      "A new project request was submitted on Sallify Technologies.",
      "",
      `Client: ${clientName || "-"}`,
      `Client Email: ${clientEmail || "-"}`,
      `Project Type: ${projectType || "-"}`,
      `Summary: ${summary || "-"}`,
      "",
      "The PDF summary is attached.",
    ].join("\n"),
    attachments: [
      {
        filename: pdfFileName,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ],
  })
}

async function sendWhatsappTemplate({
  to,
  clientName,
  projectType,
  pdfUrl,
}: {
  to: string
  clientName: string
  projectType: string
  pdfUrl: string
}) {
  const token = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN || ""
  const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID || ""
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || ""
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANG || "en_US"

  if (!token || !phoneNumberId || !templateName) {
    throw new Error("WhatsApp Cloud API environment variables are not configured")
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`
  const payload = {
    messaging_product: "whatsapp",
    to: to.replace(/^\+/, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: clientName || "Client" },
            { type: "text", text: projectType || "N/A" },
            { type: "text", text: pdfUrl },
          ],
        },
      ],
    },
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => "")
    throw new Error(details || "WhatsApp Cloud template send failed")
  }
}

export async function POST(request: NextRequest) {
  let submissionId = ""
  try {
    const body = (await request.json()) as {
      submissionId?: string
      submission?: Record<string, unknown>
    }
    submissionId = String(body.submissionId || "").trim()
    let submission = body.submission

    if (!submissionId) {
      return NextResponse.json(
        { ok: false, error: "submissionId is required" },
        { status: 400 }
      )
    }

    const firestore = getServerFirestore()
    const submissionRef = doc(firestore, "project_requests", submissionId)

    if (!submission || typeof submission !== "object") {
      const snap = await getDoc(submissionRef)
      if (!snap.exists()) {
        return NextResponse.json({ ok: false, error: "Submission not found" }, { status: 404 })
      }
      submission = snap.data() as Record<string, unknown>
    }

    const currentStatus = String((submission as Record<string, unknown>).delivery_status || "")
    const currentPdf = String((submission as Record<string, unknown>).pdf_url || "")
    if (currentStatus === "delivered" && currentPdf) {
      return NextResponse.json({ ok: true, alreadyDelivered: true, pdfUrl: currentPdf })
    }

    const clientInfo = (submission.client_info || {}) as Record<string, unknown>
    const projectOverview = (submission.project_overview || {}) as Record<string, unknown>
    const clientName = String(clientInfo.name || "client")
    const projectTitle = String(projectOverview.title || "project")
    const projectType = String(projectOverview.type || "N/A")
    const userPart = sanitizePart(clientName || "user")
    const projectPart = sanitizePart(projectTitle || "project")
    const pdfFileName = `${userPart}_${projectPart}.pdf`
    const storagePath = `project_requests/${submissionId}/summary/${pdfFileName}`

    const pdfBytes = await buildProjectRequestPdf({ id: submissionId, ...submission })
    const pdfUrl = await uploadPdfAndGetUrl(storagePath, new Uint8Array(pdfBytes))

    await updateDoc(submissionRef, {
      delivery_status: "processing",
      delivery_error: "",
      updated_at: serverTimestamp(),
    })

    await updateDoc(submissionRef, {
      pdf_url: pdfUrl,
      delivery_status: "pdf_ready",
      updated_at: serverTimestamp(),
    })

    const ownerEmail = await resolveOwnerEmail(firestore)
    if (!ownerEmail) {
      await updateDoc(submissionRef, {
        delivery_status: "warning",
        delivery_error: "No active email found in contact_methods/settings",
        updated_at: serverTimestamp(),
      })
      return NextResponse.json({
        ok: true,
        pdfUrl,
        warning: "PDF generated, but no active email found in contact_methods/settings",
      })
    }

    await sendProjectRequestEmail({
      to: ownerEmail,
      clientName,
      clientEmail: String(clientInfo.email || ""),
      projectType,
      summary: String(
        (submission.requirements as Record<string, unknown> | undefined)?.description ||
          projectOverview.summary ||
          ""
      ),
      pdfFileName,
      pdfBytes: new Uint8Array(pdfBytes),
    })

    const whatsappEnabled = process.env.ENABLE_WHATSAPP_DELIVERY === "true"
    if (whatsappEnabled) {
      const ownerWhatsapp = await resolveOwnerWhatsapp(firestore)
      if (ownerWhatsapp) {
        await sendWhatsappTemplate({
          to: ownerWhatsapp,
          clientName,
          projectType,
          pdfUrl,
        })
      }
    }

    await updateDoc(submissionRef, {
      delivery_status: "delivered",
      delivery_error: "",
      updated_at: serverTimestamp(),
    })

    return NextResponse.json({ ok: true, pdfUrl, notificationSent: true, channel: "email" })
  } catch (error) {
    if (submissionId) {
      try {
        const firestore = getServerFirestore()
        await updateDoc(doc(firestore, "project_requests", submissionId), {
          delivery_status: "failed",
          delivery_error: error instanceof Error ? error.message : "Delivery pipeline failed",
          updated_at: serverTimestamp(),
        })
      } catch {
        // ignore update failure
      }
    }
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Delivery pipeline failed",
      },
      { status: 500 }
    )
  }
}
