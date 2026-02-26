import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

type StatusType = "pending" | "reviewed"

type Payload = {
  name?: string
  email?: string
  status?: StatusType
  projectType?: string
}

function buildMessage(payload: Required<Pick<Payload, "name" | "status">> & { projectType?: string }) {
  const subject =
    payload.status === "reviewed"
      ? "Your Sallify project request has been reviewed"
      : "Your Sallify project request is pending review"

  const body =
    payload.status === "reviewed"
      ? `Hi ${payload.name},\n\nYour project request${payload.projectType ? ` for ${payload.projectType}` : ""} has now been reviewed by our team. We will follow up with the next steps shortly.\n\nRegards,\nSallify Technologies`
      : `Hi ${payload.name},\n\nYour project request${payload.projectType ? ` for ${payload.projectType}` : ""} is currently pending review. Our team will review it and get back to you soon.\n\nRegards,\nSallify Technologies`

  return { subject, body }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload

    if (!payload.email || !payload.name || !payload.status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = process.env.SMTP_FROM || `Sallify Technologies <${user}>`

    if (!host || !user || !pass) {
      return NextResponse.json(
        { error: "SMTP environment variables are not configured" },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    })

    const { subject, body } = buildMessage({
      name: payload.name,
      status: payload.status,
      projectType: payload.projectType,
    })

    await transporter.sendMail({
      from,
      to: payload.email,
      subject,
      text: body,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    )
  }
}
