export type ServiceOption = {
  id: string
  label: string
  category?: string
}

export type ProjectFormValues = {
  client_info: {
    name: string
    email: string
    phone: string
    company: string
    country: string
    timezone: string
  }
  communication_preference: "WhatsApp" | "Email" | "Phone" | "Video Call" | ""
  project_overview: {
    title: string
    type: string
    service_id: string
    summary: string
    is_redesign: "new" | "redesign" | ""
  }
  requirements: {
    description: string
    features: string[]
    target_audience: string
    goals: string
    examples: string
    has_branding: "yes" | "no" | ""
    website_pages?: number
    website_needs_cms?: "yes" | "no" | ""
    mobile_platform?: "android" | "ios" | "both" | ""
    system_integrations?: string
  }
  budget: {
    range: "under_500" | "500_1500" | "1500_5000" | "5000_plus" | "custom" | ""
    currency: "KES" | "USD"
    start_date: string
    deadline: string
    flexible: "yes" | "no" | ""
    urgent: "yes" | "no" | ""
    custom_amount?: string
  }
  preferences: {
    style: "modern" | "corporate" | "minimal" | "creative" | "luxury" | ""
    branding: "yes" | "no" | ""
    hosting: "yes" | "no" | ""
    maintenance: "yes" | "no" | ""
    accessibility: string
    seo: "yes" | "no" | ""
  }
  agreements: {
    complexity_timeline: boolean
    provide_materials: boolean
    pricing_varies: boolean
  }
}
