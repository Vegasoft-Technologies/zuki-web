import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import BookingBar from "@/components/layout/BookingBar";
import CookieBanner from "@/components/ui/CookieBanner";
import Analytics from "@/components/ui/Analytics";
import RatingBadge from "@/components/ui/RatingBadge";
import { buildStructuredData } from "@/lib/structuredData";
import { site } from "@/data/site";

// Loading the two typefaces here self-hosts them, which removes the render-blocking
// request to a third party that the original stylesheet link made. The optical size
// axis is carried over from the original request so that the browser keeps sizing the
// display face automatically.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

// The stylesheet names its typefaces only through these two custom properties, so
// pointing them at the self-hosted families is enough. The stylesheet stays untouched.
const fontVariables = {
  "--font-display": `${fraunces.style.fontFamily}, Georgia, "Times New Roman", serif`,
  "--font-body": `${hankenGrotesk.style.fontFamily}, system-ui, -apple-system, "Segoe UI", sans-serif`,
} as CSSProperties;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title:
    "Zuki's Caffetteria | Breakfast Café on Queen Street, Exeter — Italian & Turkish",
  description:
    "Breakfast cafe on Queen Street, Exeter, next to Central Station. All-day breakfast and brunch, Turkish breakfast spreads, fresh cornetti, artisan gelato and proper coffee — since 2017.",
  alternates: {
    canonical: `${site.url}/`,
  },
  openGraph: {
    title: "Zuki's Caffetteria — Italian & Turkish café in Exeter",
    description:
      "Two coffee cultures, one little garden in Exeter. All-day breakfast, Turkish spreads, espresso & gelato.",
    url: `${site.url}/`,
    siteName: site.name,
    // The production page uses the older Facebook value "restaurant.restaurant".
    // Next.js does not type it, and its escape hatch emits `name=` rather than
    // `property=`, which no Open Graph consumer reads. A correct `website` is worth
    // more than a malformed value that happens to match the old markup.
    type: "website",
    images: [`${site.url}/images/gallery-14.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zuki's Caffetteria — Italian & Turkish café in Exeter",
    description:
      "All-day breakfast, Turkish spreads, brunch, artisan gelato & proper coffee on Queen Street, Exeter.",
    images: [`${site.url}/images/gallery-14.jpg`],
  },
  // The SVG is the primary icon. The small PNGs are for browsers that do not use SVG
  // icons, and the 180 px PNG is the Apple touch icon; all are drawn from the same
  // artwork. The full-size logo is no longer offered as an icon: it weighed 642 KB.
  icons: {
    icon: [
      { url: "/images/favicon.svg", type: "image/svg+xml" },
      { url: "/images/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/images/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/images/apple-touch-icon.png", sizes: "180x180" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0C4A47",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData()) }}
        />
        <SiteHeader rating={<RatingBadge />} />
        {children}
        <SiteFooter />
        <BookingBar />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
