import type { Metadata } from "next"
import { getRouteMetadata } from "@/lib/seo/route-metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "contact",
    "Contact | Sallify Techs",
    "Start your project with Sallify Techs. Share your requirements and get a response quickly."
  )
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
