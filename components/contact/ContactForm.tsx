"use client"

import { useEffect, useMemo, useState } from "react"
import { addDoc, collection, getDocs, query, serverTimestamp } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { storagePath, uploadFile } from "@/services/storage"

type ContactFormProps = {
  projectTypes?: string[]
  defaultProjectType?: string
  title?: string
  description?: string
  className?: string
}

const inputClass = "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"

function sanitizeSegment(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
}

function ext(name: string) {
  const i = name.lastIndexOf(".")
  return i >= 0 ? name.slice(i) : ""
}

export default function ContactForm({ projectTypes = [], defaultProjectType, title = "Tell Us About Your Project", description = "Provide details so we can give you a practical response.", className = "" }: ContactFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [projectType, setProjectType] = useState(defaultProjectType || "")
  const [projectDescription, setProjectDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [dynamicTypes, setDynamicTypes] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (projectTypes.length) {
      setDynamicTypes(projectTypes)
      return
    }
    let mounted = true
    getDocs(query(collection(firestore, "services"))).then((snapshot) => {
      if (!mounted) return
      const list = snapshot.docs
        .map((d) => String((d.data() as Record<string, unknown>).title || "").trim())
        .filter(Boolean)
      setDynamicTypes(Array.from(new Set(list)).sort((a, b) => a.localeCompare(b)))
    }).catch(() => {})
    return () => { mounted = false }
  }, [projectTypes])

  const options = useMemo(() => {
    const merged = [...dynamicTypes]
    if (defaultProjectType && !merged.includes(defaultProjectType)) merged.unshift(defaultProjectType)
    return Array.from(new Set(merged))
  }, [dynamicTypes, defaultProjectType])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuccess("")
    setError("")
    if (!name.trim() || !email.trim() || !projectType.trim() || !projectDescription.trim()) {
      setError("Please complete all required fields.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please provide a valid email address.")
      return
    }
    setSubmitting(true)
    try {
      let fileUrl = ""
      if (file) {
        const renamed = `${sanitizeSegment(name)}_${sanitizeSegment(email)}_${Date.now()}${ext(file.name)}`
        fileUrl = await uploadFile(file, storagePath("media/contact-submissions", renamed))
      }
      await addDoc(collection(firestore, "contact_submissions"), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || "",
        project_type: projectType.trim(),
        project_description: projectDescription.trim(),
        file_url: fileUrl,
        submitted_at: serverTimestamp(),
        status: "pending",
      })
      setName("")
      setEmail("")
      setPhone("")
      setProjectType(defaultProjectType || "")
      setProjectDescription("")
      setFile(null)
      setSuccess("Thanks. Your project request has been submitted successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={`rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm sm:p-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-[var(--color-heading)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-body)]">{description}</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4" aria-label="Project contact form">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[var(--color-subheading)]">Name *<input className={`${inputClass} mt-2`} value={name} onChange={(e)=>setName(e.target.value)} required /></label>
          <label className="text-sm font-medium text-[var(--color-subheading)]">Email *<input type="email" className={`${inputClass} mt-2`} value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[var(--color-subheading)]">Phone (optional)<input className={`${inputClass} mt-2`} value={phone} onChange={(e)=>setPhone(e.target.value)} /></label>
          <label className="text-sm font-medium text-[var(--color-subheading)]">Project Type / Service *
            <select className={`${inputClass} mt-2`} value={projectType} onChange={(e)=>setProjectType(e.target.value)} required>
              <option value="">Select a service</option>
              {options.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium text-[var(--color-subheading)]">Project Description / Expectations *
          <textarea className={`${inputClass} mt-2 min-h-[140px]`} value={projectDescription} onChange={(e)=>setProjectDescription(e.target.value)} required />
        </label>
        <label className="block text-sm font-medium text-[var(--color-subheading)]">File Upload (optional)
          <input type="file" className="mt-2 block w-full text-sm text-[var(--color-body)]" onChange={(e)=>setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip" />
        </label>
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60">{submitting ? "Submitting..." : "Submit Project Request"}</button>
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </section>
  )
}
