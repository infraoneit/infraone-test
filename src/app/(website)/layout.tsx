import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { generateSitewideLocalBusinessSchema, generateSitewideWebSiteSchema } from "@/lib/seo/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ['Courier New', 'monospace'],
});

// Next.js verlangt den Viewport als eigenen Export - in "metadata" wird er
// ignoriert (Warnung im Serverlog) und wirkte auf Mobilgeraeten nicht.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: {
    // [01.11.2026] AUFTRAG-116: Startseiten-Titel auf 58 Zeichen (vorher 71); openGraph/twitter unverändert
    default: "IT-Support, Webdesign & Telefonie in Winterthur | InfraOne",
    template: "%s | InfraOne"
  },
  description: "IT-Support, Cloud-Telefonie, Webdesign und KI-Lösungen für KMU – mit offenen Preisen und Online-Kostenrechner. Winterthur, Schaffhausen, Thurgau und Zürich.",
  keywords: [
    "IT Support Winterthur",
    "Webdesign Winterthur",
    "Cloud Telefonanlage Schweiz",
    "Informatiker Winterthur",
    "IT Dienstleister Zürich",
    "VoIP Schweiz",
    "Netzwerk Infrastruktur",
    "3CX Telefonie",
    "peoplefone",
    "Videoüberwachung",
  ],
  authors: [{ name: "InfraOne IT Solutions GmbH" }],
  creator: "InfraOne IT Solutions GmbH",
  publisher: "InfraOne IT Solutions GmbH",
  formatDetection: {
    email: true,
    telephone: true,
    address: true,
  },
  metadataBase: new URL("https://infraone.ch"),
  openGraph: {
    type: "website",
    locale: "de_CH",
    url: "https://infraone.ch",
    siteName: "InfraOne IT Solutions",
    title: "InfraOne IT Solutions | IT-Support, Webdesign & Telefonie",
    description: "Digitale Lösungen für KMU & Privatpersonen - IT-Support, Webdesign & Cloud Telefonanlagen in Winterthur.",
    images: [
      {
        url: "/images/infraone-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "InfraOne IT Solutions - Telefonie, IT Security, Server Systeme, Microsoft, Firewall, Netzwerk, Cloud, Automatisierung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InfraOne IT Solutions",
    description: "IT-Support, Webdesign & Cloud Telefonanlagen in Winterthur",
    images: ["/images/infraone-og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: 'https://infraone.ch',
    languages: {
      'de-CH': 'https://infraone.ch',
      'x-default': 'https://infraone.ch', // [01.11.2026] AUFTRAG-116: hreflang x-default
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className="dark">
      <head>
        {/* Dark Mode Script - MUST run before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        {/* [31.10.2026] AUFTRAG-114: keine Resource Hints auf fonts.googleapis.com mehr - die Schriften
            kommen ueber next/font aus dem eigenen Hosting (Datenschutzerklaerung: kein Abruf bei Google Fonts). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSitewideLocalBusinessSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSitewideWebSiteSchema()) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col overflow-x-hidden`}
        // Geist direkt setzen: Tailwinds Preflight ueberschreibt sonst die
        // font-family aus globals.css, dadurch lief die Seite in der
        // System-Standardschrift statt in Geist.
        style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ScrollToTop />
          {/* AUFTRAG-113: schlichte Dropdowns, keine Regionen mehr im Header (Regionsseiten verlinken die Leistungsseiten) */}
          <Header />
          {/* [31.10.2026] AUFTRAG-114: Inhalt beginnt exakt an der Unterkante des fixen Headers (gemessen).
              Mobil (< lg, 375/768 px): Header 80 px (h-16 + 16 px padding-top aus der Safe-Area-Regel in
              globals.css), <main> beginnt bei 0 -> pt-20. Vorher pt-16 (64 px): die Hero-Ueberzeile lag
              unter dem Header. Ab lg (1024/1280 px): Header 96 px (h-20 + 16 px), <main> beginnt wegen der
              Kontaktleiste im Fluss (36 px, liegt unter dem Header) bei 36 px -> 96 - 36 = 60 px = lg:pt-15
              (vorher lg:pt-20: 20 px Leerraum unter dem Header). */}
          <main className="flex-1 pt-20 lg:pt-15">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        {/* Cloudflare Web Analytics: cookieless, kein Consent-Banner noetig.
            Laedt NUR, wenn das Token als Netlify-ENV gesetzt ist (S2). */}
        {process.env.NEXT_PUBLIC_CF_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: process.env.NEXT_PUBLIC_CF_BEACON_TOKEN })}
          />
        )}
      </body>
    </html>
  );
}