
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getFirestore,
  doc,
  writeBatch,
  Timestamp,
} from "firebase/firestore"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, "..")
const envPath = path.join(projectRoot, ".env.local")

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, "utf8")
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue
    const idx = line.indexOf("=")
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvFile(envPath)

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const firestore = getFirestore(app)

const storageBucket = firebaseConfig.storageBucket || "sallify-tech.appspot.com"
const storageUrl = (filePath) => `gs://${storageBucket}/${filePath}`

const ts = (value) => Timestamp.fromDate(new Date(value))
const createdAtBase = ts("2025-01-15T09:00:00Z")
const updatedAtBase = ts("2025-11-01T09:00:00Z")

const homepageHero = {
  title: "Engineering Digital Products That Feel Effortless",
  subtitle: "Sallify Technologies builds scalable platforms for ambitious teams.",
  description:
    "Sallify Technologies is a product engineering and design studio that partners with companies from idea to launch. We design and build high-impact websites, mobile apps, and business systems that remove friction and create measurable results. Our team blends strategy, UX research, and robust engineering to deliver experiences that look premium, load fast, and scale with your business. Every engagement is grounded in clear communication, transparent delivery, and a deep focus on the outcomes that matter to your customers.",
  primaryCTA: {
    label: "Start a Project",
    href: "/contact",
  },
  secondaryCTA: {
    label: "View Portfolio",
    href: "/portfolio",
  },
  heroImage: storageUrl("media/home/hero-sallify.png"),
  mediaRefs: {
    heroId: "media-home-hero",
  },
  stats: [
    { label: "Projects Delivered", value: "120+", order: 1 },
    { label: "Client Retention", value: "92%", order: 2 },
    { label: "Average Launch Time", value: "10 weeks", order: 3 },
    { label: "Industries Served", value: "14", order: 4 },
  ],
  sections: [
    {
      key: "value-proposition",
      title: "What Makes Sallify Different",
      description:
        "We take a product-first approach that balances user experience, technical scalability, and business outcomes. Our teams remain small and focused, allowing fast iteration, tight feedback loops, and high accountability throughout the build.",
      order: 1,
    },
    {
      key: "delivery",
      title: "Delivery That Stays On Track",
      description:
        "Our delivery model is built around clear milestones, weekly progress updates, and proactive risk management. Clients know exactly what is being built, what is coming next, and how decisions impact timeline and budget.",
      order: 2,
    },
  ],
  servicesPreviewText:
    "From concept to launch, we support product teams with strategy, design, and full-stack engineering. Our services are modular so you can start with a single sprint or engage us end-to-end for a full digital transformation, with flexible delivery that adapts to your pace.",
  portfolioPreviewText:
    "Our portfolio showcases real transformation across industries like fintech, logistics, education, and retail. Each case study highlights the business goal, the product decisions we made, and the measurable outcomes delivered after launch.",
  blogPreviewText:
    "We share product thinking, technical insights, and growth strategies tailored for founders and product teams. Expect practical breakdowns, frameworks we use internally, and lessons from building scalable software systems.",
  status: "published",
  updatedAt: ts("2025-11-18T09:30:00Z"),
}

const homepageCta = {
  title: "Ready to Build Something That Scales?",
  description:
    "Whether you are launching a new product, modernizing legacy software, or improving conversion rates, Sallify Technologies can help. Our team pairs senior strategy with hands-on execution, so you get a partner that can lead, build, and optimize from day one.",
  buttonText: "Book a Strategy Call",
  href: "/contact",
  backgroundImage: storageUrl("media/home/cta-background.jpg"),
  mediaRefs: {
    backgroundId: "media-home-cta-background",
  },
  status: "published",
  updatedAt: ts("2025-11-18T09:30:00Z"),
}

const homepageMain = {
  hero: {
    eyebrow: "Sallify Technologies",
    heading: "Engineering Digital Products That Feel Effortless",
  },
  services: {
    eyebrow: "Services",
    heading: "Capabilities that move your roadmap forward",
    title: "Capabilities that move your roadmap forward",
    description:
      "From concept to launch, we support product teams with strategy, design, and full-stack engineering.",
    buttonText: "View All Services",
    buttonHref: "/services",
    emptyText: "No services found.",
  },
  whyChooseUs: {
    eyebrow: "Why Sallify",
    heading: "A delivery partner built for scale",
    title: "A delivery partner built for scale",
    description:
      "We combine deep product thinking with execution discipline to help teams ship without slowing down.",
    emptyText: "No value points available.",
  },
  portfolio: {
    eyebrow: "Portfolio",
    heading: "Featured projects with measurable outcomes",
    title: "Featured projects with measurable outcomes",
    description:
      "Our portfolio showcases real transformation across industries with clear business outcomes.",
    buttonText: "Explore Portfolio",
    buttonHref: "/portfolio",
    emptyText: "No featured projects.",
  },
  process: {
    eyebrow: "Process",
    heading: "A proven workflow from discovery to launch",
    title: "A proven workflow from discovery to launch",
    description:
      "Our process keeps teams aligned and delivery predictable from day one.",
    stepLabel: "Step",
    buttonText: "View Our Process",
    buttonHref: "/process",
    emptyText: "No process steps available.",
  },
  cta: {
    eyebrow: "Get Started",
    heading: "Ready to Build Something That Scales?",
    imageAlt: "Call to action background",
  },
}

const aboutCompany = {
  mission:
    "Our mission is to help ambitious companies deliver exceptional digital products by combining human-centered design, measurable strategy, and dependable engineering. We believe great software should empower teams, remove friction for users, and create a clear return on investment.",
  vision:
    "We envision a world where technology enables every organization to move faster and serve customers better. Sallify Technologies aims to be the most trusted partner for building digital experiences that are resilient, inclusive, and future-ready.",
  story:
    "Sallify Technologies began as a small studio helping startups launch their first products. Over time, our team evolved into a multidisciplinary agency serving companies across fintech, logistics, education, and SaaS. We built our reputation on transparent delivery, creative problem-solving, and the ability to translate complex requirements into elegant software. As clients grew, so did our capabilities. Today, we offer product strategy, UX design, full-stack development, and growth enablement under one roof. Our story is defined by long-term partnerships, repeat collaborations, and a relentless focus on outcomes that matter: faster launches, higher conversions, and systems that scale.",
  experienceYears: 8,
  industries: [
    "Fintech",
    "Logistics",
    "Education",
    "Healthcare",
    "E-commerce",
    "Real Estate",
    "SaaS",
  ],
  status: "published",
  updatedAt: ts("2025-10-04T13:15:00Z"),
}

const aboutPageHero = {
  title: "About Sallify Technologies",
  tagline: "A strategic technology partner for brands that need dependable growth.",
  description:
    "Sallify Technologies is a product-focused digital agency helping businesses turn complex requirements into practical software experiences. We combine strategy, design, and engineering to launch websites, mobile apps, and operational systems that perform reliably under real-world usage. Our team works closely with founders, product leaders, and operations teams to remove delivery friction, reduce uncertainty, and create digital products that support measurable business outcomes.",
  heroImage: storageUrl("media/about/about-hero.jpg"),
  primaryCTA: {
    label: "View Services",
    href: "/services",
  },
  secondaryCTA: {
    label: "Contact Us",
    href: "/contact",
  },
  mediaRefs: {
    heroImageId: "media-about-hero",
  },
  status: "published",
  updatedAt: ts("2025-11-20T10:00:00Z"),
}

const aboutPageJourney = {
  title: "Our Journey",
  description:
    "Sallify Technologies began as a small product studio supporting early-stage teams with design and engineering execution. Over the years, we expanded into a full-service technology agency trusted by companies across fintech, logistics, education, and commerce. Our growth came from consistent delivery discipline: clear milestones, transparent communication, and a strong focus on measurable outcomes. Today, we support organizations that need to modernize legacy systems, launch new digital products, and scale their online presence without sacrificing quality.",
  milestones: [
    {
      year: "2018",
      title: "Studio Founded",
      description:
        "The company launched with a focus on startup websites and product discovery engagements.",
      order: 1,
    },
    {
      year: "2020",
      title: "Expanded Engineering Team",
      description:
        "Sallify added dedicated frontend, backend, and DevOps specialists to support larger system builds.",
      order: 2,
    },
    {
      year: "2023",
      title: "Enterprise Delivery Model",
      description:
        "Introduced a structured sprint framework with governance and reporting for enterprise clients.",
      order: 3,
    },
    {
      year: "2025",
      title: "Cross-Industry Scale",
      description:
        "Reached long-term partnerships across multiple industries with repeat engagements and referral growth.",
      order: 4,
    },
  ],
  highlights: [
    "120+ projects delivered across product, design, and engineering",
    "92% client retention through long-term collaboration",
    "Senior-led delivery teams with transparent weekly reporting",
  ],
  status: "published",
  updatedAt: ts("2025-11-20T10:00:00Z"),
}

const aboutPageValuesMeta = {
  title: "Mission, Vision & Core Values",
  description:
    "Our values shape how we plan, build, and deliver products with consistency and accountability.",
  status: "published",
}

const aboutPageDifferent = {
  title: "What Makes Us Different",
  description:
    "We operate as a strategic partner, not just a delivery vendor. Our teams combine product clarity, technical rigor, and design quality to ship software that performs in production and remains maintainable as requirements evolve.",
  uniqueSellingPoints: [
    "Senior-led teams with direct access to decision-makers",
    "End-to-end capability from discovery to maintenance",
    "Structured delivery with milestone visibility and risk tracking",
    "Performance and SEO integrated from the start of every build",
  ],
  technologies: [
    "Next.js",
    "React",
    "TypeScript",
    "Firebase",
    "Node.js",
    "PostgreSQL",
    "Tailwind CSS",
  ],
  industries: ["Fintech", "Logistics", "Education", "Healthcare", "SaaS", "Retail"],
  approach:
    "We align business goals, user outcomes, and technical decisions so teams can ship faster with lower rework.",
  status: "published",
}

const aboutPageTeamMeta = {
  title: "Meet the Team",
  description:
    "A multidisciplinary group of strategists, designers, and engineers focused on practical execution.",
  status: "published",
}

const aboutPageCompanyStatsMeta = {
  title: "Company Stats & Achievements",
  description:
    "A snapshot of delivery scale, long-term partnerships, and technical capability.",
  status: "published",
}

const aboutPageCertificationsMeta = {
  title: "Certifications, Tools & Technologies",
  description:
    "Our team works with modern tools and proven delivery practices to maintain quality across engagements.",
  status: "published",
}

const aboutPageClientsMeta = {
  title: "Brands We Support",
  description:
    "Organizations across multiple industries trust Sallify Technologies to deliver high-impact digital products.",
  status: "published",
}

const aboutPageTestimonialsMeta = {
  title: "Client Feedback",
  description:
    "Real outcomes from teams that partnered with Sallify Technologies on product, platform, and growth initiatives.",
  status: "published",
}

const aboutPageCta = {
  title: "Need a Technical Partner That Can Actually Deliver?",
  description:
    "If you are planning a new product, redesigning a digital experience, or modernizing internal systems, our team can help you define a practical roadmap and execute it with speed and clarity.",
  primaryCTA: {
    label: "Start a Project",
    href: "/contact",
  },
  secondaryCTA: {
    label: "Get Free Consultation",
    href: "/contact",
  },
  backgroundImage: storageUrl("media/about/about-cta.jpg"),
  mediaRefs: {
    backgroundImageId: "media-about-cta",
  },
  status: "published",
  updatedAt: ts("2025-11-20T10:00:00Z"),
}

const teamMembers = [
  {
    id: "amelia-owusu",
    name: "Amelia Owusu",
    role: "Founder & Head of Product",
    bio:
      "Amelia leads product strategy and client partnerships at Sallify Technologies. She combines market research, user insight, and business goals to shape product roadmaps that teams can actually ship. Her focus is on clarity, risk reduction, and building processes that keep teams aligned throughout delivery.",
    image: storageUrl("media/team/amelia-owusu.jpg"),
    mediaRefs: {
      avatarId: "media-team-amelia",
    },
    linkedin: "https://www.linkedin.com/in/amelia-owusu",
    skills: ["Product Strategy", "Discovery Workshops", "Stakeholder Alignment"],
    order: 1,
  },
  {
    id: "daniel-adegoke",
    name: "Daniel Adegoke",
    role: "Lead Engineer",
    bio:
      "Daniel architects scalable systems and mentors engineering teams through complex builds. He specializes in cloud-native infrastructure, API design, and full-stack delivery with a strong emphasis on reliability and maintainability.",
    image: storageUrl("media/team/daniel-adegoke.jpg"),
    mediaRefs: {
      avatarId: "media-team-daniel",
    },
    linkedin: "https://www.linkedin.com/in/daniel-adegoke",
    skills: ["System Architecture", "Cloud Infrastructure", "Full-Stack Dev"],
    order: 2,
  },
  {
    id: "nana-baidoo",
    name: "Nana Baidoo",
    role: "UX Lead",
    bio:
      "Nana translates user needs into clean, effective experiences. She leads research, information architecture, and interaction design, ensuring every product feels intuitive and purposeful.",
    image: storageUrl("media/team/nana-baidoo.jpg"),
    mediaRefs: {
      avatarId: "media-team-nana",
    },
    linkedin: "https://www.linkedin.com/in/nana-baidoo",
    skills: ["UX Research", "Interaction Design", "Design Systems"],
    order: 3,
  },
]

const aboutTeamCollection = teamMembers.map((member) => ({
  ...member,
  status: "published",
}))

const companyStats = [
  { id: "projects-completed", label: "Projects Completed", value: 120, suffix: "+", order: 1, status: "published" },
  { id: "clients-served", label: "Clients Served", value: 80, suffix: "+", order: 2, status: "published" },
  { id: "years-experience", label: "Years of Experience", value: 8, suffix: "+", order: 3, status: "published" },
  { id: "technologies-mastered", label: "Technologies Mastered", value: 35, suffix: "+", order: 4, status: "published" },
]

const values = [
  {
    id: "clarity",
    title: "Clarity in Execution",
    description:
      "We translate complex goals into clear scopes, measurable milestones, and decisions that teams can act on quickly.",
    icon: "target",
    order: 1,
    status: "published",
  },
  {
    id: "craftsmanship",
    title: "Quality Craftsmanship",
    description:
      "Every design and engineering decision is reviewed for maintainability, performance, accessibility, and long-term value.",
    icon: "shield-check",
    order: 2,
    status: "published",
  },
  {
    id: "partnership",
    title: "Partnership Mindset",
    description:
      "We collaborate transparently with stakeholders, communicate tradeoffs early, and share ownership of delivery outcomes.",
    icon: "users",
    order: 3,
    status: "published",
  },
  {
    id: "continuous-improvement",
    title: "Continuous Improvement",
    description:
      "We use retrospectives, analytics, and real user feedback to improve every release and keep products aligned with business goals.",
    icon: "refresh-cw",
    order: 4,
    status: "published",
  },
]

const certifications = [
  {
    id: "google-cloud-partner",
    name: "Google Cloud Partner",
    logo: storageUrl("media/about/certs/google-cloud-partner.svg"),
    category: "Cloud",
    order: 1,
    status: "published",
    mediaRefs: { logoId: "media-cert-google-cloud" },
  },
  {
    id: "aws-certified-practitioner",
    name: "AWS Certified Practitioner",
    logo: storageUrl("media/about/certs/aws-practitioner.svg"),
    category: "Infrastructure",
    order: 2,
    status: "published",
    mediaRefs: { logoId: "media-cert-aws" },
  },
  {
    id: "scrum-org-psm",
    name: "Professional Scrum",
    logo: storageUrl("media/about/certs/professional-scrum.svg"),
    category: "Delivery",
    order: 3,
    status: "published",
    mediaRefs: { logoId: "media-cert-scrum" },
  },
  {
    id: "meta-ux-design",
    name: "Meta UX Design",
    logo: storageUrl("media/about/certs/meta-ux-design.svg"),
    category: "Design",
    order: 4,
    status: "published",
    mediaRefs: { logoId: "media-cert-meta-ux" },
  },
]

const clients = [
  {
    id: "fintrack-client",
    name: "FinTrack",
    logo: storageUrl("media/about/clients/fintrack-logo.svg"),
    website: "https://example.com/fintrack",
    order: 1,
    status: "published",
    mediaRefs: { logoId: "media-client-fintrack-logo" },
  },
  {
    id: "fleetflow-client",
    name: "FleetFlow Logistics",
    logo: storageUrl("media/about/clients/fleetflow-logo.svg"),
    website: "https://example.com/fleetflow",
    order: 2,
    status: "published",
    mediaRefs: { logoId: "media-client-fleetflow-logo" },
  },
  {
    id: "eduspark-client",
    name: "EduSpark",
    logo: storageUrl("media/about/clients/eduspark-logo.svg"),
    website: "https://example.com/eduspark",
    order: 3,
    status: "published",
    mediaRefs: { logoId: "media-client-eduspark-logo" },
  },
  {
    id: "brightline-client",
    name: "Brightline Retail",
    logo: storageUrl("media/about/clients/brightline-logo.svg"),
    website: "https://example.com/brightline",
    order: 4,
    status: "published",
    mediaRefs: { logoId: "media-client-brightline-logo" },
  },
  {
    id: "nexuscare-client",
    name: "NexusCare",
    logo: storageUrl("media/about/clients/nexuscare-logo.svg"),
    website: "https://example.com/nexuscare",
    order: 5,
    status: "published",
    mediaRefs: { logoId: "media-client-nexuscare-logo" },
  },
  {
    id: "veridian-client",
    name: "Veridian Systems",
    logo: storageUrl("media/about/clients/veridian-logo.svg"),
    website: "https://example.com/veridian",
    order: 6,
    status: "published",
    mediaRefs: { logoId: "media-client-veridian-logo" },
  },
]

const services = [
  {
    id: "web-development",
    title: "Web Development",
    slug: "web-development",
    shortDescription: "High-performance websites and web apps built for growth.",
    fullDescription:
      "We build responsive, accessible, and conversion-focused web experiences that scale with your business. From marketing sites to complex web apps, our team delivers clean architecture, fast loading times, and seamless integrations. We prioritize performance budgets, SEO fundamentals, and maintainable code so your website becomes a long-term asset rather than a fragile build.",
    features: [
      "Responsive, mobile-first layouts",
      "SEO-ready architecture",
      "CMS-friendly content models",
      "Performance optimization",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    icon: "globe",
    coverImage: storageUrl("media/services/web-development-cover.jpg"),
    galleryImages: [
      storageUrl("media/services/web-1.jpg"),
      storageUrl("media/services/web-2.jpg"),
    ],
    mediaRefs: {
      coverId: "media-service-web-cover",
      galleryIds: ["media-service-web-1", "media-service-web-2"],
    },
    pricingModel: "Fixed + Retainer",
    category: "Development",
    status: "published",
    order: 1,
  },
  {
    id: "mobile-development",
    title: "Mobile Development",
    slug: "mobile-development",
    shortDescription: "Native-quality mobile apps for iOS and Android.",
    fullDescription:
      "We craft mobile experiences that feel native, fast, and intuitive. Our process blends product discovery, prototype testing, and full-stack engineering to ensure your app launches with the right features, a polished UI, and the infrastructure to scale. Whether you are building a customer app or internal tool, we guide you from concept to App Store.",
    features: [
      "Cross-platform development",
      "Offline-first architecture",
      "Push notifications",
      "App store launch support",
    ],
    technologies: ["React Native", "Expo", "Firebase", "GraphQL"],
    icon: "smartphone",
    coverImage: storageUrl("media/services/mobile-development-cover.jpg"),
    galleryImages: [
      storageUrl("media/services/mobile-1.jpg"),
      storageUrl("media/services/mobile-2.jpg"),
    ],
    mediaRefs: {
      coverId: "media-service-mobile-cover",
      galleryIds: ["media-service-mobile-1", "media-service-mobile-2"],
    },
    pricingModel: "Milestone-based",
    category: "Development",
    status: "published",
    order: 2,
  },
  {
    id: "system-development",
    title: "System Development",
    slug: "system-development",
    shortDescription:
      "Custom platforms and internal tools that streamline operations.",
    fullDescription:
      "We design and build operational systems that connect data, automate workflows, and reduce manual overhead. Our systems integrate with your existing tools and grow alongside your team. From dashboards to enterprise portals, we deliver robust solutions that improve efficiency and visibility across your business.",
    features: [
      "Workflow automation",
      "Role-based access control",
      "Analytics dashboards",
      "Integrations with existing tools",
    ],
    technologies: ["Node.js", "PostgreSQL", "Firebase", "Docker"],
    icon: "layers",
    coverImage: storageUrl("media/services/system-development-cover.jpg"),
    galleryImages: [
      storageUrl("media/services/system-1.jpg"),
      storageUrl("media/services/system-2.jpg"),
    ],
    mediaRefs: {
      coverId: "media-service-system-cover",
      galleryIds: ["media-service-system-1", "media-service-system-2"],
    },
    pricingModel: "Discovery + Build",
    category: "Engineering",
    status: "published",
    order: 3,
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    slug: "ui-ux-design",
    shortDescription:
      "Product design that is research-driven and conversion-ready.",
    fullDescription:
      "Our design team creates interfaces that balance aesthetic quality with usability and business goals. We conduct user research, define information architecture, and build interaction patterns that feel natural. The result is a design system that supports future growth and keeps your product consistent across platforms.",
    features: [
      "User research and testing",
      "Design systems and UI kits",
      "Interactive prototypes",
      "Usability audits",
    ],
    technologies: ["Figma", "FigJam", "Maze", "Adobe CC"],
    icon: "pen-tool",
    coverImage: storageUrl("media/services/ui-ux-cover.jpg"),
    galleryImages: [
      storageUrl("media/services/ui-1.jpg"),
      storageUrl("media/services/ui-2.jpg"),
    ],
    mediaRefs: {
      coverId: "media-service-ui-cover",
      galleryIds: ["media-service-ui-1", "media-service-ui-2"],
    },
    pricingModel: "Sprint-based",
    category: "Design",
    status: "published",
    order: 4,
  },
  {
    id: "graphics-design",
    title: "Graphics Design",
    slug: "graphics-design",
    shortDescription:
      "Visual systems and assets that bring your brand to life.",
    fullDescription:
      "We create visual assets that align with your brand and support campaigns across digital touchpoints. From marketing collateral to product graphics and pitch decks, our team maintains visual consistency while tailoring designs to each use case.",
    features: [
      "Brand visual systems",
      "Social and marketing assets",
      "Pitch decks and presentations",
      "Illustration and iconography",
    ],
    technologies: ["Adobe Illustrator", "Photoshop", "After Effects"],
    icon: "image",
    coverImage: storageUrl("media/services/graphics-cover.jpg"),
    galleryImages: [
      storageUrl("media/services/graphics-1.jpg"),
      storageUrl("media/services/graphics-2.jpg"),
    ],
    mediaRefs: {
      coverId: "media-service-graphics-cover",
      galleryIds: ["media-service-graphics-1", "media-service-graphics-2"],
    },
    pricingModel: "Retainer",
    category: "Design",
    status: "published",
    order: 5,
  },
  {
    id: "seo-optimization",
    title: "SEO Optimization",
    slug: "seo-optimization",
    shortDescription: "Search-ready websites that bring qualified traffic.",
    fullDescription:
      "We optimize your digital presence for organic growth with technical SEO, content structure, and performance tuning. Our approach focuses on clean information architecture, structured data, and page speed improvements that increase search visibility and user engagement.",
    features: [
      "Technical SEO audits",
      "Content structure recommendations",
      "Schema and metadata tuning",
      "Core Web Vitals optimization",
    ],
    technologies: ["Lighthouse", "Search Console", "Ahrefs"],
    icon: "search",
    coverImage: storageUrl("media/services/seo-cover.jpg"),
    galleryImages: [
      storageUrl("media/services/seo-1.jpg"),
      storageUrl("media/services/seo-2.jpg"),
    ],
    mediaRefs: {
      coverId: "media-service-seo-cover",
      galleryIds: ["media-service-seo-1", "media-service-seo-2"],
    },
    pricingModel: "Monthly",
    category: "Growth",
    status: "published",
    order: 6,
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    slug: "cloud-devops",
    shortDescription: "Infrastructure that is secure, scalable, and automated.",
    fullDescription:
      "We help teams ship faster with reliable cloud infrastructure, CI/CD pipelines, and observability. Whether you are migrating legacy systems or launching a new product, our DevOps services ensure deployments are repeatable, secure, and cost-effective.",
    features: [
      "Infrastructure as code",
      "CI/CD automation",
      "Monitoring and alerting",
      "Cloud cost optimization",
    ],
    technologies: ["AWS", "GCP", "Terraform", "Docker"],
    icon: "cloud",
    coverImage: storageUrl("media/services/cloud-cover.jpg"),
    galleryImages: [
      storageUrl("media/services/cloud-1.jpg"),
      storageUrl("media/services/cloud-2.jpg"),
    ],
    mediaRefs: {
      coverId: "media-service-cloud-cover",
      galleryIds: ["media-service-cloud-1", "media-service-cloud-2"],
    },
    pricingModel: "Project + Retainer",
    category: "Engineering",
    status: "published",
    order: 7,
  },
]

const defaultFaqsByService = {
  "web-development": [
    {
      question: "Can you rebuild our existing website without losing SEO value?",
      answer:
        "Yes. We use a phased migration approach that preserves URL structures where needed, implements redirects for changed routes, and validates metadata and technical SEO baselines before launch.",
    },
    {
      question: "Do you support CMS editing after launch?",
      answer:
        "Yes. We model structured content in Firestore and can also integrate headless CMS workflows based on your team operations and publishing needs.",
    },
  ],
  "mobile-development": [
    {
      question: "Do you build for both iOS and Android?",
      answer:
        "Yes. We deliver cross-platform apps with native-quality interactions and can extend into fully native modules when product requirements demand it.",
    },
    {
      question: "Can you maintain the app after release?",
      answer:
        "Yes. We provide post-launch support for monitoring, feature improvements, and release management across app store environments.",
    },
  ],
}

const servicesWithCmsDetail = services.map((service) => ({
  ...service,
  heroImage: service.coverImage,
  longDescription: service.fullDescription,
  process: [
    "Discovery and requirements alignment",
    "Scope definition and sprint planning",
    "Design and architecture validation",
    "Implementation and iterative QA",
    "Launch, optimization, and support",
  ],
  faqs: defaultFaqsByService[service.slug] || [
    {
      question: "How long does this service engagement take?",
      answer:
        "Timeline depends on scope and complexity, but we define a practical delivery roadmap with milestones, dependencies, and review checkpoints before build starts.",
    },
    {
      question: "Can Sallify work with our existing internal team?",
      answer:
        "Yes. We frequently embed with in-house product and engineering teams, share documentation, and align sprint rituals to reduce communication overhead.",
    },
  ],
  pricingPlans: [
    {
      name: "Starter",
      priceKESRange: "KES 180,000 - 420,000",
      priceUSDRange: "USD 1,400 - 3,200",
      features: ["Discovery workshop", "Core feature delivery", "Basic QA and handoff"],
      recommended: false,
    },
    {
      name: "Growth",
      priceKESRange: "KES 450,000 - 1,200,000",
      priceUSDRange: "USD 3,500 - 9,200",
      features: ["Expanded scope", "Advanced integrations", "Performance and SEO optimization"],
      recommended: true,
    },
    {
      name: "Custom Quote",
      priceKESRange: "KES 1,250,000+",
      priceUSDRange: "USD 9,500+",
      features: ["Enterprise architecture", "Dedicated squad", "Ongoing optimization and support"],
      recommended: false,
    },
  ],
  ctaText:
    "Need this service tailored to your roadmap? Book a consultation with Sallify Technologies and get a practical delivery plan.",
  ctaButtonText: "Start Consultation",
  seo: {
    metaTitle: `${service.title} | Sallify Techs`,
    metaDescription: service.shortDescription,
    keywords: [service.title, service.category, "Sallify Techs"],
    canonicalUrl: `/services/${service.slug}`,
    ogImage: service.coverImage,
    noIndex: false,
  },
}))

const portfolioItems = [
  {
    id: "fintrack-platform",
    title: "FinTrack Analytics Platform",
    clientName: "FinTrack",
    description:
      "FinTrack needed a modern analytics platform that could unify transaction data across multiple banks while delivering actionable insights to finance teams. We designed a data-rich dashboard experience, implemented a secure API layer, and built a multi-tenant system that can onboard new clients without downtime. The result was a platform that reduced reporting time by 60% and unlocked new enterprise subscriptions.",
    problemStatement:
      "The legacy reporting system was slow, inconsistent, and unable to support multiple client data sources without manual work.",
    solution:
      "We rebuilt the platform with a modern data pipeline, role-based dashboards, and automated reporting flows that deliver insights in real time.",
    technologies: ["Next.js", "Node.js", "PostgreSQL", "GCP"],
    images: [
      storageUrl("media/portfolio/fintrack-1.jpg"),
      storageUrl("media/portfolio/fintrack-2.jpg"),
    ],
    thumbnail: storageUrl("media/portfolio/fintrack-thumb.jpg"),
    mediaRefs: {
      thumbnailId: "media-portfolio-fintrack-thumb",
      imageIds: ["media-portfolio-fintrack-1", "media-portfolio-fintrack-2"],
      openGraphId: "media-portfolio-fintrack-thumb",
    },
    openGraph: {
      image: storageUrl("media/portfolio/fintrack-thumb.jpg"),
      title: "FinTrack Analytics Platform",
      description:
        "A multi-tenant analytics platform that reduced reporting time by 60%.",
    },
    liveUrl: "https://example.com/fintrack",
    githubUrl: "https://github.com/sallify/fintrack",
    industry: "Fintech",
    featured: true,
    completionDate: ts("2025-08-22T00:00:00Z"),
    status: "published",
  },
  {
    id: "fleetflow-ops",
    title: "FleetFlow Operations Suite",
    clientName: "FleetFlow Logistics",
    description:
      "FleetFlow needed a centralized system for dispatching, tracking, and reporting on hundreds of daily deliveries. Our team delivered a custom operations suite with live tracking, route optimization, and driver communication tools. The solution reduced manual calls by 70% and improved on-time delivery metrics across the fleet.",
    problemStatement:
      "Dispatching relied on spreadsheets and phone calls, leading to missed deliveries and limited visibility.",
    solution:
      "We built a real-time operations platform with GPS tracking, alerts, and a dispatcher dashboard to coordinate routes efficiently.",
    technologies: ["React", "Firebase", "Maps API", "Cloud Functions"],
    images: [
      storageUrl("media/portfolio/fleetflow-1.jpg"),
      storageUrl("media/portfolio/fleetflow-2.jpg"),
    ],
    thumbnail: storageUrl("media/portfolio/fleetflow-thumb.jpg"),
    mediaRefs: {
      thumbnailId: "media-portfolio-fleetflow-thumb",
      imageIds: ["media-portfolio-fleetflow-1", "media-portfolio-fleetflow-2"],
      openGraphId: "media-portfolio-fleetflow-thumb",
    },
    openGraph: {
      image: storageUrl("media/portfolio/fleetflow-thumb.jpg"),
      title: "FleetFlow Operations Suite",
      description:
        "An operations suite that streamlined dispatching and improved on-time delivery.",
    },
    liveUrl: "https://example.com/fleetflow",
    githubUrl: "https://github.com/sallify/fleetflow",
    industry: "Logistics",
    featured: true,
    completionDate: ts("2025-05-10T00:00:00Z"),
    status: "published",
  },
  {
    id: "eduspark-campus",
    title: "EduSpark Campus Experience",
    clientName: "EduSpark",
    description:
      "EduSpark wanted to modernize its student engagement platform with mobile-first features and accessible content. We designed a clean UI system, built a responsive web experience, and integrated the platform with their LMS to provide real-time updates on coursework and events.",
    problemStatement:
      "Students struggled to find course updates and campus events on a fragmented platform.",
    solution:
      "We delivered a unified experience that connected academic content with event management and real-time notifications.",
    technologies: ["Next.js", "TypeScript", "Headless CMS"],
    images: [
      storageUrl("media/portfolio/eduspark-1.jpg"),
      storageUrl("media/portfolio/eduspark-2.jpg"),
    ],
    thumbnail: storageUrl("media/portfolio/eduspark-thumb.jpg"),
    mediaRefs: {
      thumbnailId: "media-portfolio-eduspark-thumb",
      imageIds: ["media-portfolio-eduspark-1", "media-portfolio-eduspark-2"],
      openGraphId: "media-portfolio-eduspark-thumb",
    },
    openGraph: {
      image: storageUrl("media/portfolio/eduspark-thumb.jpg"),
      title: "EduSpark Campus Experience",
      description:
        "A unified student engagement experience with real-time updates.",
    },
    liveUrl: "https://example.com/eduspark",
    githubUrl: "https://github.com/sallify/eduspark",
    industry: "Education",
    featured: false,
    completionDate: ts("2024-11-30T00:00:00Z"),
    status: "published",
  },
]

const portfolioEnhancements = {
  "fintrack-platform": {
    category: "System Development",
    projectSummary:
      "A multi-tenant analytics platform that unified banking data, accelerated reporting, and improved enterprise decision-making speed.",
    servicesUsed: [
      "System Development",
      "UI/UX Design",
      "Cloud & DevOps",
    ],
    coverImageUrl: storageUrl("media/portfolio/fintrack-cover.jpg"),
    testimonial:
      "Sallify delivered a robust platform that transformed how our teams consume and trust analytics. The clarity of reporting and platform stability gave us immediate operational confidence.",
    testimonialAuthor: "Sarah Johnson, VP of Product at FinTrack",
  },
  "fleetflow-ops": {
    category: "System Development",
    projectSummary:
      "A custom logistics operations suite with live fleet visibility and dispatcher tooling that reduced manual overhead and increased delivery reliability.",
    servicesUsed: ["System Development", "Mobile Development", "Cloud & DevOps"],
    coverImageUrl: storageUrl("media/portfolio/fleetflow-cover.jpg"),
    testimonial:
      "The Sallify team turned our fragmented operations workflow into one system we could rely on daily. Response times and route efficiency improved within weeks.",
    testimonialAuthor: "Michael Adeleke, Operations Director at FleetFlow Logistics",
  },
  "eduspark-campus": {
    category: "Web Development",
    projectSummary:
      "A unified student engagement experience that connected course content, campus communications, and real-time updates in one platform.",
    servicesUsed: ["Web Development", "UI/UX Design", "SEO Optimization"],
    coverImageUrl: storageUrl("media/portfolio/eduspark-cover.jpg"),
    testimonial:
      "Sallify helped us simplify a complicated student journey into one intuitive experience. Adoption increased quickly and support requests dropped significantly.",
    testimonialAuthor: "Lina Patel, Head of Digital Learning at EduSpark",
  },
}

function buildPortfolioProject(item) {
  const enhancement = portfolioEnhancements[item.id] || {}
  const projectSummary = enhancement.projectSummary || item.description || ""
  const fullDescription = item.description || ""
  const servicesUsed = enhancement.servicesUsed || [item.industry || "Product Development"]
  const coverImageUrl = enhancement.coverImageUrl || item.thumbnail || ""
  const completionDate =
    item.completionDate instanceof Timestamp
      ? item.completionDate.toDate().toISOString()
      : item.completionDate || ""

  return {
    id: item.id,
    title: item.title,
    slug: item.id,
    category: enhancement.category || "Web Development",
    clientName: item.clientName,
    client_name: item.clientName,
    projectSummary,
    project_summary: projectSummary,
    fullDescription,
    full_description: fullDescription,
    description: fullDescription,
    servicesUsed,
    services_used: servicesUsed,
    technologies: item.technologies || [],
    thumbnailUrl: item.thumbnail || "",
    thumbnail_url: item.thumbnail || "",
    coverImageUrl,
    cover_image_url: coverImageUrl,
    galleryImages: item.images || [],
    gallery_images: item.images || [],
    images: item.images || [],
    thumbnail: item.thumbnail || "",
    liveUrl: item.liveUrl || "",
    live_url: item.liveUrl || "",
    githubUrl: item.githubUrl || "",
    github_url: item.githubUrl || "",
    completionDate,
    completion_date: completionDate,
    testimonial: enhancement.testimonial || "",
    testimonialAuthor: enhancement.testimonialAuthor || "",
    testimonial_author: enhancement.testimonialAuthor || "",
    featured: Boolean(item.featured),
    order: item.featured ? 1 : 2,
    createdAt: createdAtBase,
    created_at: createdAtBase,
    updatedAt: updatedAtBase,
    status: item.status || "published",
    mediaRefs: item.mediaRefs || {},
    seo: {
      metaTitle: `${item.title} Case Study | Sallify Techs`,
      metaDescription: projectSummary,
      keywords: [item.title, enhancement.category || "Portfolio", "Case Study"],
      canonicalUrl: `/portfolio/${item.id}`,
      ogImage: coverImageUrl || item.thumbnail || "",
      noIndex: false,
    },
  }
}

const blogPosts = [
  {
    id: "building-for-scale",
    title: "Building for Scale Without Sacrificing Speed",
    slug: "building-for-scale-without-sacrificing-speed",
    author: "Amelia Owusu",
    featuredImage: storageUrl("media/blog/scale.jpg"),
    mediaRefs: {
      featuredId: "media-blog-scale",
      openGraphId: "media-blog-scale",
    },
    openGraph: {
      image: storageUrl("media/blog/scale.jpg"),
      title: "Building for Scale Without Sacrificing Speed",
      description:
        "Learn how teams can move fast today while building systems that scale tomorrow.",
    },
    excerpt:
      "Learn how teams can move fast today while building systems that scale tomorrow.",
    content:
      "Scaling a digital product is not just about infrastructure. It starts with how teams make decisions, how they structure data, and how they design the core experience. At Sallify, we begin by identifying the most critical user journeys and ensuring those are resilient under real-world load.\n\nWe then align product and engineering teams around a shared set of quality metrics. This includes response times, error budgets, and the cost of acquisition that the system must support. When a team ships with clarity on these metrics, they are able to make trade-offs consciously rather than reactively.\n\nFinally, we implement architecture patterns that reduce long-term friction, such as modular services, thoughtful caching, and automated testing. These practices keep teams shipping quickly while preserving a stable foundation for growth.",
    tags: ["Scaling", "Engineering", "Architecture"],
    category: "Engineering",
    readTime: 6,
    status: "published",
    publishedAt: ts("2025-07-12T10:00:00Z"),
  },
  {
    id: "designing-for-conversion",
    title: "Designing for Conversion in B2B Products",
    slug: "designing-for-conversion-in-b2b-products",
    author: "Nana Baidoo",
    featuredImage: storageUrl("media/blog/conversion.jpg"),
    mediaRefs: {
      featuredId: "media-blog-conversion",
      openGraphId: "media-blog-conversion",
    },
    openGraph: {
      image: storageUrl("media/blog/conversion.jpg"),
      title: "Designing for Conversion in B2B Products",
      description:
        "How to blend trust, clarity, and momentum in product experiences.",
    },
    excerpt:
      "How to blend trust, clarity, and momentum in product experiences.",
    content:
      "Conversion in B2B products often depends on removing uncertainty. Users want to understand the value of your platform quickly, and they need confidence that it will work for their teams. This means your UI must balance clarity with reassurance.\n\nWe recommend mapping the top objections that appear in sales calls and surfacing answers directly in the product. That might include security details, onboarding time, or proof of ROI. When the interface anticipates these concerns, it reduces friction and speeds decision-making.\n\nGreat conversion design also requires a strong content hierarchy. Headlines should communicate impact, supporting sections should provide evidence, and calls-to-action should be placed where users feel ready to commit.",
    tags: ["UX", "Conversion", "B2B"],
    category: "Design",
    readTime: 5,
    status: "published",
    publishedAt: ts("2025-06-20T09:00:00Z"),
  },
  {
    id: "seo-that-compounds",
    title: "SEO That Compounds: A Practical Framework",
    slug: "seo-that-compounds-a-practical-framework",
    author: "Daniel Adegoke",
    featuredImage: storageUrl("media/blog/seo.jpg"),
    mediaRefs: {
      featuredId: "media-blog-seo",
      openGraphId: "media-blog-seo",
    },
    openGraph: {
      image: storageUrl("media/blog/seo.jpg"),
      title: "SEO That Compounds: A Practical Framework",
      description:
        "Build a search foundation that compounds growth over time.",
    },
    excerpt:
      "Build a search foundation that compounds growth over time.",
    content:
      "SEO is often treated as a checklist, but the most effective growth comes from repeatable systems. That means building content architectures that align with intent, ensuring pages load fast, and structuring metadata in a consistent, scalable way.\n\nWe often start by defining a taxonomy that mirrors how users search. This taxonomy informs URLs, internal linking, and content strategy. When the foundation is structured properly, each new page becomes a building block that increases the strength of the overall domain.\n\nFinally, we align engineering and marketing teams on performance budgets and reporting. That shared ownership ensures the site remains fast and crawlable even as content scales.",
    tags: ["SEO", "Growth", "Performance"],
    category: "Growth",
    readTime: 7,
    status: "published",
    publishedAt: ts("2025-05-05T12:00:00Z"),
  },
  {
    id: "discovery-workshops",
    title: "Why Discovery Workshops Save Months of Rework",
    slug: "why-discovery-workshops-save-months-of-rework",
    author: "Amelia Owusu",
    featuredImage: storageUrl("media/blog/discovery.jpg"),
    mediaRefs: {
      featuredId: "media-blog-discovery",
      openGraphId: "media-blog-discovery",
    },
    openGraph: {
      image: storageUrl("media/blog/discovery.jpg"),
      title: "Why Discovery Workshops Save Months of Rework",
      description: "Discovery is not a meeting. It is a product accelerator.",
    },
    excerpt:
      "Discovery is not a meeting. It is a product accelerator.",
    content:
      "A strong discovery phase helps teams align on the real problem before they start building. We use workshops to map user journeys, surface technical constraints, and define success metrics. That clarity prevents scope drift and costly rework later in the project.\n\nDiscovery also provides an opportunity to challenge assumptions. When stakeholders and engineers share a room, you can uncover hidden dependencies and agree on trade-offs early. The outcome is a roadmap that feels grounded rather than aspirational.\n\nThe biggest benefit is speed. Teams that invest in discovery move faster during delivery because the decision-making is already done.",
    tags: ["Product Strategy", "Workshops"],
    category: "Strategy",
    readTime: 5,
    status: "published",
    publishedAt: ts("2025-04-18T11:30:00Z"),
  },
  {
    id: "design-systems",
    title: "Design Systems That Stay Consistent at Scale",
    slug: "design-systems-that-stay-consistent-at-scale",
    author: "Nana Baidoo",
    featuredImage: storageUrl("media/blog/design-systems.jpg"),
    mediaRefs: {
      featuredId: "media-blog-design-systems",
      openGraphId: "media-blog-design-systems",
    },
    openGraph: {
      image: storageUrl("media/blog/design-systems.jpg"),
      title: "Design Systems That Stay Consistent at Scale",
      description:
        "A practical approach to maintaining consistency across product teams.",
    },
    excerpt:
      "A practical approach to maintaining consistency across product teams.",
    content:
      "Design systems are not just a UI kit. They are a shared language that keeps teams aligned. The most resilient systems include design principles, component usage guidance, and governance rules that help teams adopt and evolve the system without breaking consistency.\n\nWe recommend starting small by identifying the most frequently used components, documenting them clearly, and establishing a feedback loop between designers and engineers. As the system grows, you can introduce automated checks and versioning to prevent drift.\n\nThe end result is a product experience that feels cohesive even as multiple teams ship in parallel.",
    tags: ["Design Systems", "Product"],
    category: "Design",
    readTime: 6,
    status: "published",
    publishedAt: ts("2025-03-09T08:45:00Z"),
  },
  {
    id: "modernizing-legacy",
    title: "Modernizing Legacy Systems Without Disrupting Operations",
    slug: "modernizing-legacy-systems-without-disrupting-operations",
    author: "Daniel Adegoke",
    featuredImage: storageUrl("media/blog/legacy.jpg"),
    mediaRefs: {
      featuredId: "media-blog-legacy",
      openGraphId: "media-blog-legacy",
    },
    openGraph: {
      image: storageUrl("media/blog/legacy.jpg"),
      title: "Modernizing Legacy Systems Without Disrupting Operations",
      description:
        "How to migrate critical systems without stalling the business.",
    },
    excerpt:
      "How to migrate critical systems without stalling the business.",
    content:
      "Legacy systems are often fragile, but replacing them all at once is risky. We recommend a phased approach that isolates core workflows, builds new services in parallel, and gradually shifts traffic as confidence grows.\n\nA successful modernization effort starts with a system audit. Identify the components that create the most operational drag, then prioritize them based on impact and complexity. This creates a roadmap that reduces risk while delivering visible progress.\n\nWith careful release management and strong observability, teams can modernize without interrupting day-to-day operations.",
    tags: ["Modernization", "Infrastructure"],
    category: "Engineering",
    readTime: 7,
    status: "draft",
    publishedAt: ts("2025-02-02T09:15:00Z"),
  },
]

const blogAuthorProfiles = {
  "Amelia Owusu": storageUrl("media/blog/authors/amelia-owusu.jpg"),
  "Daniel Adegoke": storageUrl("media/blog/authors/daniel-adegoke.jpg"),
  "Nana Baidoo": storageUrl("media/blog/authors/nana-baidoo.jpg"),
}

const blogGalleryById = {
  "building-for-scale": [
    storageUrl("media/blog/gallery/scale-1.jpg"),
    storageUrl("media/blog/gallery/scale-2.jpg"),
  ],
  "designing-for-conversion": [
    storageUrl("media/blog/gallery/conversion-1.jpg"),
    storageUrl("media/blog/gallery/conversion-2.jpg"),
  ],
  "seo-that-compounds": [
    storageUrl("media/blog/gallery/seo-1.jpg"),
    storageUrl("media/blog/gallery/seo-2.jpg"),
  ],
}

function buildBlogPost(post) {
  const heroImageUrl = post.featuredImage || ""
  const bloggerName = post.author || ""
  const bloggerPhotoUrl = blogAuthorProfiles[bloggerName] || storageUrl("media/blog/authors/default-author.jpg")
  const publishedDate =
    post.publishedAt instanceof Timestamp
      ? post.publishedAt.toDate().toISOString()
      : post.publishedAt || ""

  return {
    ...post,
    author: bloggerName,
    bloggerName,
    blogger_name: bloggerName,
    bloggerPhotoUrl,
    blogger_photo_url: bloggerPhotoUrl,
    heroImageUrl,
    hero_image_url: heroImageUrl,
    galleryImages: blogGalleryById[post.id] || [],
    gallery_images: blogGalleryById[post.id] || [],
    publishedDate,
    published_date: publishedDate,
    created_at: createdAtBase,
    updated_at: updatedAtBase,
    seo: {
      metaTitle: `${post.title} | Sallify Techs Blog`,
      metaDescription: post.excerpt,
      keywords: [...(post.tags || []), post.category || "Blog"],
      canonicalUrl: `/blog/${post.slug}`,
      ogImage: heroImageUrl,
      noIndex: post.status === "draft",
    },
  }
}

const staticPagesSeo = [
  {
    id: "home",
    slug: "home",
    title: "Home",
    seo: {
      metaTitle: "Sallify Techs - Build Faster with Digital Solutions",
      metaDescription:
        "Sallify Techs builds web, mobile, design, and growth systems for modern businesses.",
      keywords: ["Sallify Techs", "Web Development", "Mobile Development", "Digital Agency"],
      canonicalUrl: "/",
      ogImage: storageUrl("media/home/hero-main.jpg"),
      noIndex: false,
    },
  },
  { id: "about", slug: "about", title: "About", seo: { metaTitle: "About Sallify Techs", metaDescription: "Learn how Sallify Techs delivers web, mobile, design, and growth outcomes for clients.", keywords: ["About Sallify", "Digital Agency"], canonicalUrl: "/about", ogImage: storageUrl("media/about/company-hero.jpg"), noIndex: false } },
  { id: "services", slug: "services", title: "Services", seo: { metaTitle: "Services | Sallify Techs", metaDescription: "Explore web development, mobile, systems, UI/UX, SEO, and growth services from Sallify Techs.", keywords: ["Services", "Web", "Mobile", "SEO"], canonicalUrl: "/services", ogImage: storageUrl("media/services/web-development-cover.jpg"), noIndex: false } },
  { id: "portfolio", slug: "portfolio", title: "Portfolio", seo: { metaTitle: "Portfolio | Sallify Techs", metaDescription: "See case studies and project outcomes delivered by Sallify Techs across industries.", keywords: ["Portfolio", "Case Studies"], canonicalUrl: "/portfolio", ogImage: storageUrl("media/portfolio/fintrack-cover.jpg"), noIndex: false } },
  { id: "blog", slug: "blog", title: "Blog", seo: { metaTitle: "Blog | Sallify Techs", metaDescription: "Read insights, playbooks, and technical guides from Sallify Techs.", keywords: ["Blog", "Engineering", "SEO"], canonicalUrl: "/blog", ogImage: storageUrl("media/blog/scale.jpg"), noIndex: false } },
  { id: "process", slug: "process", title: "Process", seo: { metaTitle: "Our Process | Sallify Techs", metaDescription: "Understand the delivery workflow Sallify Techs uses from discovery to maintenance.", keywords: ["Process", "Delivery Workflow"], canonicalUrl: "/process", ogImage: storageUrl("media/process/discovery.jpg"), noIndex: false } },
  { id: "testimonials", slug: "testimonials", title: "Testimonials", seo: { metaTitle: "Testimonials | Sallify Techs", metaDescription: "Explore success stories and testimonials from Sallify Techs clients.", keywords: ["Testimonials", "Success Stories"], canonicalUrl: "/testimonials", ogImage: storageUrl("media/testimonials/client-1.jpg"), noIndex: false } },
  { id: "contact", slug: "contact", title: "Contact", seo: { metaTitle: "Contact | Sallify Techs", metaDescription: "Start your project with Sallify Techs. Share your requirements and get a response quickly.", keywords: ["Contact", "Start Project"], canonicalUrl: "/contact", ogImage: storageUrl("media/contact/hero.jpg"), noIndex: false } },
]

const processSteps = [
  {
    id: "discovery",
    stepNumber: 1,
    title: "Discovery",
    description:
      "We start by understanding your goals, audience, and constraints. This phase includes stakeholder interviews, competitive analysis, and a clear definition of success metrics to ensure everyone aligns on what matters most.",
    icon: "search",
    iconUrl: storageUrl("media/process/discovery.jpg"),
    order: 1,
    status: "published",
  },
  {
    id: "planning",
    stepNumber: 2,
    title: "Planning",
    description:
      "We translate insights into a roadmap that balances impact and effort. This includes feature prioritization, delivery milestones, and a scoped plan that keeps the project predictable.",
    icon: "clipboard",
    iconUrl: storageUrl("media/process/planning.jpg"),
    order: 2,
    status: "published",
  },
  {
    id: "design",
    stepNumber: 3,
    title: "Design",
    description:
      "We craft the user experience and visual system, validating key flows with prototypes. This phase ensures the product feels intuitive and aligns with your brand.",
    icon: "pen-tool",
    iconUrl: storageUrl("media/process/design.jpg"),
    order: 3,
    status: "published",
  },
  {
    id: "development",
    stepNumber: 4,
    title: "Development",
    description:
      "Our engineers build with quality and scalability in mind, using modern frameworks and clear architecture. We deliver in sprints with transparent progress reporting.",
    icon: "code",
    iconUrl: storageUrl("media/process/development.jpg"),
    order: 4,
    status: "published",
  },
  {
    id: "testing",
    stepNumber: 5,
    title: "Testing",
    description:
      "We validate functionality, performance, and security before launch. Testing includes QA cycles, accessibility checks, and performance benchmarking.",
    icon: "check-circle",
    iconUrl: storageUrl("media/process/testing.jpg"),
    order: 5,
    status: "published",
  },
  {
    id: "deployment",
    stepNumber: 6,
    title: "Deployment",
    description:
      "We launch with confidence using automated deployments and monitoring. This ensures smooth releases with minimal downtime.",
    icon: "rocket",
    iconUrl: storageUrl("media/process/deployment.jpg"),
    order: 6,
    status: "published",
  },
  {
    id: "maintenance",
    stepNumber: 7,
    title: "Maintenance",
    description:
      "We offer ongoing support, optimization, and feature enhancements. Our team stays engaged to ensure the product continues to perform and evolve.",
    icon: "refresh",
    iconUrl: storageUrl("media/process/maintenance.jpg"),
    order: 7,
    status: "published",
  },
]

const processPageHero = {
  title: "Our Process - How We Deliver Success",
  description:
    "Sallify Technologies follows a clear delivery framework that reduces uncertainty, improves collaboration, and helps teams launch faster with confidence. Every step is designed to keep business goals, user experience, and technical quality aligned from kickoff to long-term support.",
  backgroundImage: storageUrl("media/process/process-hero.jpg"),
  status: "published",
  updatedAt: ts("2025-11-18T09:30:00Z"),
}

const processPageWhy = {
  title: "Why This Process Works",
  description:
    "Our workflow combines strategic discovery, iterative execution, and measurable quality checks. This structure helps teams make informed decisions early, avoid expensive rework, and maintain delivery momentum while protecting product quality as scope evolves.",
  status: "published",
}

const processPageCta = {
  title: "Ready to Start Your Project?",
  description:
    "If you need a reliable partner to plan, build, and optimize your digital product, our team is ready to map out the next steps with you.",
  status: "published",
}

const processFaqs = [
  {
    id: "faq-kickoff-time",
    question: "How quickly can we start after kickoff?",
    answer:
      "Most projects begin within one to two weeks after discovery alignment, depending on scope complexity and stakeholder availability.",
    order: 1,
    status: "published",
  },
  {
    id: "faq-progress-visibility",
    question: "How do we track progress during delivery?",
    answer:
      "We provide milestone tracking, weekly updates, and sprint reviews so your team has clear visibility on what is done, what is next, and where risks exist.",
    order: 2,
    status: "published",
  },
  {
    id: "faq-post-launch",
    question: "Do you support products after launch?",
    answer:
      "Yes. We offer maintenance, performance optimization, and roadmap-based enhancements to keep your product stable and competitive over time.",
    order: 3,
    status: "published",
  },
]

const testimonials = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    company: "FinTrack",
    role: "VP of Product",
    message:
      "Sallify Technologies felt like an extension of our internal team. They translated complex financial requirements into an elegant product experience and delivered on a tight timeline. The launch exceeded our performance targets and our customers immediately noticed the improvement.",
    content:
      "Sallify Technologies felt like an extension of our internal team. They translated complex financial requirements into an elegant product experience and delivered on a tight timeline. The launch exceeded our performance targets and our customers immediately noticed the improvement.",
    image: storageUrl("media/testimonials/sarah-johnson.jpg"),
    photo_url: storageUrl("media/testimonials/sarah-johnson.jpg"),
    mediaRefs: {
      avatarId: "media-testimonial-sarah",
    },
    rating: 5,
    order: 1,
    featured: true,
    approved: true,
    reviewed: true,
    projectType: "Analytics Platform",
    status: "published",
  },
  {
    id: "michael-adeleke",
    name: "Michael Adeleke",
    company: "FleetFlow Logistics",
    role: "Operations Director",
    message:
      "We were overwhelmed by manual dispatching until Sallify built our operations suite. The team was proactive, transparent, and delivered a platform that changed how we run the business. The ROI was clear within the first month.",
    content:
      "We were overwhelmed by manual dispatching until Sallify built our operations suite. The team was proactive, transparent, and delivered a platform that changed how we run the business. The ROI was clear within the first month.",
    image: storageUrl("media/testimonials/michael-adeleke.jpg"),
    photo_url: storageUrl("media/testimonials/michael-adeleke.jpg"),
    mediaRefs: {
      avatarId: "media-testimonial-michael",
    },
    rating: 5,
    order: 2,
    featured: true,
    approved: true,
    reviewed: true,
    projectType: "Operations Suite",
    status: "published",
  },
  {
    id: "lina-patel",
    name: "Lina Patel",
    company: "EduSpark",
    role: "Head of Digital Learning",
    message:
      "Our students finally have a unified experience, and the admin tools are far easier for our team to manage. Sallify brought clarity to the process and helped us make better decisions at every stage.",
    content:
      "Our students finally have a unified experience, and the admin tools are far easier for our team to manage. Sallify brought clarity to the process and helped us make better decisions at every stage.",
    image: storageUrl("media/testimonials/lina-patel.jpg"),
    photo_url: storageUrl("media/testimonials/lina-patel.jpg"),
    mediaRefs: {
      avatarId: "media-testimonial-lina",
    },
    rating: 4.8,
    order: 3,
    featured: false,
    approved: true,
    reviewed: true,
    projectType: "Education Platform",
    status: "published",
  },
]

const testimonialSubmissions = [
  {
    id: "submission-001",
    name: "Kevin Mwangi",
    email: "kevin.mwangi@example.com",
    content:
      "Working with Sallify gave our startup a clear product roadmap and a reliable execution partner. Their communication was consistent, and the final platform quality exceeded our expectations.",
    rating: 5,
    submitted_at: ts("2025-11-11T10:10:00Z"),
    approved: false,
    reviewed: false,
  },
  {
    id: "submission-002",
    name: "Alice Njeri",
    email: "alice.njeri@example.com",
    content:
      "The team modernized our customer portal with minimal disruption and helped us launch features much faster than our previous process.",
    rating: 4,
    submitted_at: ts("2025-11-12T13:35:00Z"),
    approved: false,
    reviewed: false,
  },
]

const contacts = [
  {
    id: "contact-001",
    name: "Grace Mensah",
    email: "grace.mensah@example.com",
    phone: "+1 415 555 0127",
    company: "Brightline Retail",
    serviceInterested: "Web Development",
    message:
      "We are preparing to launch a new e-commerce storefront and need a fast, modern website that integrates with our inventory system. We are looking for a partner that can design and build the experience end-to-end, including performance optimization and SEO.",
    status: "new",
    createdAt: ts("2025-11-02T14:20:00Z"),
  },
  {
    id: "contact-002",
    name: "Tobias Nguyen",
    email: "tobias.nguyen@example.com",
    phone: "+1 212 555 0199",
    company: "Harbor Logistics",
    serviceInterested: "System Development",
    message:
      "We have multiple legacy tools for dispatch and reporting. We want to consolidate into a single system with role-based access, live status updates, and automated alerts.",
    status: "in_review",
    createdAt: ts("2025-10-21T09:05:00Z"),
  },
]

const contactMethods = [
  {
    id: "method-email",
    platform: "Email",
    value: "nyagakasallifan@gmail.com",
    iconUrl: storageUrl("media/contact/icon-email.svg"),
    order: 1,
    active: true,
  },
  {
    id: "method-whatsapp",
    platform: "WhatsApp",
    value: "+14155550100",
    iconUrl: storageUrl("media/contact/icon-whatsapp.svg"),
    order: 2,
    active: true,
  },
  {
    id: "method-phone",
    platform: "Phone",
    value: "+14155550100",
    iconUrl: storageUrl("media/contact/icon-phone.svg"),
    order: 6,
    active: true,
  },
  {
    id: "method-facebook",
    platform: "Facebook",
    value: "https://facebook.com/sallify",
    iconUrl: storageUrl("media/branding/icon-facebook.svg"),
    order: 3,
    active: true,
  },
  {
    id: "method-instagram",
    platform: "Instagram",
    value: "https://instagram.com/sallify",
    iconUrl: storageUrl("media/branding/icon-instagram.svg"),
    order: 4,
    active: true,
  },
  {
    id: "method-telegram",
    platform: "Telegram",
    value: "sallify_support",
    iconUrl: storageUrl("media/contact/icon-telegram.svg"),
    order: 5,
    active: true,
  },
]

const contactSubmissions = contacts.map((item) => ({
  id: `submission-${item.id}`,
  name: item.name,
  email: item.email,
  phone: item.phone || "",
  project_type: item.serviceInterested || "General Inquiry",
  project_description: item.message || "",
  file_url: "",
  submitted_at: item.createdAt || createdAtBase,
  status: item.status || "pending",
}))

const users = [
  {
    id: "super-admin",
    name: "Amelia Owusu",
    email: "amelia@sallify.tech",
    role: "admin",
    permissions: ["all"],
    avatar: storageUrl("media/users/amelia-admin.jpg"),
    mediaRefs: {
      avatarId: "media-user-amelia-admin",
    },
    lastLogin: ts("2025-11-19T08:05:00Z"),
    status: "active",
  },
  {
    id: "editor",
    name: "Chinedu Okafor",
    email: "editor@sallify.tech",
    role: "admin",
    permissions: ["content.read", "content.write", "media.read"],
    avatar: storageUrl("media/users/chinedu-editor.jpg"),
    mediaRefs: {
      avatarId: "media-user-chinedu-editor",
    },
    lastLogin: ts("2025-11-17T15:45:00Z"),
    status: "active",
  },
]

const settingsSite = {
  siteName: "Sallify Technologies",
  domain: "sallify.tech",
  email: "nyagakasallifan@gmail.com",
  phone: "+14155550100",
  address: "475 Mission St, Suite 1200, San Francisco, CA 94105",
  socialLinks: {
    linkedin: "https://www.linkedin.com/company/sallify",
    twitter: "https://twitter.com/sallify",
    instagram: "https://instagram.com/sallify",
    facebook: "https://facebook.com/sallify",
  },
  socialIcons: {
    linkedin: storageUrl("media/branding/icon-linkedin.svg"),
    twitter: storageUrl("media/branding/icon-twitter.svg"),
    instagram: storageUrl("media/branding/icon-instagram.svg"),
    facebook: storageUrl("media/branding/icon-facebook.svg"),
  },
  branding: {
    logo: storageUrl("media/branding/logo-primary.svg"),
    favicon: storageUrl("media/branding/favicon.ico"),
    primaryColor: "#0B3D91",
    secondaryColor: "#F4B740",
  },
  openGraph: {
    defaultImage: storageUrl("media/branding/og-default.jpg"),
    twitterCardImage: storageUrl("media/branding/og-twitter.jpg"),
  },
  mediaRefs: {
    logoId: "media-brand-logo",
    faviconId: "media-brand-favicon",
    socialIconIds: {
      linkedin: "media-icon-linkedin",
      twitter: "media-icon-twitter",
      instagram: "media-icon-instagram",
      facebook: "media-icon-facebook",
    },
    openGraphIds: {
      default: "media-og-default",
      twitter: "media-og-twitter",
    },
  },
  status: "published",
  updatedAt: ts("2025-10-29T12:00:00Z"),
}

const footerLinks = [
  { id: "quick-home", category: "Quick Links", label: "Home", url: "/", order: 1, status: "published" },
  { id: "quick-services", category: "Quick Links", label: "Services", url: "/services", order: 2, status: "published" },
  { id: "quick-portfolio", category: "Quick Links", label: "Portfolio", url: "/portfolio", order: 3, status: "published" },
  { id: "quick-blog", category: "Quick Links", label: "Blog", url: "/blog", order: 4, status: "published" },
  { id: "quick-process", category: "Quick Links", label: "Process", url: "/process", order: 5, status: "published" },
  { id: "quick-contact", category: "Quick Links", label: "Contact", url: "/contact", order: 6, status: "published" },
  { id: "company-about", category: "Company", label: "About", url: "/about", order: 1, status: "published" },
  { id: "company-process", category: "Company", label: "Our Process", url: "/process", order: 2, status: "published" },
  { id: "company-contact", category: "Company", label: "Contact", url: "/contact", order: 3, status: "published" },
  { id: "services-web", category: "Services", label: "Web Development", url: "/services/web-development", order: 1, status: "published" },
  { id: "services-mobile", category: "Services", label: "Mobile Development", url: "/services/mobile-development", order: 2, status: "published" },
  { id: "services-seo", category: "Services", label: "SEO Optimization", url: "/services/seo-optimization", order: 3, status: "published" },
  { id: "resources-portfolio", category: "Resources", label: "Portfolio", url: "/portfolio", order: 1, status: "published" },
  { id: "resources-blog", category: "Resources", label: "Blog", url: "/blog", order: 2, status: "published" },
]

const footerContacts = {
  email: "nyagakasallifan@gmail.com",
  phone: "+1 415 555 0100",
  address: "475 Mission St, Suite 1200, San Francisco, CA 94105",
  contactText: "Need support? Reach us directly:",
  status: "published",
  updatedAt: ts("2025-11-20T14:00:00Z"),
}

const footerSocials = [
  {
    id: "social-whatsapp",
    platform: "WhatsApp",
    url: "https://wa.me/14155550100",
    iconUrl: storageUrl("media/contact/icon-whatsapp.svg"),
    order: 1,
    status: "published",
  },
  {
    id: "social-linkedin",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/sallify",
    iconUrl: storageUrl("media/branding/icon-linkedin.svg"),
    order: 2,
    status: "published",
  },
  {
    id: "social-facebook",
    platform: "Facebook",
    url: "https://facebook.com/sallify",
    iconUrl: storageUrl("media/branding/icon-facebook.svg"),
    order: 3,
    status: "published",
  },
  {
    id: "social-instagram",
    platform: "Instagram",
    url: "https://instagram.com/sallify",
    iconUrl: storageUrl("media/branding/icon-instagram.svg"),
    order: 4,
    status: "published",
  },
]

const footerCta = {
  title: "Have a product idea you want to launch fast?",
  subtitle:
    "Tell us what you are building and we will reply with a practical roadmap, timeline options, and recommended next steps.",
  buttonText: "Start Your Project",
  buttonLink: "/contact",
  status: "published",
  updatedAt: ts("2025-11-20T14:00:00Z"),
}

const footerLegal = [
  { id: "legal-privacy", label: "Privacy Policy", url: "/privacy", order: 1, status: "published" },
  { id: "legal-terms", label: "Terms of Service", url: "/terms", order: 2, status: "published" },
]

const mediaItems = [
  {
    id: "media-home-hero",
    fileName: "hero-sallify.png",
    url: storageUrl("media/home/hero-sallify.png"),
    folder: "home",
    altText: "Sallify Technologies hero banner",
    uploadedAt: ts("2025-09-15T10:30:00Z"),
    size: 548920,
    type: "image/png",
  },
  {
    id: "media-home-cta-background",
    fileName: "cta-background.jpg",
    url: storageUrl("media/home/cta-background.jpg"),
    folder: "home",
    altText: "Abstract CTA background texture",
    uploadedAt: ts("2025-09-18T10:30:00Z"),
    size: 512340,
    type: "image/jpeg",
  },
  {
    id: "media-brand-logo",
    fileName: "logo-primary.svg",
    url: storageUrl("media/branding/logo-primary.svg"),
    folder: "branding",
    altText: "Sallify Technologies primary logo",
    uploadedAt: ts("2025-09-01T12:00:00Z"),
    size: 32410,
    type: "image/svg+xml",
  },
  {
    id: "media-brand-favicon",
    fileName: "favicon.ico",
    url: storageUrl("media/branding/favicon.ico"),
    folder: "branding",
    altText: "Sallify Technologies favicon",
    uploadedAt: ts("2025-09-01T12:05:00Z"),
    size: 6420,
    type: "image/x-icon",
  },
  {
    id: "media-icon-linkedin",
    fileName: "icon-linkedin.svg",
    url: storageUrl("media/branding/icon-linkedin.svg"),
    folder: "branding",
    altText: "LinkedIn icon",
    uploadedAt: ts("2025-09-02T09:00:00Z"),
    size: 4020,
    type: "image/svg+xml",
  },
  {
    id: "media-icon-twitter",
    fileName: "icon-twitter.svg",
    url: storageUrl("media/branding/icon-twitter.svg"),
    folder: "branding",
    altText: "Twitter icon",
    uploadedAt: ts("2025-09-02T09:05:00Z"),
    size: 3980,
    type: "image/svg+xml",
  },
  {
    id: "media-icon-instagram",
    fileName: "icon-instagram.svg",
    url: storageUrl("media/branding/icon-instagram.svg"),
    folder: "branding",
    altText: "Instagram icon",
    uploadedAt: ts("2025-09-02T09:10:00Z"),
    size: 4120,
    type: "image/svg+xml",
  },
  {
    id: "media-icon-facebook",
    fileName: "icon-facebook.svg",
    url: storageUrl("media/branding/icon-facebook.svg"),
    folder: "branding",
    altText: "Facebook icon",
    uploadedAt: ts("2025-09-02T09:15:00Z"),
    size: 4010,
    type: "image/svg+xml",
  },
  {
    id: "media-og-default",
    fileName: "og-default.jpg",
    url: storageUrl("media/branding/og-default.jpg"),
    folder: "branding",
    altText: "Sallify Technologies default open graph image",
    uploadedAt: ts("2025-09-02T10:00:00Z"),
    size: 412330,
    type: "image/jpeg",
  },
  {
    id: "media-og-twitter",
    fileName: "og-twitter.jpg",
    url: storageUrl("media/branding/og-twitter.jpg"),
    folder: "branding",
    altText: "Sallify Technologies Twitter card image",
    uploadedAt: ts("2025-09-02T10:05:00Z"),
    size: 398120,
    type: "image/jpeg",
  },
  {
    id: "media-service-web-cover",
    fileName: "web-development-cover.jpg",
    url: storageUrl("media/services/web-development-cover.jpg"),
    folder: "services",
    altText: "Web development service cover",
    uploadedAt: ts("2025-08-10T09:00:00Z"),
    size: 402310,
    type: "image/jpeg",
  },
  {
    id: "media-service-web-1",
    fileName: "web-1.jpg",
    url: storageUrl("media/services/web-1.jpg"),
    folder: "services",
    altText: "Responsive website layout",
    uploadedAt: ts("2025-08-10T09:05:00Z"),
    size: 318210,
    type: "image/jpeg",
  },
  {
    id: "media-service-web-2",
    fileName: "web-2.jpg",
    url: storageUrl("media/services/web-2.jpg"),
    folder: "services",
    altText: "Web application dashboard",
    uploadedAt: ts("2025-08-10T09:10:00Z"),
    size: 301904,
    type: "image/jpeg",
  },
  {
    id: "media-service-mobile-cover",
    fileName: "mobile-development-cover.jpg",
    url: storageUrl("media/services/mobile-development-cover.jpg"),
    folder: "services",
    altText: "Mobile development service cover",
    uploadedAt: ts("2025-08-11T09:00:00Z"),
    size: 389220,
    type: "image/jpeg",
  },
  {
    id: "media-service-mobile-1",
    fileName: "mobile-1.jpg",
    url: storageUrl("media/services/mobile-1.jpg"),
    folder: "services",
    altText: "Mobile app onboarding screen",
    uploadedAt: ts("2025-08-11T09:05:00Z"),
    size: 264110,
    type: "image/jpeg",
  },
  {
    id: "media-service-mobile-2",
    fileName: "mobile-2.jpg",
    url: storageUrl("media/services/mobile-2.jpg"),
    folder: "services",
    altText: "Mobile app analytics view",
    uploadedAt: ts("2025-08-11T09:10:00Z"),
    size: 270845,
    type: "image/jpeg",
  },
  {
    id: "media-service-system-cover",
    fileName: "system-development-cover.jpg",
    url: storageUrl("media/services/system-development-cover.jpg"),
    folder: "services",
    altText: "System development service cover",
    uploadedAt: ts("2025-08-12T09:00:00Z"),
    size: 415980,
    type: "image/jpeg",
  },
  {
    id: "media-service-system-1",
    fileName: "system-1.jpg",
    url: storageUrl("media/services/system-1.jpg"),
    folder: "services",
    altText: "Operations dashboard interface",
    uploadedAt: ts("2025-08-12T09:05:00Z"),
    size: 332410,
    type: "image/jpeg",
  },
  {
    id: "media-service-system-2",
    fileName: "system-2.jpg",
    url: storageUrl("media/services/system-2.jpg"),
    folder: "services",
    altText: "Workflow automation view",
    uploadedAt: ts("2025-08-12T09:10:00Z"),
    size: 325900,
    type: "image/jpeg",
  },
  {
    id: "media-service-ui-cover",
    fileName: "ui-ux-cover.jpg",
    url: storageUrl("media/services/ui-ux-cover.jpg"),
    folder: "services",
    altText: "UI UX design service cover",
    uploadedAt: ts("2025-08-13T09:00:00Z"),
    size: 398400,
    type: "image/jpeg",
  },
  {
    id: "media-service-ui-1",
    fileName: "ui-1.jpg",
    url: storageUrl("media/services/ui-1.jpg"),
    folder: "services",
    altText: "Design system components",
    uploadedAt: ts("2025-08-13T09:05:00Z"),
    size: 246820,
    type: "image/jpeg",
  },
  {
    id: "media-service-ui-2",
    fileName: "ui-2.jpg",
    url: storageUrl("media/services/ui-2.jpg"),
    folder: "services",
    altText: "Prototype interaction flow",
    uploadedAt: ts("2025-08-13T09:10:00Z"),
    size: 258750,
    type: "image/jpeg",
  },
  {
    id: "media-service-graphics-cover",
    fileName: "graphics-cover.jpg",
    url: storageUrl("media/services/graphics-cover.jpg"),
    folder: "services",
    altText: "Graphics design service cover",
    uploadedAt: ts("2025-08-14T09:00:00Z"),
    size: 372300,
    type: "image/jpeg",
  },
  {
    id: "media-service-graphics-1",
    fileName: "graphics-1.jpg",
    url: storageUrl("media/services/graphics-1.jpg"),
    folder: "services",
    altText: "Brand illustration set",
    uploadedAt: ts("2025-08-14T09:05:00Z"),
    size: 241980,
    type: "image/jpeg",
  },
  {
    id: "media-service-graphics-2",
    fileName: "graphics-2.jpg",
    url: storageUrl("media/services/graphics-2.jpg"),
    folder: "services",
    altText: "Marketing banner concepts",
    uploadedAt: ts("2025-08-14T09:10:00Z"),
    size: 249660,
    type: "image/jpeg",
  },
  {
    id: "media-service-seo-cover",
    fileName: "seo-cover.jpg",
    url: storageUrl("media/services/seo-cover.jpg"),
    folder: "services",
    altText: "SEO optimization service cover",
    uploadedAt: ts("2025-08-15T09:00:00Z"),
    size: 368910,
    type: "image/jpeg",
  },
  {
    id: "media-service-seo-1",
    fileName: "seo-1.jpg",
    url: storageUrl("media/services/seo-1.jpg"),
    folder: "services",
    altText: "Search analytics dashboard",
    uploadedAt: ts("2025-08-15T09:05:00Z"),
    size: 257930,
    type: "image/jpeg",
  },
  {
    id: "media-service-seo-2",
    fileName: "seo-2.jpg",
    url: storageUrl("media/services/seo-2.jpg"),
    folder: "services",
    altText: "Keyword research overview",
    uploadedAt: ts("2025-08-15T09:10:00Z"),
    size: 261540,
    type: "image/jpeg",
  },
  {
    id: "media-service-cloud-cover",
    fileName: "cloud-cover.jpg",
    url: storageUrl("media/services/cloud-cover.jpg"),
    folder: "services",
    altText: "Cloud and DevOps service cover",
    uploadedAt: ts("2025-08-16T09:00:00Z"),
    size: 401230,
    type: "image/jpeg",
  },
  {
    id: "media-service-cloud-1",
    fileName: "cloud-1.jpg",
    url: storageUrl("media/services/cloud-1.jpg"),
    folder: "services",
    altText: "Deployment pipeline overview",
    uploadedAt: ts("2025-08-16T09:05:00Z"),
    size: 279880,
    type: "image/jpeg",
  },
  {
    id: "media-service-cloud-2",
    fileName: "cloud-2.jpg",
    url: storageUrl("media/services/cloud-2.jpg"),
    folder: "services",
    altText: "Infrastructure monitoring screen",
    uploadedAt: ts("2025-08-16T09:10:00Z"),
    size: 287450,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-fintrack-thumb",
    fileName: "fintrack-thumb.jpg",
    url: storageUrl("media/portfolio/fintrack-thumb.jpg"),
    folder: "portfolio",
    altText: "FinTrack dashboard preview",
    uploadedAt: ts("2025-08-20T13:45:00Z"),
    size: 312450,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-fintrack-cover",
    fileName: "fintrack-cover.jpg",
    url: storageUrl("media/portfolio/fintrack-cover.jpg"),
    folder: "portfolio",
    altText: "FinTrack platform full case study cover",
    uploadedAt: ts("2025-08-20T13:47:00Z"),
    size: 342110,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-fintrack-1",
    fileName: "fintrack-1.jpg",
    url: storageUrl("media/portfolio/fintrack-1.jpg"),
    folder: "portfolio",
    altText: "FinTrack analytics dashboard",
    uploadedAt: ts("2025-08-20T13:50:00Z"),
    size: 336210,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-fintrack-2",
    fileName: "fintrack-2.jpg",
    url: storageUrl("media/portfolio/fintrack-2.jpg"),
    folder: "portfolio",
    altText: "FinTrack reporting view",
    uploadedAt: ts("2025-08-20T13:55:00Z"),
    size: 329440,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-fleetflow-thumb",
    fileName: "fleetflow-thumb.jpg",
    url: storageUrl("media/portfolio/fleetflow-thumb.jpg"),
    folder: "portfolio",
    altText: "FleetFlow operations suite preview",
    uploadedAt: ts("2025-05-08T10:30:00Z"),
    size: 298210,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-fleetflow-cover",
    fileName: "fleetflow-cover.jpg",
    url: storageUrl("media/portfolio/fleetflow-cover.jpg"),
    folder: "portfolio",
    altText: "FleetFlow operations suite full case study cover",
    uploadedAt: ts("2025-05-08T10:32:00Z"),
    size: 319820,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-fleetflow-1",
    fileName: "fleetflow-1.jpg",
    url: storageUrl("media/portfolio/fleetflow-1.jpg"),
    folder: "portfolio",
    altText: "Fleet tracking map",
    uploadedAt: ts("2025-05-08T10:35:00Z"),
    size: 315890,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-fleetflow-2",
    fileName: "fleetflow-2.jpg",
    url: storageUrl("media/portfolio/fleetflow-2.jpg"),
    folder: "portfolio",
    altText: "Dispatcher dashboard",
    uploadedAt: ts("2025-05-08T10:40:00Z"),
    size: 306770,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-eduspark-thumb",
    fileName: "eduspark-thumb.jpg",
    url: storageUrl("media/portfolio/eduspark-thumb.jpg"),
    folder: "portfolio",
    altText: "EduSpark platform preview",
    uploadedAt: ts("2024-11-28T09:30:00Z"),
    size: 287330,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-eduspark-cover",
    fileName: "eduspark-cover.jpg",
    url: storageUrl("media/portfolio/eduspark-cover.jpg"),
    folder: "portfolio",
    altText: "EduSpark experience full case study cover",
    uploadedAt: ts("2024-11-28T09:32:00Z"),
    size: 292610,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-eduspark-1",
    fileName: "eduspark-1.jpg",
    url: storageUrl("media/portfolio/eduspark-1.jpg"),
    folder: "portfolio",
    altText: "Student dashboard",
    uploadedAt: ts("2024-11-28T09:35:00Z"),
    size: 301120,
    type: "image/jpeg",
  },
  {
    id: "media-portfolio-eduspark-2",
    fileName: "eduspark-2.jpg",
    url: storageUrl("media/portfolio/eduspark-2.jpg"),
    folder: "portfolio",
    altText: "Campus events timeline",
    uploadedAt: ts("2024-11-28T09:40:00Z"),
    size: 295910,
    type: "image/jpeg",
  },
  {
    id: "media-blog-scale",
    fileName: "scale.jpg",
    url: storageUrl("media/blog/scale.jpg"),
    folder: "blog",
    altText: "Abstract scale illustration",
    uploadedAt: ts("2025-07-10T08:00:00Z"),
    size: 285110,
    type: "image/jpeg",
  },
  {
    id: "media-blog-conversion",
    fileName: "conversion.jpg",
    url: storageUrl("media/blog/conversion.jpg"),
    folder: "blog",
    altText: "Conversion funnel diagram",
    uploadedAt: ts("2025-06-18T08:00:00Z"),
    size: 273880,
    type: "image/jpeg",
  },
  {
    id: "media-blog-seo",
    fileName: "seo.jpg",
    url: storageUrl("media/blog/seo.jpg"),
    folder: "blog",
    altText: "Search optimization illustration",
    uploadedAt: ts("2025-05-03T08:00:00Z"),
    size: 265410,
    type: "image/jpeg",
  },
  {
    id: "media-blog-discovery",
    fileName: "discovery.jpg",
    url: storageUrl("media/blog/discovery.jpg"),
    folder: "blog",
    altText: "Discovery workshop notes",
    uploadedAt: ts("2025-04-16T08:00:00Z"),
    size: 259330,
    type: "image/jpeg",
  },
  {
    id: "media-blog-design-systems",
    fileName: "design-systems.jpg",
    url: storageUrl("media/blog/design-systems.jpg"),
    folder: "blog",
    altText: "Design system components",
    uploadedAt: ts("2025-03-07T08:00:00Z"),
    size: 268020,
    type: "image/jpeg",
  },
  {
    id: "media-blog-legacy",
    fileName: "legacy.jpg",
    url: storageUrl("media/blog/legacy.jpg"),
    folder: "blog",
    altText: "Legacy systems illustration",
    uploadedAt: ts("2025-01-31T08:00:00Z"),
    size: 271540,
    type: "image/jpeg",
  },
  {
    id: "media-blog-author-amelia",
    fileName: "amelia-owusu.jpg",
    url: storageUrl("media/blog/authors/amelia-owusu.jpg"),
    folder: "blog/authors",
    altText: "Amelia Owusu portrait",
    uploadedAt: ts("2025-01-10T08:00:00Z"),
    size: 124220,
    type: "image/jpeg",
  },
  {
    id: "media-blog-author-daniel",
    fileName: "daniel-adegoke.jpg",
    url: storageUrl("media/blog/authors/daniel-adegoke.jpg"),
    folder: "blog/authors",
    altText: "Daniel Adegoke portrait",
    uploadedAt: ts("2025-01-10T08:05:00Z"),
    size: 121940,
    type: "image/jpeg",
  },
  {
    id: "media-blog-author-nana",
    fileName: "nana-baidoo.jpg",
    url: storageUrl("media/blog/authors/nana-baidoo.jpg"),
    folder: "blog/authors",
    altText: "Nana Baidoo portrait",
    uploadedAt: ts("2025-01-10T08:10:00Z"),
    size: 119880,
    type: "image/jpeg",
  },
  {
    id: "media-blog-author-default",
    fileName: "default-author.jpg",
    url: storageUrl("media/blog/authors/default-author.jpg"),
    folder: "blog/authors",
    altText: "Default blog author portrait",
    uploadedAt: ts("2025-01-10T08:15:00Z"),
    size: 118760,
    type: "image/jpeg",
  },
  {
    id: "media-blog-gallery-scale-1",
    fileName: "scale-1.jpg",
    url: storageUrl("media/blog/gallery/scale-1.jpg"),
    folder: "blog/gallery",
    altText: "Scaling architecture whiteboard",
    uploadedAt: ts("2025-07-10T08:05:00Z"),
    size: 252230,
    type: "image/jpeg",
  },
  {
    id: "media-blog-gallery-scale-2",
    fileName: "scale-2.jpg",
    url: storageUrl("media/blog/gallery/scale-2.jpg"),
    folder: "blog/gallery",
    altText: "Performance chart for scaling systems",
    uploadedAt: ts("2025-07-10T08:08:00Z"),
    size: 244980,
    type: "image/jpeg",
  },
  {
    id: "media-blog-gallery-conversion-1",
    fileName: "conversion-1.jpg",
    url: storageUrl("media/blog/gallery/conversion-1.jpg"),
    folder: "blog/gallery",
    altText: "Conversion journey wireframe",
    uploadedAt: ts("2025-06-18T08:05:00Z"),
    size: 236740,
    type: "image/jpeg",
  },
  {
    id: "media-blog-gallery-conversion-2",
    fileName: "conversion-2.jpg",
    url: storageUrl("media/blog/gallery/conversion-2.jpg"),
    folder: "blog/gallery",
    altText: "B2B onboarding conversion metrics",
    uploadedAt: ts("2025-06-18T08:08:00Z"),
    size: 240510,
    type: "image/jpeg",
  },
  {
    id: "media-blog-gallery-seo-1",
    fileName: "seo-1.jpg",
    url: storageUrl("media/blog/gallery/seo-1.jpg"),
    folder: "blog/gallery",
    altText: "SEO content architecture map",
    uploadedAt: ts("2025-05-03T08:05:00Z"),
    size: 229870,
    type: "image/jpeg",
  },
  {
    id: "media-blog-gallery-seo-2",
    fileName: "seo-2.jpg",
    url: storageUrl("media/blog/gallery/seo-2.jpg"),
    folder: "blog/gallery",
    altText: "Organic growth analytics report",
    uploadedAt: ts("2025-05-03T08:08:00Z"),
    size: 233300,
    type: "image/jpeg",
  },
  {
    id: "media-process-hero",
    fileName: "process-hero.jpg",
    url: storageUrl("media/process/process-hero.jpg"),
    folder: "process",
    altText: "Sallify process hero background",
    uploadedAt: ts("2025-10-20T09:00:00Z"),
    size: 284300,
    type: "image/jpeg",
  },
  {
    id: "media-process-discovery",
    fileName: "discovery.jpg",
    url: storageUrl("media/process/discovery.jpg"),
    folder: "process",
    altText: "Discovery workshop icon image",
    uploadedAt: ts("2025-10-20T09:05:00Z"),
    size: 120400,
    type: "image/jpeg",
  },
  {
    id: "media-process-planning",
    fileName: "planning.jpg",
    url: storageUrl("media/process/planning.jpg"),
    folder: "process",
    altText: "Planning icon image",
    uploadedAt: ts("2025-10-20T09:10:00Z"),
    size: 118730,
    type: "image/jpeg",
  },
  {
    id: "media-process-design",
    fileName: "design.jpg",
    url: storageUrl("media/process/design.jpg"),
    folder: "process",
    altText: "Design icon image",
    uploadedAt: ts("2025-10-20T09:15:00Z"),
    size: 117910,
    type: "image/jpeg",
  },
  {
    id: "media-process-development",
    fileName: "development.jpg",
    url: storageUrl("media/process/development.jpg"),
    folder: "process",
    altText: "Development icon image",
    uploadedAt: ts("2025-10-20T09:20:00Z"),
    size: 121550,
    type: "image/jpeg",
  },
  {
    id: "media-process-testing",
    fileName: "testing.jpg",
    url: storageUrl("media/process/testing.jpg"),
    folder: "process",
    altText: "Testing icon image",
    uploadedAt: ts("2025-10-20T09:25:00Z"),
    size: 119400,
    type: "image/jpeg",
  },
  {
    id: "media-process-deployment",
    fileName: "deployment.jpg",
    url: storageUrl("media/process/deployment.jpg"),
    folder: "process",
    altText: "Deployment icon image",
    uploadedAt: ts("2025-10-20T09:30:00Z"),
    size: 116850,
    type: "image/jpeg",
  },
  {
    id: "media-process-maintenance",
    fileName: "maintenance.jpg",
    url: storageUrl("media/process/maintenance.jpg"),
    folder: "process",
    altText: "Maintenance icon image",
    uploadedAt: ts("2025-10-20T09:35:00Z"),
    size: 115900,
    type: "image/jpeg",
  },
  {
    id: "media-testimonial-sarah",
    fileName: "sarah-johnson.jpg",
    url: storageUrl("media/testimonials/sarah-johnson.jpg"),
    folder: "testimonials",
    altText: "Sarah Johnson headshot",
    uploadedAt: ts("2025-07-01T08:00:00Z"),
    size: 189230,
    type: "image/jpeg",
  },
  {
    id: "media-testimonial-michael",
    fileName: "michael-adeleke.jpg",
    url: storageUrl("media/testimonials/michael-adeleke.jpg"),
    folder: "testimonials",
    altText: "Michael Adeleke headshot",
    uploadedAt: ts("2025-06-15T08:00:00Z"),
    size: 182450,
    type: "image/jpeg",
  },
  {
    id: "media-testimonial-lina",
    fileName: "lina-patel.jpg",
    url: storageUrl("media/testimonials/lina-patel.jpg"),
    folder: "testimonials",
    altText: "Lina Patel headshot",
    uploadedAt: ts("2024-11-20T08:00:00Z"),
    size: 176980,
    type: "image/jpeg",
  },
  {
    id: "media-team-amelia",
    fileName: "amelia-owusu.jpg",
    url: storageUrl("media/team/amelia-owusu.jpg"),
    folder: "team",
    altText: "Amelia Owusu headshot",
    uploadedAt: ts("2025-09-01T08:00:00Z"),
    size: 194220,
    type: "image/jpeg",
  },
  {
    id: "media-team-daniel",
    fileName: "daniel-adegoke.jpg",
    url: storageUrl("media/team/daniel-adegoke.jpg"),
    folder: "team",
    altText: "Daniel Adegoke headshot",
    uploadedAt: ts("2025-09-01T08:05:00Z"),
    size: 188410,
    type: "image/jpeg",
  },
  {
    id: "media-team-nana",
    fileName: "nana-baidoo.jpg",
    url: storageUrl("media/team/nana-baidoo.jpg"),
    folder: "team",
    altText: "Nana Baidoo headshot",
    uploadedAt: ts("2025-09-01T08:10:00Z"),
    size: 182960,
    type: "image/jpeg",
  },
  {
    id: "media-about-hero",
    fileName: "about-hero.jpg",
    url: storageUrl("media/about/about-hero.jpg"),
    folder: "about",
    altText: "Sallify Technologies team collaboration session",
    uploadedAt: ts("2025-10-01T11:00:00Z"),
    size: 356720,
    type: "image/jpeg",
  },
  {
    id: "media-about-cta",
    fileName: "about-cta.jpg",
    url: storageUrl("media/about/about-cta.jpg"),
    folder: "about",
    altText: "Professional team standing by for project kickoff",
    uploadedAt: ts("2025-10-01T11:05:00Z"),
    size: 322480,
    type: "image/jpeg",
  },
  {
    id: "media-cert-google-cloud",
    fileName: "google-cloud-partner.svg",
    url: storageUrl("media/about/certs/google-cloud-partner.svg"),
    folder: "about/certs",
    altText: "Google Cloud Partner badge",
    uploadedAt: ts("2025-10-02T08:00:00Z"),
    size: 12120,
    type: "image/svg+xml",
  },
  {
    id: "media-cert-aws",
    fileName: "aws-practitioner.svg",
    url: storageUrl("media/about/certs/aws-practitioner.svg"),
    folder: "about/certs",
    altText: "AWS practitioner badge",
    uploadedAt: ts("2025-10-02T08:05:00Z"),
    size: 10420,
    type: "image/svg+xml",
  },
  {
    id: "media-cert-scrum",
    fileName: "professional-scrum.svg",
    url: storageUrl("media/about/certs/professional-scrum.svg"),
    folder: "about/certs",
    altText: "Professional Scrum badge",
    uploadedAt: ts("2025-10-02T08:10:00Z"),
    size: 11040,
    type: "image/svg+xml",
  },
  {
    id: "media-cert-meta-ux",
    fileName: "meta-ux-design.svg",
    url: storageUrl("media/about/certs/meta-ux-design.svg"),
    folder: "about/certs",
    altText: "Meta UX Design badge",
    uploadedAt: ts("2025-10-02T08:15:00Z"),
    size: 10060,
    type: "image/svg+xml",
  },
  {
    id: "media-client-fintrack-logo",
    fileName: "fintrack-logo.svg",
    url: storageUrl("media/about/clients/fintrack-logo.svg"),
    folder: "about/clients",
    altText: "FinTrack client logo",
    uploadedAt: ts("2025-10-03T09:00:00Z"),
    size: 9020,
    type: "image/svg+xml",
  },
  {
    id: "media-client-fleetflow-logo",
    fileName: "fleetflow-logo.svg",
    url: storageUrl("media/about/clients/fleetflow-logo.svg"),
    folder: "about/clients",
    altText: "FleetFlow client logo",
    uploadedAt: ts("2025-10-03T09:05:00Z"),
    size: 9340,
    type: "image/svg+xml",
  },
  {
    id: "media-client-eduspark-logo",
    fileName: "eduspark-logo.svg",
    url: storageUrl("media/about/clients/eduspark-logo.svg"),
    folder: "about/clients",
    altText: "EduSpark client logo",
    uploadedAt: ts("2025-10-03T09:10:00Z"),
    size: 8900,
    type: "image/svg+xml",
  },
  {
    id: "media-client-brightline-logo",
    fileName: "brightline-logo.svg",
    url: storageUrl("media/about/clients/brightline-logo.svg"),
    folder: "about/clients",
    altText: "Brightline client logo",
    uploadedAt: ts("2025-10-03T09:15:00Z"),
    size: 9140,
    type: "image/svg+xml",
  },
  {
    id: "media-client-nexuscare-logo",
    fileName: "nexuscare-logo.svg",
    url: storageUrl("media/about/clients/nexuscare-logo.svg"),
    folder: "about/clients",
    altText: "NexusCare client logo",
    uploadedAt: ts("2025-10-03T09:20:00Z"),
    size: 9280,
    type: "image/svg+xml",
  },
  {
    id: "media-client-veridian-logo",
    fileName: "veridian-logo.svg",
    url: storageUrl("media/about/clients/veridian-logo.svg"),
    folder: "about/clients",
    altText: "Veridian Systems client logo",
    uploadedAt: ts("2025-10-03T09:25:00Z"),
    size: 9450,
    type: "image/svg+xml",
  },
  {
    id: "media-user-amelia-admin",
    fileName: "amelia-admin.jpg",
    url: storageUrl("media/users/amelia-admin.jpg"),
    folder: "users",
    altText: "Amelia Owusu admin avatar",
    uploadedAt: ts("2025-10-10T08:00:00Z"),
    size: 158450,
    type: "image/jpeg",
  },
  {
    id: "media-user-chinedu-editor",
    fileName: "chinedu-editor.jpg",
    url: storageUrl("media/users/chinedu-editor.jpg"),
    folder: "users",
    altText: "Chinedu Okafor editor avatar",
    uploadedAt: ts("2025-10-10T08:05:00Z"),
    size: 161220,
    type: "image/jpeg",
  },
  {
    id: "media-contact-icon-email",
    fileName: "icon-email.svg",
    url: storageUrl("media/contact/icon-email.svg"),
    folder: "contact",
    altText: "Email icon",
    uploadedAt: ts("2025-10-01T08:00:00Z"),
    size: 4020,
    type: "image/svg+xml",
  },
  {
    id: "media-contact-icon-whatsapp",
    fileName: "icon-whatsapp.svg",
    url: storageUrl("media/contact/icon-whatsapp.svg"),
    folder: "contact",
    altText: "WhatsApp icon",
    uploadedAt: ts("2025-10-01T08:05:00Z"),
    size: 4080,
    type: "image/svg+xml",
  },
  {
    id: "media-contact-icon-phone",
    fileName: "icon-phone.svg",
    url: storageUrl("media/contact/icon-phone.svg"),
    folder: "contact",
    altText: "Phone icon",
    uploadedAt: ts("2025-10-01T08:07:00Z"),
    size: 3920,
    type: "image/svg+xml",
  },
  {
    id: "media-contact-icon-telegram",
    fileName: "icon-telegram.svg",
    url: storageUrl("media/contact/icon-telegram.svg"),
    folder: "contact",
    altText: "Telegram icon",
    uploadedAt: ts("2025-10-01T08:10:00Z"),
    size: 3990,
    type: "image/svg+xml",
  },
]

async function seed() {
  console.log("Starting Firestore seed...")
  const batch = writeBatch(firestore)

  console.log("Seeding homepage content...")
  batch.set(doc(firestore, "homepage", "hero"), homepageHero, { merge: true })
  batch.set(doc(firestore, "homepage", "cta"), homepageCta, { merge: true })
  batch.set(doc(firestore, "homepage", "main"), homepageMain, { merge: true })

  console.log("Seeding about page content...")
  batch.set(doc(firestore, "about", "company"), aboutCompany, { merge: true })
  for (const member of teamMembers) {
    batch.set(
      doc(firestore, "about", "company", "teamMembers", member.id),
      member,
      { merge: true }
    )
  }
  batch.set(doc(firestore, "aboutPage", "hero"), aboutPageHero, { merge: true })
  batch.set(doc(firestore, "aboutPage", "journey"), aboutPageJourney, { merge: true })
  batch.set(doc(firestore, "aboutPage", "values"), aboutPageValuesMeta, { merge: true })
  batch.set(doc(firestore, "aboutPage", "different"), aboutPageDifferent, { merge: true })
  batch.set(doc(firestore, "aboutPage", "team"), aboutPageTeamMeta, { merge: true })
  batch.set(doc(firestore, "aboutPage", "companyStats"), aboutPageCompanyStatsMeta, { merge: true })
  batch.set(doc(firestore, "aboutPage", "certifications"), aboutPageCertificationsMeta, { merge: true })
  batch.set(doc(firestore, "aboutPage", "clients"), aboutPageClientsMeta, { merge: true })
  batch.set(doc(firestore, "aboutPage", "testimonials"), aboutPageTestimonialsMeta, { merge: true })
  batch.set(doc(firestore, "aboutPage", "cta"), aboutPageCta, { merge: true })

  console.log("Seeding about collections...")
  for (const member of aboutTeamCollection) {
    const teamPayload = {
      ...member,
      createdAt: createdAtBase,
      updatedAt: updatedAtBase,
    }
    batch.set(doc(firestore, "team", member.id), teamPayload, { merge: true })
  }
  for (const stat of companyStats) {
    const statsPayload = {
      ...stat,
      createdAt: createdAtBase,
      updatedAt: updatedAtBase,
    }
    batch.set(doc(firestore, "companyStats", stat.id), statsPayload, { merge: true })
  }
  for (const value of values) {
    const valuePayload = {
      ...value,
      createdAt: createdAtBase,
      updatedAt: updatedAtBase,
    }
    batch.set(doc(firestore, "values", value.id), valuePayload, { merge: true })
  }
  for (const cert of certifications) {
    const certPayload = {
      ...cert,
      createdAt: createdAtBase,
      updatedAt: updatedAtBase,
    }
    batch.set(doc(firestore, "certifications", cert.id), certPayload, { merge: true })
  }
  for (const client of clients) {
    const clientPayload = {
      ...client,
      createdAt: createdAtBase,
      updatedAt: updatedAtBase,
    }
    batch.set(doc(firestore, "clients", client.id), clientPayload, { merge: true })
  }

  console.log("Seeding services...")
  for (const service of servicesWithCmsDetail) {
  const servicePayload = {
    ...service,
    createdAt: createdAtBase,
    updatedAt: updatedAtBase,
  }
  batch.set(doc(firestore, "services", service.id), servicePayload, {
    merge: true,
  })
  }

  console.log("Seeding portfolio...")
  for (const item of portfolioItems) {
    const portfolioPayload = buildPortfolioProject(item)
    batch.set(doc(firestore, "portfolio", item.id), portfolioPayload, {
      merge: true,
    })
    batch.set(doc(firestore, "portfolio_projects", item.id), portfolioPayload, {
      merge: true,
    })
  }

  console.log("Seeding blog posts...")
  for (let index = 0; index < blogPosts.length; index += 1) {
    const post = blogPosts[index]
    const blogPayload = {
      ...buildBlogPost(post),
      order: index + 1,
      createdAt: createdAtBase,
      updatedAt: updatedAtBase,
    }
    batch.set(doc(firestore, "blogs", post.id), blogPayload, { merge: true })
  }

  console.log("Seeding process steps...")
  for (const step of processSteps) {
    const processPayload = {
      ...step,
      createdAt: createdAtBase,
      updatedAt: updatedAtBase,
    }
    batch.set(doc(firestore, "process", step.id), processPayload, {
      merge: true,
    })
  }
  batch.set(doc(firestore, "processPage", "hero"), processPageHero, { merge: true })
  batch.set(doc(firestore, "processPage", "why"), processPageWhy, { merge: true })
  batch.set(doc(firestore, "processPage", "cta"), processPageCta, { merge: true })
  for (const faq of processFaqs) {
    batch.set(doc(firestore, "processFaqs", faq.id), faq, { merge: true })
  }

  console.log("Seeding testimonials...")
  for (const testimonial of testimonials) {
    const testimonialPayload = {
      ...testimonial,
      createdAt: createdAtBase,
      updatedAt: updatedAtBase,
      created_at: createdAtBase,
      updated_at: updatedAtBase,
    }
    batch.set(
      doc(firestore, "testimonials", testimonial.id),
      testimonialPayload,
      { merge: true }
    )
  }

  console.log("Seeding testimonial submissions...")
  for (const submission of testimonialSubmissions) {
    batch.set(doc(firestore, "testimonial_submissions", submission.id), submission, {
      merge: true,
    })
  }

  console.log("Seeding contact submissions...")
  for (const contact of contacts) {
    batch.set(doc(firestore, "contacts", contact.id), contact, { merge: true })
  }
  for (const contactSubmission of contactSubmissions) {
    batch.set(
      doc(firestore, "contact_submissions", contactSubmission.id),
      contactSubmission,
      { merge: true }
    )
  }

  console.log("Seeding contact methods...")
  for (const method of contactMethods) {
    batch.set(doc(firestore, "contact_methods", method.id), method, { merge: true })
  }

  console.log("Seeding static pages SEO...")
  for (const page of staticPagesSeo) {
    batch.set(doc(firestore, "static_pages", page.id), {
      ...page,
      updatedAt: updatedAtBase,
    }, { merge: true })
  }

  console.log("Seeding admin users...")
  for (const user of users) {
    batch.set(doc(firestore, "users", user.id), user, { merge: true })
  }

  console.log("Seeding settings...")
  batch.set(doc(firestore, "settings", "site"), settingsSite, { merge: true })

  console.log("Seeding footer content...")
  for (const link of footerLinks) {
    batch.set(doc(firestore, "footer_links", link.id), link, { merge: true })
  }
  batch.set(doc(firestore, "footer_contacts", "primary"), footerContacts, { merge: true })
  for (const social of footerSocials) {
    batch.set(doc(firestore, "footer_socials", social.id), social, { merge: true })
  }
  batch.set(doc(firestore, "footer_cta", "cta"), footerCta, { merge: true })
  for (const legal of footerLegal) {
    batch.set(doc(firestore, "footer_legal", legal.id), legal, { merge: true })
  }

  console.log("Seeding media library...")
  for (const media of mediaItems) {
    batch.set(doc(firestore, "media", media.id), media, { merge: true })
  }

  await batch.commit()
  console.log("Firestore seed completed successfully.")
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Firestore seed failed:", error)
    process.exit(1)
  })
