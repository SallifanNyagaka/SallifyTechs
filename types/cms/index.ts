import type { FieldValue } from "firebase/firestore"

export type Status = "draft" | "published" | "archived" | "active" | "inactive" | "new" | "in_review"
export type FirestoreDateLike =
  | string
  | Date
  | { seconds?: number; nanoseconds?: number }
  | { toDate?: () => Date }
  | Record<string, unknown>
  | FieldValue
  | null

export type SeoFields = {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  noIndex?: boolean
}

export type HeroSection = {
  key?: string
  title?: string
  description?: string
  order?: number
}

export type HomepageHero = {
  title?: string
  subtitle?: string
  description?: string
  primaryCTA?: { label?: string; href?: string }
  secondaryCTA?: { label?: string; href?: string }
  heroImage?: string
  stats?: { label?: string; value?: string; order?: number }[]
  sections?: HeroSection[]
  servicesPreviewText?: string
  portfolioPreviewText?: string
  blogPreviewText?: string
  status?: Status
}

export type HomepageCta = {
  title?: string
  description?: string
  buttonText?: string
  href?: string
  backgroundImage?: string
  status?: Status
}

export type HomepageMain = {
  hero?: {
    eyebrow?: string
    heading?: string
  }
  services?: {
    eyebrow?: string
    heading?: string
    title?: string
    description?: string
    buttonText?: string
    buttonHref?: string
    emptyText?: string
  }
  whyChooseUs?: {
    eyebrow?: string
    heading?: string
    title?: string
    description?: string
    emptyText?: string
  }
  portfolio?: {
    eyebrow?: string
    heading?: string
    title?: string
    description?: string
    buttonText?: string
    buttonHref?: string
    emptyText?: string
  }
  process?: {
    eyebrow?: string
    heading?: string
    title?: string
    description?: string
    stepLabel?: string
    buttonText?: string
    buttonHref?: string
    emptyText?: string
  }
  cta?: {
    eyebrow?: string
    heading?: string
    imageAlt?: string
  }
}

export type TeamMember = {
  id?: string
  name?: string
  role?: string
  bio?: string
  image?: string
  linkedin?: string
  skills?: string[]
  order?: number
}

export type AboutCompany = {
  mission?: string
  vision?: string
  story?: string
  experienceYears?: number
  industries?: string[]
  status?: Status
}

export type Service = {
  id?: string
  title?: string
  slug?: string
  shortDescription?: string
  longDescription?: string
  fullDescription?: string
  heroImage?: string
  features?: string[]
  technologies?: string[]
  process?: string[]
  faqs?: { question?: string; answer?: string }[]
  pricingPlans?: {
    name?: string
    priceKESRange?: string
    priceUSDRange?: string
    features?: string[]
    recommended?: boolean
  }[]
  ctaText?: string
  ctaButtonText?: string
  icon?: string
  iconUrl?: string
  coverImage?: string
  galleryImages?: string[]
  pricingModel?: string
  category?: string
  status?: Status
  order?: number
  seo?: SeoFields
}

export type PortfolioItem = {
  id?: string
  title?: string
  slug?: string
  category?: string
  clientName?: string
  client_name?: string
  projectSummary?: string
  project_summary?: string
  fullDescription?: string
  full_description?: string
  description?: string
  servicesUsed?: string[]
  services_used?: string[]
  problemStatement?: string
  solution?: string
  technologies?: string[]
  thumbnailUrl?: string
  thumbnail_url?: string
  coverImageUrl?: string
  cover_image_url?: string
  galleryImages?: string[]
  gallery_images?: string[]
  images?: string[]
  thumbnail?: string
  live_url?: string
  liveUrl?: string
  github_url?: string
  githubUrl?: string
  industry?: string
  featured?: boolean
  testimonial?: string
  testimonialAuthor?: string
  testimonial_author?: string
  completion_date?: FirestoreDateLike
  created_at?: FirestoreDateLike
  order?: number
  completionDate?: FirestoreDateLike
  status?: Status
  seo?: SeoFields
}

export type BlogPost = {
  id?: string
  title?: string
  slug?: string
  author?: string
  bloggerName?: string
  blogger_name?: string
  bloggerPhotoUrl?: string
  blogger_photo_url?: string
  featuredImage?: string
  heroImageUrl?: string
  hero_image_url?: string
  galleryImages?: string[]
  gallery_images?: string[]
  excerpt?: string
  content?: string
  tags?: string[]
  category?: string
  readTime?: number
  featured?: boolean
  order?: number
  status?: Status
  publishedDate?: FirestoreDateLike
  published_date?: FirestoreDateLike
  created_at?: FirestoreDateLike
  updated_at?: FirestoreDateLike
  publishedAt?: FirestoreDateLike
  seo?: SeoFields
}

export type StaticPageSeo = {
  id?: string
  slug?: string
  title?: string
  seo?: SeoFields
  updatedAt?: FirestoreDateLike
}

export type ProcessStep = {
  id?: string
  stepNumber?: number
  title?: string
  description?: string
  icon?: string
  iconUrl?: string
  order?: number
  status?: Status
}

export type Testimonial = {
  id?: string
  name?: string
  email?: string
  company?: string
  role?: string
  photo_url?: string
  photoUrl?: string
  content?: string
  message?: string
  image?: string
  rating?: number
  projectType?: string
  featured?: boolean
  approved?: boolean
  reviewed?: boolean
  created_at?: FirestoreDateLike
  updated_at?: FirestoreDateLike
  submitted_at?: FirestoreDateLike
  order?: number
  status?: Status
}

export type ContactSubmission = {
  id?: string
  name?: string
  email?: string
  phone?: string
  project_type?: string
  projectType?: string
  company?: string
  serviceInterested?: string
  project_description?: string
  projectDescription?: string
  file_url?: string
  fileUrl?: string
  message?: string
  status?: Status
  submitted_at?: FirestoreDateLike
  createdAt?: FirestoreDateLike
}

export type ProjectRequest = {
  id?: string
  client_info?: {
    name?: string
    email?: string
    phone?: string
    company?: string
    country?: string
    timezone?: string
  }
  project_overview?: {
    title?: string
    type?: string
    service_id?: string
    summary?: string
    is_redesign?: boolean
  }
  requirements?: {
    description?: string
    features?: string[]
    target_audience?: string
    goals?: string
    examples?: string
  }
  budget?: {
    range?: string
    currency?: "KES" | "USD"
    start_date?: string
    deadline?: string
    flexible?: boolean
    urgent?: boolean
    custom_amount?: string
  }
  preferences?: {
    style?: string
    branding?: boolean
    hosting?: boolean
    maintenance?: boolean
    seo?: boolean
    accessibility?: string
  }
  files?: { name?: string; type?: string; size?: number; url?: string; path?: string }[]
  communication_preference?: string
  status?: "pending" | "reviewed"
  created_at?: FirestoreDateLike
  updated_at?: FirestoreDateLike
}

export type AdminUser = {
  id?: string
  name?: string
  email?: string
  role?: "admin" | "editor"
  permissions?: string[]
  avatar?: string
  lastLogin?: FirestoreDateLike
  status?: Status
}

export type SiteSettings = {
  siteName?: string
  domain?: string
  email?: string
  phone?: string
  address?: string
  socialLinks?: Record<string, string>
  branding?: {
    logo?: string
    favicon?: string
    primaryColor?: string
    secondaryColor?: string
  }
  openGraph?: {
    defaultImage?: string
    twitterCardImage?: string
  }
  status?: Status
}

export type MediaItem = {
  id?: string
  fileName?: string
  url?: string
  folder?: string
  altText?: string
  uploadedAt?: FirestoreDateLike
  size?: number
  type?: string
}
