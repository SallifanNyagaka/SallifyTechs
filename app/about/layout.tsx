import type { Metadata } from "next"
import { getRouteMetadata } from "@/lib/seo/route-metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "about",
    "About Sallify Techs",
    "Learn how Sallify Techs delivers web, mobile, design, and growth outcomes for clients."
  )
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
