"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { firestore } from "@/lib/firebase"

const inputClass = "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"

export default function TestimonialForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [content, setContent] = useState("")
  const [rating, setRating] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!name.trim() || !email.trim() || !content.trim()) {
      setError("Name, email, and testimonial are required.")
      return
    }

    const normalizedRating = rating ? Number(rating) : undefined
    if (normalizedRating && (normalizedRating < 1 || normalizedRating > 5)) {
      setError("Rating must be between 1 and 5.")
      return
    }

    setSubmitting(true)
    try {
      await addDoc(collection(firestore, "testimonial_submissions"), {
        name: name.trim(),
        email: email.trim(),
        content: content.trim(),
        rating: normalizedRating,
        submitted_at: serverTimestamp(),
        approved: false,
        reviewed: false,
      })

      setName("")
      setEmail("")
      setContent("")
      setRating("")
      setMessage("Thanks for sharing your success story. We have received your testimonial.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Share Your Success Story</h2>
      <p className="mt-2 text-sm text-[var(--color-body)]">Tell us about your experience working with Sallify Technologies.</p>
      <form onSubmit={submit} className="mt-5 space-y-4" aria-label="Testimonial submission form">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[var(--color-body)]">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} mt-2`} required />
          </label>
          <label className="text-sm font-medium text-[var(--color-body)]">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} mt-2`} required />
          </label>
        </div>
        <label className="block text-sm font-medium text-[var(--color-body)]">
          Testimonial
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className={`${inputClass} mt-2 min-h-[130px]`} required />
        </label>
        <label className="block text-sm font-medium text-[var(--color-body)]">
          Rating (optional, 1-5)
          <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} className={`${inputClass} mt-2`} />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Testimonial"}
        </button>
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </section>
  )
}
