import { collection, doc, getDoc, getDocs, query } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { getServerFirestore } from "@/lib/server/firebase-server"

export const runtime = "nodejs"

type ContactMethod = {
  platform?: string
  value?: string
  active?: boolean
}

function normalizeWhatsappToE164(input: string) {
  const digits = input.replace(/[^\d+]/g, "")
  if (!digits) return ""
  if (digits.startsWith("+")) return digits
  if (digits.startsWith("00")) return `+${digits.slice(2)}`
  return `+${digits}`
}

function getBaseUrl(request: NextRequest) {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (envBase) return envBase.replace(/\/$/, "")
  const host = request.headers.get("host")
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  return host ? `${protocol}://${host}` : ""
}

async function resolveOwnerWhatsapp(firestore: ReturnType<typeof getServerFirestore>) {
  const methods = await getDocs(query(collection(firestore, "contact_methods")))
  const whatsapp = methods.docs
    .map((item) => item.data() as ContactMethod)
    .find((item) => item.active !== false && String(item.platform || "").toLowerCase() === "whatsapp")
  if (whatsapp?.value) {
    return normalizeWhatsappToE164(String(whatsapp.value))
  }

  const settingsSnap = await getDoc(doc(firestore, "settings", "site"))
  if (!settingsSnap.exists()) return ""
  const phone = String((settingsSnap.data() as Record<string, unknown>).phone || "")
  return normalizeWhatsappToE164(phone)
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { submissionId?: string }
    const submissionId = String(body.submissionId || "").trim()
    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 })
    }

    const firestore = getServerFirestore()
    const submissionSnap = await getDoc(doc(firestore, "project_requests", submissionId))
    if (!submissionSnap.exists()) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const data = submissionSnap.data() as Record<string, unknown>
    const title = String((data.project_overview as Record<string, unknown> | undefined)?.title || "Project Request")
    const projectType = String((data.project_overview as Record<string, unknown> | undefined)?.type || "N/A")
    const clientName = String((data.client_info as Record<string, unknown> | undefined)?.name || "Client")

    const accountSid = process.env.TWILIO_ACCOUNT_SID || ""
    const authToken = process.env.TWILIO_AUTH_TOKEN || ""
    const from = process.env.TWILIO_WHATSAPP_FROM || ""

    if (!accountSid || !authToken || !from) {
      return NextResponse.json(
        {
          ok: false,
          error: "Twilio WhatsApp environment variables are not configured",
        },
        { status: 500 }
      )
    }

    const ownerWhatsapp = await resolveOwnerWhatsapp(firestore)
    if (!ownerWhatsapp) {
      return NextResponse.json(
        { ok: false, error: "No active WhatsApp number found in contact_methods" },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl(request)
    if (!baseUrl) {
      return NextResponse.json({ ok: false, error: "Unable to resolve site base URL" }, { status: 500 })
    }

    const pdfUrl = `${baseUrl}/api/project-request-pdf/${submissionId}`
    const messageBody =
      `New project request received.\n` +
      `Client: ${clientName}\n` +
      `Project: ${title}\n` +
      `Type: ${projectType}\n` +
      `PDF: ${pdfUrl}`

    const client = twilio(accountSid, authToken)
    const fromValue = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`
    const toValue = `whatsapp:${ownerWhatsapp}`

    try {
      await client.messages.create({
        from: fromValue,
        to: toValue,
        body: messageBody,
        mediaUrl: [pdfUrl],
      })

      return NextResponse.json({ ok: true, mode: "media" })
    } catch (mediaError) {
      // Fallback for environments where media fetch is blocked/unreachable.
      await client.messages.create({
        from: fromValue,
        to: toValue,
        body: `${messageBody}\n(Attachment delivery failed, use the PDF link above.)`,
      })

      return NextResponse.json({
        ok: true,
        mode: "text-fallback",
        warning:
          mediaError instanceof Error
            ? mediaError.message
            : "Media send failed; sent text fallback.",
      })
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to send WhatsApp notification" },
      { status: 500 }
    )
  }
}
