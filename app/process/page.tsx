import type { Metadata } from "next"
import ProcessHero from "@/components/process/ProcessHero"
import ProcessTimeline from "@/components/process/ProcessTimeline"
import ProcessCTA from "@/components/process/ProcessCTA"
import { getProcessPageContent, getProcessSteps } from "@/lib/firestore/getProcess"

export const metadata: Metadata = {
  title: "Process | Sallify Technologies",
  description: "See how Sallify Technologies delivers projects from discovery to long-term optimization.",
}

export const revalidate = 120

export default async function ProcessPage() {
  const [steps, pageContent] = await Promise.all([getProcessSteps(), getProcessPageContent()])

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div id="process-hero">
          <ProcessHero
            title={pageContent.hero?.title}
            description={pageContent.hero?.description}
            backgroundImage={pageContent.hero?.backgroundImage}
          />
        </div>

        {steps.length ? (
          <section id="process-workflow" className="space-y-5">
            <h2 className="text-2xl font-semibold sm:text-3xl dark:text-[var(--color-heading)]">Workflow Steps</h2>
            <ProcessTimeline steps={steps} />
          </section>
        ) : null}

        {pageContent.why?.title || pageContent.why?.description ? (
          <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-8 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h2 className="text-2xl font-semibold dark:text-[var(--color-heading)]">{pageContent.why?.title || ""}</h2>
            <p className="mt-3 text-sm text-[var(--color-body)] sm:text-base dark:text-[var(--color-heading)]/85">{pageContent.why?.description || ""}</p>
          </section>
        ) : null}

        {pageContent.faqs.length ? (
          <section id="process-faqs" className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-8 shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h2 className="text-2xl font-semibold dark:text-[var(--color-heading)]">FAQs</h2>
            <div className="space-y-3">
              {pageContent.faqs.map((faq) => (
                <article key={faq.id} className="rounded-2xl border border-[var(--color-border)] p-4 dark:border-[var(--color-border)]">
                  <h3 className="text-base font-semibold text-[var(--color-heading)] dark:text-[var(--color-heading)]">{faq.question}</h3>
                  <p className="mt-1 text-sm text-[var(--color-body)] dark:text-[var(--color-heading)]/85">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <div id="process-cta">
          <ProcessCTA title={pageContent.cta?.title} description={pageContent.cta?.description} />
        </div>
      </div>
    </main>
  )
}
