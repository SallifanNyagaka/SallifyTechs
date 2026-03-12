import type { Metadata } from "next"
import { getRouteMetadata } from "@/lib/seo/route-metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "services",
    "Services | Sallify Techs",
    "Explore web development, mobile, systems, UI/UX, SEO, and growth services from Sallify Techs."
  )
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
