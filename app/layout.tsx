import type { Metadata, Viewport } from "next";
import { INDEXABLE, LIVE_SITE_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const TITLE = `${SITE_NAME} — Real Estate Data & Analytics`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  // demo copies (Vercel, localhost) stay out of search results; only the real rejournal.in is indexed
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", url: "/", siteName: SITE_NAME, title: TITLE, description: SITE_DESCRIPTION, locale: "en_IN" },
  twitter: { card: "summary_large_image", title: TITLE, description: SITE_DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#f7f7f4" };

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: LIVE_SITE_URL,
  description: SITE_DESCRIPTION,
  email: "support@rejournal.in",
  telephone: "+91 84528 32879",
  address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
  sameAs: ["https://www.linkedin.com/company/rejournal-in"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} antialiased`}
    >
      <body className="min-h-full">
        <a
          href="#main"
          className="fixed left-3 top-3 z-100 -translate-y-16 rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        {children}
      </body>
    </html>
  );
}
