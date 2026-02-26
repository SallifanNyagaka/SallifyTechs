import Link from "next/link"

type FooterCTAProps = {
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
}

export default function FooterCTA({ title, subtitle, buttonText, buttonLink }: FooterCTAProps) {
  if (!title && !buttonText) return null

  return (
    <div className="rounded-2xl border border-white/15 bg-slate-800/60 p-5">
      <h3 className="text-base font-semibold text-slate-100" style={{ color: "#f1f5f9" }}>
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-200">{subtitle}</p>
      <Link
        href={buttonLink || "/contact"}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-blue-500"
      >
        {buttonText || "Contact Us"}
      </Link>
    </div>
  )
}
