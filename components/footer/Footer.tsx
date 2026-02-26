"use client"

import FooterBrand from "@/components/footer/FooterBrand"
import FooterCTA from "@/components/footer/FooterCTA"
import FooterContacts from "@/components/footer/FooterContacts"
import FooterLegal from "@/components/footer/FooterLegal"
import FooterLinks from "@/components/footer/FooterLinks"
import FooterSocials from "@/components/footer/FooterSocials"
import type { FooterData } from "@/lib/firestore/getFooterData"

export default function Footer({ data }: { data: FooterData }) {
  return (
    <footer className="mt-16 border-t border-white/10 bg-slate-900 text-slate-200 dark:bg-black">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <FooterBrand siteName={data.brand.siteName} description={data.brand.description} logoUrl={data.brand.logoUrl} />
            <FooterContacts contacts={data.contacts} />
          </div>

          <div className="space-y-6 lg:col-span-5">
            <FooterLinks groups={data.links} />
            <FooterSocials socials={data.socials} />
          </div>

          <div className="lg:col-span-3">
            <FooterCTA
              title={data.cta.title}
              subtitle={data.cta.subtitle}
              buttonText={data.cta.buttonText}
              buttonLink={data.cta.buttonLink}
            />
          </div>
        </div>

        <FooterLegal items={data.legal} siteName={data.brand.siteName} />
      </div>
    </footer>
  )
}
