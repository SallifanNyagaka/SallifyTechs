import ProcessStepCard from "@/components/process/ProcessStepCard"
import { ProcessStepRecord } from "@/lib/firestore/getProcess"

export default function ProcessTimeline({ steps }: { steps: ProcessStepRecord[] }) {
  return (
    <section className="relative space-y-6">
      <div className="absolute left-5 top-0 hidden h-full w-px bg-[var(--color-border)] lg:block" />
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          <ProcessStepCard step={step} align={index % 2 === 0 ? "left" : "right"} />
        </div>
      ))}
    </section>
  )
}
