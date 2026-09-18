import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CookieBanner from "@/components/ui/CookieBanner";
import { buildStructuredData } from "@/lib/structuredData";

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
  title:
    "Zuki's Caffetteria | Italian & Turkish Café in Exeter — Breakfast, Brunch & Gelato",
  description:
    "Italian & Turkish café on Queen Street by Exeter Central Station. All-day breakfast, Turkish breakfast spreads, brunch, fresh cornetti, artisan gelato, espresso & Turkish coffee — since 2017.",
  icons: {
    icon: [
      { url: "/images/favicon.svg", type: "image/svg+xml" },
      { url: "/images/logo.png" },
    ],
    apple: "/images/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData()) }}
        />
        <SiteHeader />
        {children}
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
