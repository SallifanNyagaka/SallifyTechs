import TestimonialCard from "@/components/testimonials/TestimonialCard"
import { TestimonialRecord } from "@/lib/firestore/getTestimonials"

export default function FeaturedTestimonials({ items }: { items: TestimonialRecord[] }) {
  if (!items.length) return null

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-[var(--color-heading)] sm:text-3xl">Featured Client Stories</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <TestimonialCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
