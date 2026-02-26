import { doc, getDoc } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"
import { getServerFirestore } from "@/lib/server/firebase-server"
import { buildProjectRequestPdf } from "@/lib/server/project-request-pdf"

export const runtime = "nodejs"

function sanitizePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const firestore = getServerFirestore()
    const snap = await getDoc(doc(firestore, "project_requests", id))
    if (!snap.exists()) {
      return NextResponse.json({ error: "Project request not found" }, { status: 404 })
    }

    const payload: Record<string, unknown> & { id: string } = {
      id: snap.id,
      ...(snap.data() as Record<string, unknown>),
    }
    const clientInfo = (payload.client_info || {}) as Record<string, unknown>
    const projectOverview = (payload.project_overview || {}) as Record<string, unknown>
    const userPart = sanitizePart(String(clientInfo.name || "user"))
    const projectPart = sanitizePart(String(projectOverview.title || "project"))
    const fileName = `${userPart}_${projectPart || id}.pdf`
    const pdf = await buildProjectRequestPdf(payload)

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 }
    )
  }
}
