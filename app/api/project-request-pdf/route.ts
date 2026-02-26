import { NextRequest, NextResponse } from "next/server"
import { buildProjectRequestPdf } from "@/lib/server/project-request-pdf"

export const runtime = "nodejs"

function sanitizePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      submission?: Record<string, unknown>
    }

    const submission = body.submission
    if (!submission || typeof submission !== "object") {
      return NextResponse.json({ error: "submission payload is required" }, { status: 400 })
    }

    const id = String(submission.id || "unknown")
    const clientInfo = (submission.client_info || {}) as Record<string, unknown>
    const projectOverview = (submission.project_overview || {}) as Record<string, unknown>
    const userPart = sanitizePart(String(clientInfo.name || "user"))
    const projectPart = sanitizePart(String(projectOverview.title || "project"))
    const fileName = `${userPart}_${projectPart || id}.pdf`
    const pdf = await buildProjectRequestPdf(submission)

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
      { error: error instanceof Error ? error.message : "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
