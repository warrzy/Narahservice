import type { Metadata, Viewport } from "next";
import { Syne, Figtree } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { MobileCallBar } from "@/components/layout/MobileCallBar";
import { company } from "@/config/company";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(company.seo.siteUrl),
  title: {
    default: company.seo.defaultTitle,
    template: `%s | ${company.name}`,
  },
  description: company.seo.defaultDescription,
  keywords: [
    "livraison sable Ouagadougou",
    "vente granite Ouagadougou",
    "fournisseur latérite Burkina Faso",
    "matériaux de construction Ouagadougou",
    "livraison matériaux de construction Burkina Faso",
    "NARAH SERVICE",
  ],
  authors: [{ name: company.name }],
  creator: company.name,
  openGraph: {
    type: "website",
    locale: company.seo.locale,
    url: company.seo.siteUrl,
    siteName: company.name,
    title: company.seo.defaultTitle,
    description: company.seo.defaultDescription,
    images: [
      {
        url: "/images/hero/hero-camion.jpg",
        width: 1600,
        height: 900,
        alt: "NARAH SERVICE — matériaux de construction à Ouagadougou",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: company.seo.defaultTitle,
    description: company.seo.defaultDescription,
    images: ["/images/hero/hero-camion.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#063B2B",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: company.name,
  description: company.seo.defaultDescription,
  slogan: company.slogan,
  url: company.seo.siteUrl,
  telephone: company.phones.map((p) => p.e164),
  address: {
    "@type": "PostalAddress",
    addressLocality: company.city,
    addressCountry: "BF",
  },
  areaServed: {
    "@type": "Place",
    name: company.serviceArea,
  },
  image: `${company.seo.siteUrl}/images/hero/hero-camion.jpg`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${syne.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main id="contenu" className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
        <MobileCallBar />
      </body>
    </html>
  );
}
