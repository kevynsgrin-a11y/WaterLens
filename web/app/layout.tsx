import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

const SITE_NAME = "WaterQualityLens";
const SITE_DESC =
  "Enter your address to see exactly which contaminants your public water system reports — and the specific, independently NSF-certified filters proven to remove them.";

export const metadata: Metadata = {
  metadataBase: new URL("https://waterqualitylens.com"),
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
  themeColor: "#1b3e59",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
