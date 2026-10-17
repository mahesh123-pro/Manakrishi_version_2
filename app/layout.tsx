import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/content";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Manakrishi | The Future of Farming — Drone Agriculture Platform",
    template: "%s | Manakrishi",
  },
  description:
    "Manakrishi is India's next-generation drone agriculture platform. Book precision drone pesticide spraying online — faster, safer, cheaper and more accurate farming across Telangana and India.",
  keywords: [
    "agricultural drone services",
    "drone spraying Telangana",
    "precision farming India",
    "agritech startup",
    "pesticide drone",
    "AI farming",
    "smart agriculture",
    "drone farming",
    "farm technology",
    "Manakrishi",
  ],
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: "Manakrishi",
    title: "Manakrishi | The Future of Farming",
    description:
      "Book precision drone spraying online. Healthier crops, safer farming, less chemical — powered by autonomous agricultural drones.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manakrishi | The Future of Farming",
    description: "India's next-generation drone agriculture platform.",
  },
  icons: {
    icon: "/assets/manakrishi-logo.png",
    apple: "/assets/manakrishi-logo.png",
  },
  alternates: { canonical: SITE.url },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Manakrishi",
  legalName: SITE.legalName,
  url: SITE.url,
  logo: `${SITE.url}/assets/manakrishi-logo.png`,
  description:
    "India's next-generation drone agriculture platform for precision pesticide spraying.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "46-122/1, Chintal",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: SITE.phone,
    contactType: "customer service",
  },
  sameAs: [SITE.instagram, SITE.whatsapp],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${outfit.variable} ${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
