import { NextRequest, NextResponse } from "next/server"
import { addDoc, collection } from "firebase/firestore"
import { getServerFirestore } from "@/lib/server/firebase-server"

export const runtime = "nodejs"

function getVerifyToken() {
  return process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || ""
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode")
  const token = request.nextUrl.searchParams.get("hub.verify_token")
  const challenge = request.nextUrl.searchParams.get("hub.challenge")

  if (mode === "subscribe" && token && token === getVerifyToken() && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Record<string, unknown>

    // Keep this lightweight: acknowledge first and log best-effort.
    try {
      const firestore = getServerFirestore()
      await addDoc(collection(firestore, "whatsapp_webhook_events"), {
        payload,
        received_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.error("Failed to store WhatsApp webhook payload", logError)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Invalid WhatsApp webhook payload", error)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}

