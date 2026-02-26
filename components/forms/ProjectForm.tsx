"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import { collection, doc, getDocs, onSnapshot, query, where } from "firebase/firestore"
import { z } from "zod"
import { ProjectFormContext } from "@/context/ProjectFormContext"
import StepProgress from "@/components/forms/StepProgress"
import { ProjectFormValues, ServiceOption } from "@/components/forms/types"
import { firestore } from "@/lib/firebase"
import { submitProjectRequest } from "@/lib/firebase/submitProject"

const StepClientInfo = dynamic(() => import("@/components/forms/StepClientInfo"))
const StepProjectOverview = dynamic(() => import("@/components/forms/StepProjectOverview"))
const StepProjectDetails = dynamic(() => import("@/components/forms/StepProjectDetails"))
const StepBudgetTimeline = dynamic(() => import("@/components/forms/StepBudgetTimeline"))
const StepTechnicalPreferences = dynamic(() => import("@/components/forms/StepTechnicalPreferences"))
const StepUpload = dynamic(() => import("@/components/forms/StepUpload"))
const StepReviewSubmit = dynamic(() => import("@/components/forms/StepReviewSubmit"))

const schema = z.object({
  client_info: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(5, "Phone is required"),
    company: z.string().min(2, "Company is required"),
    country: z.string().min(2, "Country is required"),
    timezone: z.string().min(2, "Timezone is required"),
  }),
  communication_preference: z
    .enum(["", "WhatsApp", "Email", "Phone", "Video Call"])
    .refine((value) => value !== "", "Preferred contact method is required"),
  project_overview: z.object({
    title: z.string().min(2, "Project title is required"),
    type: z.string().min(2, "Project type is required"),
    service_id: z.string().optional().default(""),
    summary: z.string().min(10, "Summary is required"),
    is_redesign: z
      .enum(["", "new", "redesign"])
      .refine((value) => value !== "", "Select new project or redesign"),
  }),
  requirements: z.object({
    description: z.string().min(20, "Detailed description is required"),
    features: z.array(z.string()).optional().default([]),
    target_audience: z.string().min(2, "Target audience is required"),
    goals: z.string().min(2, "Business goals are required"),
    examples: z.string().optional().default(""),
    has_branding: z
      .enum(["", "yes", "no"])
      .refine((value) => value !== "", "Select whether branding exists"),
    website_pages: z.number().optional(),
    website_needs_cms: z.enum(["yes", "no", ""]).optional(),
    mobile_platform: z.enum(["android", "ios", "both", ""]).optional(),
    system_integrations: z.string().optional(),
  }),
  budget: z.object({
    range: z
      .enum(["", "under_500", "500_1500", "1500_5000", "5000_plus", "custom"])
      .refine((value) => value !== "", "Budget range is required"),
    currency: z.enum(["KES", "USD"]),
    start_date: z.string().min(1, "Start date is required"),
    deadline: z.string().min(1, "Deadline is required"),
    flexible: z.enum(["", "yes", "no"]).refine((value) => value !== "", "Select flexible timeline"),
    urgent: z.enum(["", "yes", "no"]).refine((value) => value !== "", "Select urgent status"),
    custom_amount: z.string().optional(),
  }),
  preferences: z.object({
    style: z
      .enum(["", "modern", "corporate", "minimal", "creative", "luxury"])
      .refine((value) => value !== "", "Preferred style is required"),
    branding: z.enum(["", "yes", "no"]).refine((value) => value !== "", "Select branding help"),
    hosting: z.enum(["", "yes", "no"]).refine((value) => value !== "", "Select hosting need"),
    maintenance: z
      .enum(["", "yes", "no"])
      .refine((value) => value !== "", "Select maintenance need"),
    accessibility: z.string().optional().default(""),
    seo: z.enum(["", "yes", "no"]).refine((value) => value !== "", "Select SEO requirement"),
  }),
  agreements: z.object({
    complexity_timeline: z.boolean(),
    provide_materials: z.boolean(),
    pricing_varies: z.boolean(),
  }).refine((value) => value.complexity_timeline && value.provide_materials && value.pricing_varies, {
    message: "All agreement checkboxes are required",
    path: ["complexity_timeline"],
  }),
})

type ProjectFormProps = {
  className?: string
  title?: string
  description?: string
  defaultProjectType?: string
  submitLabel?: string
  formId?: string
}

const totalSteps = 7

const stepValidationFields: Array<Array<keyof ProjectFormValues | string>> = [
  [
    "client_info.name",
    "client_info.email",
    "client_info.phone",
    "client_info.company",
    "client_info.country",
    "client_info.timezone",
    "communication_preference",
  ],
  ["project_overview.title", "project_overview.type", "project_overview.summary", "project_overview.is_redesign"],
  ["requirements.description", "requirements.target_audience", "requirements.goals", "requirements.has_branding"],
  ["budget.range", "budget.start_date", "budget.deadline", "budget.flexible", "budget.urgent"],
  ["preferences.style", "preferences.branding", "preferences.hosting", "preferences.maintenance", "preferences.seo"],
  [],
  ["agreements.complexity_timeline", "agreements.provide_materials", "agreements.pricing_varies"],
]

function formatStatusLabel(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeTel(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  return trimmed.replace(/\s+/g, "")
}

function normalizeWhatsApp(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "")
  if (!digits) return ""
  if (digits.startsWith("+")) return digits.slice(1)
  if (digits.startsWith("00")) return digits.slice(2)
  return digits
}

export default function ProjectForm({
  className,
  title = "Start Your Project",
  description = "Complete this onboarding form and we will respond with timeline, scope, and proposal details.",
  defaultProjectType,
  submitLabel = "Start My Project",
  formId = "contact-form",
}: ProjectFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [successId, setSuccessId] = useState("")
  const [error, setError] = useState("")
  const [isNavigatingStep, setIsNavigatingStep] = useState(false)
  const [supportPhone, setSupportPhone] = useState("")
  const [supportWhatsApp, setSupportWhatsApp] = useState("")
  const shouldScrollOnStepChangeRef = useRef(false)

  const methods = useForm<ProjectFormValues>({
    resolver: zodResolver(schema) as never,
    mode: "onTouched",
    defaultValues: {
      client_info: {
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "",
        timezone: "",
      },
      communication_preference: "",
      project_overview: {
        title: "",
        type: defaultProjectType || "",
        service_id: "",
        summary: "",
        is_redesign: "",
      },
      requirements: {
        description: "",
        features: [],
        target_audience: "",
        goals: "",
        examples: "",
        has_branding: "",
        website_pages: undefined,
        website_needs_cms: "",
        mobile_platform: "",
        system_integrations: "",
      },
      budget: {
        range: "",
        currency: "KES",
        start_date: "",
        deadline: "",
        flexible: "",
        urgent: "",
        custom_amount: "",
      },
      preferences: {
        style: "",
        branding: "",
        hosting: "",
        maintenance: "",
        accessibility: "",
        seo: "",
      },
      agreements: {
        complexity_timeline: false,
        provide_materials: false,
        pricing_varies: false,
      },
    },
  })

  useEffect(() => {
    let mounted = true

    async function loadServiceOptions() {
      const servicesRef = query(collection(firestore, "services"), where("status", "==", "published"))
      const snapshot = await getDocs(servicesRef)
      const options = snapshot.docs
        .map((docItem) => {
          const data = docItem.data() as Record<string, unknown>
          return {
            id: docItem.id,
            label: String(data.title || "").trim(),
            category: String(data.category || "").trim(),
          }
        })
        .filter((item) => item.label)
        .sort((a, b) => a.label.localeCompare(b.label))

      if (!mounted) return
      setServiceOptions(options)
    }

    loadServiceOptions().catch(() => {
      if (!mounted) return
      setServiceOptions([])
    })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let methodsData: Record<string, unknown>[] = []
    let settingsData: Record<string, unknown> = {}

    const applySupportContacts = () => {
      const activeMethods = methodsData.filter((item) => item.active !== false)
      const phoneFromMethods = String(
        activeMethods.find((item) => String(item.platform || "").toLowerCase() === "phone")?.value || ""
      ).trim()
      const whatsappFromMethods = String(
        activeMethods.find((item) => String(item.platform || "").toLowerCase() === "whatsapp")?.value || ""
      ).trim()
      const fallbackPhone = String(settingsData.phone || "").trim()

      setSupportPhone(phoneFromMethods || whatsappFromMethods || fallbackPhone)
      setSupportWhatsApp(whatsappFromMethods || phoneFromMethods || fallbackPhone)
    }

    const unsubMethods = onSnapshot(
      query(collection(firestore, "contact_methods")),
      (snapshot) => {
        methodsData = snapshot.docs.map((item) => item.data() as Record<string, unknown>)
        applySupportContacts()
      },
      () => {
        methodsData = []
        applySupportContacts()
      }
    )

    const unsubSettings = onSnapshot(
      doc(firestore, "settings", "site"),
      (snapshot) => {
        settingsData = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : {}
        applySupportContacts()
      },
      () => {
        settingsData = {}
        applySupportContacts()
      }
    )

    return () => {
      unsubMethods()
      unsubSettings()
    }
  }, [])

  const stepComponent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <StepClientInfo />
      case 2:
        return <StepProjectOverview serviceOptions={serviceOptions} />
      case 3:
        return <StepProjectDetails />
      case 4:
        return <StepBudgetTimeline />
      case 5:
        return <StepTechnicalPreferences />
      case 6:
        return (
          <StepUpload
            files={files}
            onAddFiles={(nextFiles) => {
              if (!nextFiles?.length) return
              setFiles((prev) => [...prev, ...Array.from(nextFiles)])
            }}
            onRemoveFile={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
            uploadProgress={uploadProgress}
            uploading={submitting}
          />
        )
      case 7:
        return <StepReviewSubmit />
      default:
        return null
    }
  }, [currentStep, files, serviceOptions, submitting, uploadProgress])

  const telHref = supportPhone ? `tel:${normalizeTel(supportPhone)}` : ""
  const whatsappHref = supportWhatsApp ? `https://wa.me/${normalizeWhatsApp(supportWhatsApp)}` : ""

  const goToStep = (step: number, scrollToForm = true) => {
    shouldScrollOnStepChangeRef.current = scrollToForm
    setCurrentStep(Math.max(1, Math.min(totalSteps, step)))
  }

  const handleNext = async () => {
    setIsNavigatingStep(true)
    const isValid = await methods.trigger(stepValidationFields[currentStep - 1] as never, { shouldFocus: true })
    if (!isValid) {
      setIsNavigatingStep(false)
      return
    }
    goToStep(currentStep + 1, true)
    setIsNavigatingStep(false)
  }

  const handleBack = () => goToStep(currentStep - 1, true)

  useEffect(() => {
    if (!shouldScrollOnStepChangeRef.current) {
      return
    }
    shouldScrollOnStepChangeRef.current = false
    const el = document.getElementById(formId)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [currentStep, formId])

  const onSubmit = methods.handleSubmit(async (values) => {
    setError("")
    setSubmitting(true)
    setUploadProgress(0)

    try {
      const result = await submitProjectRequest(
        {
          client_info: values.client_info,
          project_overview: {
            title: values.project_overview.title,
            type: values.project_overview.type,
            service_id: values.project_overview.service_id || "",
            summary: values.project_overview.summary,
            is_redesign: values.project_overview.is_redesign === "redesign",
          },
          requirements: {
            description: values.requirements.description,
            features: values.requirements.features || [],
            target_audience: values.requirements.target_audience,
            goals: values.requirements.goals,
            examples: values.requirements.examples,
            has_branding: values.requirements.has_branding === "yes",
            website_pages: values.requirements.website_pages,
            website_needs_cms: values.requirements.website_needs_cms === "yes",
            mobile_platform: values.requirements.mobile_platform,
            system_integrations: values.requirements.system_integrations,
          },
          budget: {
            range: formatStatusLabel(values.budget.range),
            currency: values.budget.currency,
            start_date: values.budget.start_date,
            deadline: values.budget.deadline,
            flexible: values.budget.flexible === "yes",
            urgent: values.budget.urgent === "yes",
            custom_amount: values.budget.custom_amount || "",
          },
          preferences: {
            style: formatStatusLabel(values.preferences.style),
            branding: values.preferences.branding === "yes",
            hosting: values.preferences.hosting === "yes",
            maintenance: values.preferences.maintenance === "yes",
            seo: values.preferences.seo === "yes",
            accessibility: values.preferences.accessibility,
          },
          communication_preference: values.communication_preference,
          agreements: values.agreements,
        },
        files,
        setUploadProgress
      )

      methods.reset()
      setFiles([])
      setSuccessId(result.submissionId)
      goToStep(1, false)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit project request")
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <ProjectFormContext.Provider
      value={{
        currentStep,
        totalSteps,
        goNext: handleNext,
        goBack: handleBack,
        goToStep,
      }}
    >
      <FormProvider {...methods}>
        <form
          id={formId}
          onSubmit={onSubmit}
          className={`scroll-mt-28 space-y-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm sm:p-8 ${className || ""}`}
        >
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-heading)]">{title}</h2>
            <p className="mt-2 text-sm text-[var(--color-body)]">{description}</p>
            {supportPhone ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-section-alt)] px-3 py-2">
                <p className="text-sm font-medium text-[var(--color-body)]">Need any assistance?</p>
                <a
                  href={telHref}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-footer)] px-3 py-1.5 text-xs font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)]"
                >
                  Call us
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-heading)]"
                >
                  WhatsApp us
                </a>
              </div>
            ) : null}
          </div>

          <StepProgress currentStep={currentStep} totalSteps={totalSteps} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-4 sm:p-5"
            >
              {stepComponent}
            </motion.div>
          </AnimatePresence>

          <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-3 shadow-lg">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || submitting}
              className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-primary)] disabled:opacity-50"
            >
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting || isNavigatingStep}
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)] transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                {submitting ? "Submitting..." : submitLabel}
              </button>
            )}
          </div>

          {successId ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4"
            >
              <p className="text-sm font-semibold text-emerald-600">Request submitted successfully.</p>
              <p className="text-xs text-[var(--color-body)]">Reference ID: {successId}</p>
            </motion.div>
          ) : null}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </form>
      </FormProvider>
    </ProjectFormContext.Provider>
  )
}
