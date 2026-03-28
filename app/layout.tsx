import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import {
  absoluteUrl,
  siteDescription,
  siteHandle,
  siteKeywords,
  siteLanguage,
  siteLocale,
  siteName,
  siteTitle,
  siteUrl,
} from "@/lib/seo";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: siteKeywords,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
    languages: {
      [siteLanguage]: "/",
    },
  },
  openGraph: {
    type: "website",
    locale: siteLocale,
    url: "/",
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${siteName} — эстетическая косметология`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: siteHandle,
    images: [absoluteUrl("/twitter-image")],
  },
  icons: {
    icon: [
      {
        url: "/icon0.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        url: "/icon1.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        url: "/favicon.ico",
        type: "image/x-icon",
        sizes: "48x48",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contacts = [
    {
      "@type": "ContactPoint",
      telephone: "+79389121101",
      contactType: "customer support",
      areaServed: "RU",
      availableLanguage: ["ru"],
    },
    {
      "@type": "ContactPoint",
      telephone: "+79882251505",
      contactType: "customer support",
      areaServed: "RU",
      availableLanguage: ["ru"],
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BeautySalon",
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        image: `${siteUrl}/opengraph-image`,
        areaServed: ["Грозный", "Москва"],
        sameAs: ["https://instagram.com/sibillacosm"],
        contactPoint: contacts,
      },
      {
        "@type": "WebSite",
        name: siteName,
        url: siteUrl,
        inLanguage: "ru-RU",
      },
    ],
  };

  return (
    <html lang="ru">
      <head>
        <meta name="apple-mobile-web-app-title" content="SC" />
        <meta name="yandex-verification" content="3662e1931c5bd73b" />
      </head>
      <body
        className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
