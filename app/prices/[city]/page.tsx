import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import { getActiveCities, getAdminPricePage, getPublicPricePage } from "@/lib/content";
import {
  absoluteUrl,
  buildPricePageDescription,
  buildPricePageTitle,
  siteHandle,
  siteKeywords,
  siteName,
  siteUrl,
} from "@/lib/seo";
import { notFound } from "next/navigation";
import { PriceList } from "../../components/price-list";

interface PricePageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({
  params,
}: PricePageProps): Promise<Metadata> {
  const { city } = await params;
  const pageData = await getPublicPricePage(city);

  if (!pageData) {
    return {
      title: "Прайс не найден",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = buildPricePageTitle(pageData.title);
  const description = buildPricePageDescription(
    pageData.title,
    pageData.sections.map((section) => section.title),
  );
  const canonicalPath = `/prices/${pageData.slug}`;

  return {
    title,
    description,
    keywords: [
      ...siteKeywords,
      `косметология ${pageData.title}`,
      `прайс ${pageData.title}`,
      `процедуры ${pageData.title}`,
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: canonicalPath,
      type: "website",
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: `${siteName} — ${title.toLowerCase()}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      creator: siteHandle,
      images: [absoluteUrl("/twitter-image")],
    },
  };
}

export default async function PricePage({ params }: PricePageProps) {
  const [{ city }, adminSession] = await Promise.all([params, getAdminSession()]);
  const pageData = adminSession
    ? await getAdminPricePage(city)
    : await getPublicPricePage(city);

  if (!pageData) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: buildPricePageTitle(pageData.title),
    url: absoluteUrl(`/prices/${pageData.slug}`),
    itemListElement: pageData.sections.flatMap((section, sectionIndex) =>
      section.items.map((item, itemIndex) => ({
        "@type": "ListItem",
        position: sectionIndex * 100 + itemIndex + 1,
        item: {
          "@type": "Service",
          name: item.secondaryLine
            ? `${item.name}, ${item.secondaryLine}`
            : item.name,
          description:
            item.details?.description || item.note || section.title,
          areaServed: pageData.title,
          provider: {
            "@type": "BeautySalon",
            name: siteName,
            url: siteUrl,
          },
          ...(item.price > 0
            ? {
                offers: {
                  "@type": "Offer",
                  price: item.price,
                  priceCurrency: "RUB",
                  availability: "https://schema.org/InStock",
                  url: absoluteUrl(`/prices/${pageData.slug}`),
                },
              }
            : {}),
        },
      })),
    ),
  };

  return (
    <>
      {!adminSession ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      ) : null}
      <PriceList
        city={pageData}
        adminLoggedIn={Boolean(adminSession)}
        adminEditMode={Boolean(adminSession)}
      />
    </>
  );
}

export async function generateStaticParams() {
  const cities = await getActiveCities();

  return cities.map((city) => ({
    city: city.slug,
  }));
}
