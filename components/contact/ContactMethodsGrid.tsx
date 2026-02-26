import ContactMethodCard from "@/components/contact/ContactMethodCard"
import type { ContactMethod } from "@/lib/firestore/getContactData"

export default function ContactMethodsGrid({ methods }: { methods: ContactMethod[] }) {
  if (!methods.length) return null
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold sm:text-3xl text-[var(--color-heading)]">Alternative Contact Methods</h2>
        <p className="text-sm text-[var(--color-body)]">Choose the channel that works best for you.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="list" aria-label="Alternative contact methods">
        {methods.map((method) => <ContactMethodCard key={method.id} method={method} />)}
      </div>
    </section>
  )
}
