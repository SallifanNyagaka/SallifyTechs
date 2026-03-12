import type { Metadata } from "next"
import { getRouteMetadata } from "@/lib/seo/route-metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "testimonials",
    "Testimonials | Sallify Techs",
    "Explore success stories and testimonials from Sallify Techs clients."
  )
}

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
  return children
}
