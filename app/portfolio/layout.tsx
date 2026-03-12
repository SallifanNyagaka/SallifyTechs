import type { Metadata } from "next"
import { getRouteMetadata } from "@/lib/seo/route-metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "portfolio",
    "Portfolio | Sallify Techs",
    "See case studies and project outcomes delivered by Sallify Techs across industries."
  )
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children
}
