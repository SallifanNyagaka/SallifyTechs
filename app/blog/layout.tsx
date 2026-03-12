import type { Metadata } from "next"
import { getRouteMetadata } from "@/lib/seo/route-metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "blog",
    "Blog | Sallify Techs",
    "Read insights, playbooks, and technical guides from Sallify Techs."
  )
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
