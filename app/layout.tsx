import type { Metadata } from "next"
import "./globals.css"
import ClientShell from "@/components/ClientShell"
import { ThemeProvider } from "@/context/ThemeProvider"
import { getFooterData } from "@/lib/firestore/getFooterData"
import { getSiteSettings } from "@/lib/firestore/getSiteSettings"
import { defaultDescription, siteName, siteUrl, toAbsoluteUrl } from "@/lib/seo/site"
import { getStaticMeta } from "@/lib/seo/static-meta"
import { resolveFirebaseImageUrl } from "@/lib/storage-url"

export async function generateMetadata(): Promise<Metadata> {
  const [homeMeta, settings] = await Promise.all([
    getStaticMeta("home", `${siteName} | Digital Solutions Agency`, defaultDescription),
    getSiteSettings(),
  ])
  // Keep source aligned with Navbar/Footer logo resolution order.
  const configuredIcon = settings.branding?.logo || settings.logo || settings.logoUrl || ""
  const iconUrl = resolveFirebaseImageUrl(configuredIcon) || toAbsoluteUrl("/favicon.ico")

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: homeMeta.title,
      template: `%s | ${siteName}`,
    },
    description: homeMeta.description,
    openGraph: {
      type: "website",
      siteName,
      title: homeMeta.title,
      description: homeMeta.description,
      url: siteUrl,
      images: [homeMeta.ogImage || toAbsoluteUrl("/favicon.ico")],
    },
    twitter: {
      card: "summary_large_image",
      title: homeMeta.title,
      description: homeMeta.description,
      images: [homeMeta.ogImage || toAbsoluteUrl("/favicon.ico")],
    },
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-placeholder",
    },
    robots: {
      index: !homeMeta.noIndex,
      follow: !homeMeta.noIndex,
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [footerData, settings] = await Promise.all([getFooterData(), getSiteSettings()])
  const tabIconCandidate = settings.branding?.logo || settings.logo || settings.logoUrl || ""
  const tabIconUrl = resolveFirebaseImageUrl(tabIconCandidate) || toAbsoluteUrl("/favicon.ico")

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: footerData.brand.siteName || siteName,
    url: siteUrl,
    logo: footerData.brand.logoUrl || toAbsoluteUrl("/favicon.ico"),
    description: footerData.brand.description || defaultDescription,
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={tabIconUrl} />
        <link rel="shortcut icon" href={tabIconUrl} />
        <link rel="apple-touch-icon" href={tabIconUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var key = "sallify-theme";
                  var stored = localStorage.getItem(key) || "system";
                  var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var theme = stored === "system" ? (systemDark ? "dark" : "light") : stored;
                  document.documentElement.classList.remove("light", "dark");
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased transition-colors duration-300">
        <ThemeProvider>
          <ClientShell footerData={footerData}>{children}</ClientShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
