import { NextRequest, NextResponse } from "next/server"
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore"
import { getServerFirestore } from "@/lib/server/firebase-server"
import { deleteFileAtPath } from "@/lib/server/firebase-storage-server"

export const runtime = "nodejs"

function extractStoragePathFromPdfUrl(url: string) {
  if (!url) return ""
  try {
    const marker = "/o/"
    const markerIndex = url.indexOf(marker)
    if (markerIndex === -1) return ""
    const encoded = url.slice(markerIndex + marker.length).split("?")[0]
    return decodeURIComponent(encoded)
  } catch {
    return ""
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
    const ref = doc(firestore, "invoices", invoiceId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 })
    }

    const data = snap.data() as Record<string, unknown>
    const storagePath =
      String(data.pdf_storage_path || "").trim() ||
      extractStoragePathFromPdfUrl(String(data.pdf_url || ""))

    if (storagePath) {
      try {
        await deleteFileAtPath(storagePath)
      } catch (error) {
        await updateDoc(ref, {
          deletion_warning:
            error instanceof Error ? error.message : "Failed to delete PDF from storage",
        })
      }
    }

    await deleteDoc(ref)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to delete invoice" },
      { status: 500 }
    )
  }
}

