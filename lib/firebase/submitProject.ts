import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { sanitizeFileName, uploadFile } from "@/lib/firebase/uploadFile"

export type UploadedProjectFile = {
  name: string
  type: string
  size: number
  url: string
  path: string
}

export type SubmitProjectResult = {
  submissionId: string
}

export type ProjectRequestPayload = {
  client_info: {
    name: string
    email: string
    phone: string
    company: string
    country: string
    timezone: string
  }
  project_overview: {
    title: string
    type: string
    service_id: string
    summary: string
    is_redesign: boolean
  }
  requirements: {
    description: string
    features: string[]
    target_audience: string
    goals: string
    examples: string
    has_branding: boolean
    website_pages?: number
    website_needs_cms?: boolean
    mobile_platform?: "android" | "ios" | "both" | ""
    system_integrations?: string
  }
  budget: {
    range: string
    currency: "KES" | "USD"
    start_date: string
    deadline: string
    flexible: boolean
    urgent: boolean
    custom_amount?: string
  }
  preferences: {
    style: string
    branding: boolean
    hosting: boolean
    maintenance: boolean
    seo: boolean
    accessibility: string
  }
  communication_preference: string
  agreements: {
    complexity_timeline: boolean
    provide_materials: boolean
    pricing_varies: boolean
  }
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as T
  }

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item === undefined) continue
      output[key] = stripUndefinedDeep(item)
    }
    return output as T
  }

  return value
}

export async function submitProjectRequest(
  payload: ProjectRequestPayload,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<SubmitProjectResult> {
  const cleanPayload = stripUndefinedDeep(payload)

  const baseDoc = await addDoc(collection(firestore, "project_requests"), {
    ...cleanPayload,
    files: [],
    status: "pending",
    delivery_status: "queued",
    delivery_error: "",
    pdf_url: "",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  const submissionId = baseDoc.id
  const uploadedFiles: UploadedProjectFile[] = []

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    const safeName = sanitizeFileName(file.name)
    const path = `project_requests/${submissionId}/files/${Date.now()}-${index + 1}-${safeName}`

    const url = await uploadFile(file, path, (fileProgress) => {
      if (!onProgress) return
      const completedRatio = index / files.length
      const currentRatio = (fileProgress / 100) * (1 / files.length)
      onProgress(Math.round((completedRatio + currentRatio) * 100))
    })

    uploadedFiles.push({
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      path,
    })
  }

  await updateDoc(doc(firestore, "project_requests", submissionId), {
    files: uploadedFiles,
    updated_at: serverTimestamp(),
  })

  // Fire-and-forget fallback pipeline so delivery can still happen
  // even when Cloud Function triggers are unavailable.
  void fetch("/api/project-request-deliver", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submissionId }),
  }).catch(() => undefined)

  onProgress?.(100)

  return {
    submissionId,
  }
}
