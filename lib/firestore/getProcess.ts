import { cache } from "react"
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore"
import { firestore } from "@/lib/firebase"

export type ProcessStepRecord = {
  id: string
  stepNumber: number
  title: string
  description: string
  iconUrl: string
  order: number
}

export type ProcessPageHero = {
  title?: string
  description?: string
  backgroundImage?: string
}

export type ProcessWhyBlock = {
  title?: string
  description?: string
}

export type ProcessFaq = {
  id: string
  question: string
  answer: string
  order: number
}

export type ProcessCta = {
  title?: string
  description?: string
}

function normalizeStep(id: string, raw: Record<string, unknown>): ProcessStepRecord {
  return {
    id,
    stepNumber: Number(raw.stepNumber || raw.order || 0),
    title: String(raw.title || ""),
    description: String(raw.description || ""),
    iconUrl: String(raw.iconUrl || raw.icon_url || ""),
    order: Number(raw.order || raw.stepNumber || 0),
  }
}

export const getProcessSteps = cache(async () => {
  const snapshot = await getDocs(query(collection(firestore, "process")))
  return snapshot.docs
    .map((item) => normalizeStep(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => {
      if (a.stepNumber !== b.stepNumber) return a.stepNumber - b.stepNumber
      return a.order - b.order
    })
})

async function getPageDoc<T>(id: string): Promise<T | null> {
  const snap = await getDoc(doc(firestore, "processPage", id))
  return snap.exists() ? (snap.data() as T) : null
}

export const getProcessPageContent = cache(async () => {
  const [hero, why, cta] = await Promise.all([
    getPageDoc<ProcessPageHero>("hero"),
    getPageDoc<ProcessWhyBlock>("why"),
    getPageDoc<ProcessCta>("cta"),
  ])

  const faqSnapshot = await getDocs(query(collection(firestore, "processFaqs")))
  const faqs: ProcessFaq[] = faqSnapshot.docs
    .map((item) => {
      const raw = item.data() as Record<string, unknown>
      return {
        id: item.id,
        question: String(raw.question || ""),
        answer: String(raw.answer || ""),
        order: Number(raw.order || 0),
      }
    })
    .filter((item) => item.question && item.answer)
    .sort((a, b) => a.order - b.order)

  return {
    hero,
    why,
    cta,
    faqs,
  }
})
