import { NextResponse } from "next/server"
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"
import { getServerFirestore } from "@/lib/server/firebase-server"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

const SYSTEM_PROMPT = `
You are Sallify Technologies' website assistant.
Goals:
- Help visitors understand services, process, portfolio, and how to contact the team.
- Keep answers short, practical, and professional.
- If the user asks for pricing, give ranges and invite them to submit a project request form.
- If unsure, say so clearly and direct them to contact the team.
`.trim()

type CmsContext = {
  generatedAt: string
  site: {
    siteName?: string
    domain?: string
    email?: string
    phone?: string
  }
  contactMethods: Array<{ platform: string; value: string }>
  homepage: {
    heroTitle?: string
    heroSubtitle?: string
    primaryCTA?: string
    secondaryCTA?: string
  }
  about: {
    mission?: string
    vision?: string
    story?: string
    industries?: string[]
    experienceYears?: number
    team: Array<{ name: string; role: string; skills: string[] }>
  }
  services: Array<{
    title: string
    slug: string
    shortDescription: string
    pricingModel?: string
    category?: string
    technologies: string[]
    features: string[]
  }>
  portfolio: Array<{
    title: string
    slug: string
    industry?: string
    clientName?: string
    technologies: string[]
    summary?: string
    liveUrl?: string
  }>
  blogs: Array<{
    title: string
    slug: string
    category?: string
    tags: string[]
    excerpt?: string
  }>
  process: Array<{ stepNumber: number; title: string; description?: string }>
  testimonials: Array<{ name?: string; role?: string; company?: string; message?: string; rating?: number }>
}

let cachedContext: CmsContext | null = null
let cachedAt = 0
const CONTEXT_TTL_MS = 60_000

function toText(value: unknown, fallback = "") {
  return String(value ?? fallback).trim()
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item || "").trim()).filter(Boolean)
}

function clip(value: string, max = 240) {
  if (!value) return ""
  return value.length <= max ? value : `${value.slice(0, max)}...`
}

async function loadContextFromFirestore(): Promise<CmsContext> {
  const firestore = getServerFirestore()

  const [siteSnap, heroSnap, aboutCompanySnap, homepageMainSnap] = await Promise.all([
    getDoc(doc(firestore, "settings", "site")),
    getDoc(doc(firestore, "homepage", "hero")),
    getDoc(doc(firestore, "about", "company")),
    getDoc(doc(firestore, "homepage", "main")),
  ])

  const [
    contactMethodsSnap,
    teamSnap,
    servicesSnap,
    portfolioSnap,
    portfolioProjectsSnap,
    blogsSnap,
    processSnap,
    testimonialsSnap,
  ] = await Promise.all([
    getDocs(query(collection(firestore, "contact_methods"))),
    getDocs(query(collection(firestore, "about", "company", "teamMembers"))),
    getDocs(query(collection(firestore, "services"), orderBy("order", "asc"))),
    getDocs(query(collection(firestore, "portfolio"))),
    getDocs(query(collection(firestore, "portfolio_projects"))),
    getDocs(query(collection(firestore, "blogs"))),
    getDocs(query(collection(firestore, "process"), orderBy("stepNumber", "asc"))),
    getDocs(query(collection(firestore, "testimonials"))),
  ])

  const site = siteSnap.exists() ? (siteSnap.data() as Record<string, unknown>) : {}
  const hero = heroSnap.exists() ? (heroSnap.data() as Record<string, unknown>) : {}
  const aboutCompany = aboutCompanySnap.exists()
    ? (aboutCompanySnap.data() as Record<string, unknown>)
    : {}
  const homepageMain = homepageMainSnap.exists()
    ? (homepageMainSnap.data() as Record<string, unknown>)
    : {}
  const heroMain = (homepageMain.hero || {}) as Record<string, unknown>

  const contactMethods = contactMethodsSnap.docs
    .map((item) => item.data() as Record<string, unknown>)
    .filter((item) => item.active !== false)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .slice(0, 8)
    .map((item) => ({
      platform: toText(item.platform),
      value: toText(item.value),
    }))
    .filter((item) => item.platform && item.value)

  const team = teamSnap.docs
    .map((item) => item.data() as Record<string, unknown>)
    .map((item) => ({
      name: toText(item.name),
      role: toText(item.role),
      skills: toStringArray(item.skills).slice(0, 5),
    }))
    .filter((item) => item.name || item.role)
    .slice(0, 12)

  const services = servicesSnap.docs
    .map((item) => item.data() as Record<string, unknown>)
    .filter((item) => toText(item.status || "published").toLowerCase() !== "draft")
    .map((item) => ({
      title: toText(item.title),
      slug: toText(item.slug),
      shortDescription: clip(toText(item.shortDescription || item.fullDescription), 220),
      pricingModel: toText(item.pricingModel),
      category: toText(item.category),
      technologies: toStringArray(item.technologies).slice(0, 8),
      features: toStringArray(item.features).slice(0, 8),
    }))
    .filter((item) => item.title)

  const combinedPortfolioDocs = [...portfolioProjectsSnap.docs, ...portfolioSnap.docs]
  const portfolio = combinedPortfolioDocs
    .map((item) => item.data() as Record<string, unknown>)
    .map((item) => ({
      title: toText(item.title),
      slug: toText(item.slug),
      industry: toText(item.industry),
      clientName: toText(item.client_name || item.clientName),
      technologies: toStringArray(item.technologies).slice(0, 6),
      summary: clip(toText(item.project_summary || item.projectSummary || item.description), 180),
      liveUrl: toText(item.live_url || item.liveUrl),
    }))
    .filter((item) => item.title)
    .slice(0, 20)

  const blogs = blogsSnap.docs
    .map((item) => item.data() as Record<string, unknown>)
    .filter((item) => toText(item.status || "published").toLowerCase() !== "draft")
    .map((item) => ({
      title: toText(item.title),
      slug: toText(item.slug),
      category: toText(item.category),
      tags: toStringArray(item.tags).slice(0, 8),
      excerpt: clip(toText(item.excerpt || item.summary), 170),
    }))
    .filter((item) => item.title)
    .slice(0, 18)

  const process = processSnap.docs
    .map((item) => item.data() as Record<string, unknown>)
    .map((item) => ({
      stepNumber: Number(item.stepNumber || 0),
      title: toText(item.title),
      description: clip(toText(item.description), 170),
    }))
    .filter((item) => item.title)
    .slice(0, 12)

  const testimonials = testimonialsSnap.docs
    .map((item) => item.data() as Record<string, unknown>)
    .filter((item) => item.approved !== false && toText(item.status || "published") !== "draft")
    .map((item) => ({
      name: toText(item.name),
      role: toText(item.role),
      company: toText(item.company),
      message: clip(toText(item.message || item.content), 180),
      rating: Number(item.rating || 0) || undefined,
    }))
    .filter((item) => item.message)
    .slice(0, 10)

  return {
    generatedAt: new Date().toISOString(),
    site: {
      siteName: toText(site.siteName),
      domain: toText(site.domain),
      email: toText(site.email),
      phone: toText(site.phone),
    },
    contactMethods,
    homepage: {
      heroTitle: toText(heroMain.heading || hero.title),
      heroSubtitle: toText(hero.subtitle),
      primaryCTA: toText((hero.primaryCTA as Record<string, unknown> | undefined)?.label),
      secondaryCTA: toText((hero.secondaryCTA as Record<string, unknown> | undefined)?.label),
    },
    about: {
      mission: clip(toText(aboutCompany.mission), 260),
      vision: clip(toText(aboutCompany.vision), 260),
      story: clip(toText(aboutCompany.story), 320),
      industries: toStringArray(aboutCompany.industries).slice(0, 8),
      experienceYears: Number(aboutCompany.experienceYears || 0) || undefined,
      team,
    },
    services,
    portfolio,
    blogs,
    process,
    testimonials,
  }
}

async function getCmsContext() {
  const now = Date.now()
  if (cachedContext && now - cachedAt < CONTEXT_TTL_MS) {
    return cachedContext
  }

  const context = await loadContextFromFirestore()
  cachedContext = context
  cachedAt = now
  return context
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 }
      )
    }

    const body = (await request.json()) as {
      message?: string
      history?: ChatMessage[]
    }

    const message = body.message?.trim()
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 })
    }

    const history = (body.history ?? []).slice(-8)
    const cmsContext = await getCmsContext()
    const messages = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}

WEBSITE CMS CONTEXT (source of truth from Firestore; use this data first):
${JSON.stringify(cmsContext)}`,
      },
      ...history.map((entry) => ({
        role: entry.role,
        content: entry.content,
      })),
      { role: "user", content: message },
    ]

    const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini"
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
      }),
    })

    if (!openAIResponse.ok) {
      const text = await openAIResponse.text()
      return NextResponse.json({ error: text || "OpenAI request failed." }, { status: 500 })
    }

    const data = (await openAIResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const reply = data.choices?.[0]?.message?.content?.trim()

    return NextResponse.json({ reply: reply || "I can help with services, portfolio, process, or contact details." })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 }
    )
  }
}
