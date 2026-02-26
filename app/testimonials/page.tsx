import type { Metadata } from "next"
import TestimonialHero from "@/components/testimonials/TestimonialHero"
import TestimonialForm from "@/components/testimonials/TestimonialForm"
import FeaturedTestimonials from "@/components/testimonials/FeaturedTestimonials"
import TestimonialGrid from "@/components/testimonials/TestimonialGrid"
import TestimonialCTA from "@/components/testimonials/TestimonialCTA"
import { getTestimonials } from "@/lib/firestore/getTestimonials"

export const metadata: Metadata = {
  title: "Testimonials | Sallify Technologies",
  description: "Read client success stories and share your testimonial with Sallify Technologies.",
}

export const revalidate = 120

export default async function TestimonialsPage() {
  const all = await getTestimonials()
  const featured = all.filter((item) => item.featured)

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 text-[var(--color-heading)] sm:px-6 lg:px-10 dark:bg-[var(--color-bg)] dark:text-[var(--color-heading)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div id="testimonials-hero">
          <TestimonialHero />
        </div>
        <div id="testimonials-form">
          <TestimonialForm />
        </div>
        <div id="testimonials-featured">
          <FeaturedTestimonials items={featured} />
        </div>
        <div id="testimonials-grid">
          <TestimonialGrid items={all} />
        </div>
        <div id="testimonials-cta">
          <TestimonialCTA />
        </div>
      </div>
    </main>
  )
}
