"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

export default function ImageGallery({ images }: { images: string[] }) {
  const gallery = useMemo(
    () =>
      images
        .map((image) => resolveFirebaseImageUrl(image))
        .filter((image): image is string => Boolean(image)),
    [images]
  )
  const [active, setActive] = useState<string | null>(null)

  if (!gallery.length) {
    return null
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-section)] p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">Gallery</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((image, index) => (
          <button
            key={`${image}-${index}`}
            onClick={() => setActive(image)}
            className="group relative block overflow-hidden rounded-2xl border border-[var(--color-border)] text-left"
          >
            <div className="relative h-52 w-full">
              <Image
                src={image}
                alt={`Blog gallery ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-300 group-hover:scale-105"
                unoptimized
              />
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay-strong)] p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative h-[70vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-3 top-3 z-10 rounded-full bg-[var(--color-section)] px-3 py-1 text-xs font-semibold text-[var(--color-heading)]"
              onClick={() => setActive(null)}
            >
              Close
            </button>
            <Image src={active} alt="Expanded gallery image" fill className="object-contain" unoptimized />
          </div>
        </div>
      ) : null}
    </section>
  )
}
