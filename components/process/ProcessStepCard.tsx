import Image from "next/image"
import { ProcessStepRecord } from "@/lib/firestore/getProcess"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

type ProcessStepCardProps = {
  step: ProcessStepRecord
  align?: "left" | "right"
}

export default function ProcessStepCard({ step, align = "left" }: ProcessStepCardProps) {
  const iconUrl = resolveFirebaseImageUrl(step.iconUrl)

  return (
    <article
      className={`group relative w-full max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${
        align === "right" ? "lg:ml-auto" : ""
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-section-alt)]">
          {iconUrl ? (
            <Image src={iconUrl} alt={step.title} fill className="object-cover" sizes="48px" unoptimized />
          ) : (
            <span className="text-sm font-semibold text-[var(--color-body)]">{step.stepNumber}</span>
          )}
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Step {step.stepNumber}</span>
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-heading)]">{step.title}</h3>
      <p className="mt-2 text-sm text-[var(--color-body)]">{step.description}</p>
    </article>
  )
}
