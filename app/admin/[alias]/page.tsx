import { notFound, redirect } from "next/navigation"

const aliasMap: Record<string, string> = {
  home: "/admin/homepage",
  landing: "/admin/homepage",
  blog: "/admin/blogs",
  posts: "/admin/blogs",
  service: "/admin/services",
  services: "/admin/services",
  testimonial: "/admin/testimonials",
  testimonials: "/admin/testimonials",
  contact: "/admin/contacts",
  contacts: "/admin/contacts",
  footer: "/admin/footer",
  footers: "/admin/footer",
  setting: "/admin/settings",
  settings: "/admin/settings",
  config: "/admin/settings",
  asset: "/admin/media",
  assets: "/admin/media",
  media: "/admin/media",
  medium: "/admin/media",
  portfolio: "/admin/portfolio",
  portfolios: "/admin/portfolio",
  process: "/admin/process",
  processes: "/admin/process",
  project: "/admin/project-requests",
  projects: "/admin/project-requests",
  projectlist: "/admin/projects",
  work: "/admin/projects",
  requests: "/admin/project-requests",
  invoice: "/admin/invoices",
  invoices: "/admin/invoices",
  about: "/admin/about",
  homepage: "/admin/homepage",
  dashboard: "/admin",
}

export default async function AdminAliasPage({
  params,
}: {
  params: Promise<{ alias: string }>
}) {
  const { alias } = await params
  const target = aliasMap[alias.toLowerCase()]

  if (!target) {
    notFound()
  }

  redirect(target)
}
