import type { NextConfig } from "next";

/**
 * [01.11.2026] AUFTRAG-116 (P8): Sicherheits-Header fuer alle Seiten ausser Keystatic-Admin und API.
 * Netlify-Header aus netlify.toml/_headers gelten nicht fuer Antworten der Next-Funktion, darum hier.
 * Nur in Produktion: `next dev` braucht 'unsafe-eval' und bleibt ohne CSP. HSTS setzt Netlify (unveraendert).
 * Externe Quellen (Inventar im Bericht A116): Cloudflare Web Analytics (Skript static.cloudflareinsights.com,
 * Meldung an cloudflareinsights.com), Turnstile (challenges.cloudflare.com: Skript, iframe, Abfragen),
 * Google-Maps-iframe auf /kontakt (www.google.com/maps/embed), Firmenlogos der Demo (eigener Proxy, dazu
 * img-src https:), Schriften ueber next/font aus dem eigenen Hosting, Netlify Forms POST auf /__forms.html.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com https://challenges.cloudflare.com",
  "frame-src https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  // [09.11.2026] AUFTRAG-120: Testlink im Buero-LAN laeuft ueber http://<IP>:3010. Mit
  // «upgrade-insecure-requests» hebt der Browser dort jede Stylesheet- und Skript-Anfrage auf
  // HTTPS an, der Server antwortet nicht, die Seite erscheint ohne Gestaltung (localhost ist
  // davon ausgenommen, darum fiel es am PC nie auf). Nur fuer den Build des Testlinks
  // (INFRAONE_TESTLINK_HTTP=1) entfaellt die Anweisung; Netlify/Live bleibt unveraendert.
  ...(process.env.INFRAONE_TESTLINK_HTTP === "1" ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const SICHERHEITS_HEADER = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  // [01.11.2026] AUFTRAG-116: Sicherheits-Header (nur Produktion; Keystatic und /api/ ausgenommen)
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/((?!keystatic|api/).*)",
        headers: SICHERHEITS_HEADER,
      },
    ];
  },

  // React Compiler fuer bessere Performance
  reactCompiler: true,
  
  // Bildoptimierung
  images: {
    // Moderne Bildformate aktivieren (50-80% kleiner als PNG)
    formats: ['image/avif', 'image/webp'],
    // Device-Groessen fuer responsive Bilder
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Bildgroessen fuer verschiedene Breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimale Cache-Zeit fuer optimierte Bilder (1 Jahr)
    minimumCacheTTL: 31536000,
    // Erlaubte Qualitaetsstufen
    qualities: [75, 80],
  },
  
  // Experimentelle Features fuer bessere Performance
  experimental: {
    // Optimierte Package-Imports (Tree-Shaking)
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Kompression aktivieren
  compress: true,
  
  // Powered-by Header entfernen (Security + weniger Bytes)
  poweredByHeader: false,
  
  // Strikte Mode fuer bessere Fehlerkennung
  reactStrictMode: true,

  // 301-Redirects fuer alte URLs:
  // - /telefonie wird auf /cloud-telefonie konsolidiert (Kannibalisierung beheben)
  // - /kontrollraum und /gebaeudeautomation wurden als Leistungen eingestellt
  //   und leiten auf /leistungen um (keine 404, Bewertung bleibt erhalten)
  // - 5 historische Blog-Slugs (in alter Sitemap, aber nie als Page existiert)
  //   werden auf /blog oder den jeweiligen Nachfolge-Post gemappt
  async redirects() {
    return [
      {
        source: '/telefonie',
        destination: '/cloud-telefonie',
        permanent: true,
      },
      {
        source: '/kontrollraum',
        destination: '/leistungen',
        permanent: true,
      },
      {
        // Nicht auf /leistungen: Die Uebersichtsseite hat laut Search Console
        // null Impressionen. /gebaeudeautomation hatte 472 - diese Sichtbarkeit
        // gehoert auf eine Seite, die Google kennt.
        source: '/gebaeudeautomation',
        destination: '/it-netzwerke',
        permanent: true,
      },
      // Altlasten der frueheren Wix-Seite. Diese Adressen stehen noch im
      // Google-Index und liefern heute 404 - damit verfaellt alles, was sie
      // ueber Jahre an Bewertung gesammelt haben.
      {
        source: '/it-dienstleistungen',
        destination: '/leistungen',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/leistungen',
        permanent: true,
      },
      {
        source: '/kontakt-1',
        destination: '/kontakt',
        permanent: true,
      },
      {
        source: '/post/:slug',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/ki-kmu-digitalisierung',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/cloud-telefonie-kmu-vorteile',
        destination: '/blog/moderne-telefonie-peoplefone-3cx',
        permanent: true,
      },
      {
        source: '/blog/webagentur-freelancer-vergleich',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/black-box-emerald',
        destination: '/blog/multimonitor-systeme-black-box-emerald',
        permanent: true,
      },
      {
        source: '/blog/10-seo-fehler-kmu',
        destination: '/blog',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;