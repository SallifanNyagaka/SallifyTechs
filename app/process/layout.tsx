import type { Metadata } from "next"
import { getRouteMetadata } from "@/lib/seo/route-metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "process",
    "Our Process | Sallify Techs",
    "Understand the delivery workflow Sallify Techs uses from discovery to maintenance."
  )
}

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return children
}
