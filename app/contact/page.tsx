import type { Metadata } from "next"
import ContactHero from "@/components/contact/ContactHero"
import ProjectForm from "@/components/forms/ProjectForm"
import ContactMethodsGrid from "@/components/contact/ContactMethodsGrid"
import ContactCTA from "@/components/contact/ContactCTA"
import { getContactMethods } from "@/lib/firestore/getContactData"

export const metadata: Metadata = {
  title: "Contact | Sallify Technologies",
  description: "Get in touch with Sallify Technologies to discuss your project and delivery goals.",
}

export const revalidate = 120

export default async function ContactPage() {
  const methods = await getContactMethods()

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div id="contact-hero">
          <ContactHero />
        </div>

        <div id="contact-form-section">
          <ProjectForm
            title="Tell Us What You Need"
            description="Share your goals, expectations, and files. Our team will respond with practical next steps."
            submitLabel="Request Proposal"
            formId="contact-form"
          />
        </div>

        <div id="contact-methods">
          <ContactMethodsGrid methods={methods} />
        </div>
        <div id="contact-cta">
          <ContactCTA />
        </div>
      </div>
    </main>
  )
}
