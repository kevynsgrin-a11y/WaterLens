import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SITE_NAME, SITE_URL } from "@/lib/site";
const SITE_DESC =
  "Enter your address to see exactly which contaminants your public water system reports — and the specific, independently NSF-certified filters proven to remove them.";

// Self-hosted variable faces (files committed under app/fonts). No CDN, no
// network at build or runtime, and the type is the same on every platform.
const sans = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const mono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "100 800",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WaterQualityLens — Address-level tap water quality intelligence",
    template: "%s · WaterQualityLens",
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: [
    "tap water quality",
    "NSF 53 filter",
    "NSF 58 reverse osmosis",
    "PFAS water filter",
    "lead water filter",
    "EPA SDWIS",
    "water contaminants by address",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "WaterQualityLens — Address-level tap water quality intelligence",
    description: SITE_DESC,
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESC },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1720" },
  ],
  width: "device-width",
  initialScale: 1,
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESC,
      logo: `${SITE_URL}/icon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESC,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/results?address={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

// Resolves the theme before first paint, so a dark-mode visitor never sees a
// white flash. It ALWAYS stamps data-theme — Tailwind's `dark:` variants key off
// that attribute, so leaving it unset for OS-preference users would theme the
// CSS variables while leaving every `dark:` utility inert.
const THEME_BOOTSTRAP = `(function(){try{var s=localStorage.getItem("wql-theme");var t=(s==="dark"||s==="light")?s:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SiteNav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
