type ProcessTimelineProps = { steps?: string[]
};
export default function ProcessTimeline({ steps = [] }: ProcessTimelineProps) { return ( <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm"> <h2 className="text-2xl font-semibold text-[var(--color-heading)]">Process</h2> <ol className="space-y-3"> {steps.map((step, index) => ( <li key={`${step}-${index}`} className="flex gap-3"> <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-footer)] text-xs font-semibold text-[var(--color-on-dark)]"> {index + 1} </div> <p className="pt-1 text-sm text-[var(--color-body)]">{step}</p> </li> ))} </ol> </section> )
}
