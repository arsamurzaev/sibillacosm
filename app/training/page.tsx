import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import {
  getAdminTrainings,
  getPrimaryContactCity,
  getPublishedTrainings,
} from "@/lib/content";
import {
  absoluteUrl,
  buildTrainingPageDescription,
  buildTrainingPageTitle,
  siteHandle,
  siteKeywords,
  siteName,
  siteUrl,
} from "@/lib/seo";
import { TrainingsSection } from "../components/trainings-section";

export async function generateMetadata(): Promise<Metadata> {
  const trainings = await getPublishedTrainings();
  const title = buildTrainingPageTitle();
  const description = buildTrainingPageDescription(trainings.length);

  return {
    title,
    description,
    keywords: [
      ...siteKeywords,
      "обучение контурной пластике",
      "обучение косметологии",
      "курс косметологии",
    ],
    alternates: {
      canonical: "/training",
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: "/training",
      type: "website",
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: `${siteName} — обучение косметологии`,
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

export default async function TrainingPage() {
  const adminSession = await getAdminSession();
  const [trainings, contactCity] = await Promise.all([
    adminSession ? getAdminTrainings() : getPublishedTrainings(),
    getPrimaryContactCity(),
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Программы обучения SIBILLACOSM",
    url: absoluteUrl("/training"),
    itemListElement: trainings.map((training, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: training.title,
        description: training.description || training.subtitle,
        provider: {
          "@type": "Organization",
          name: siteName,
          url: siteUrl,
        },
        ...(training.price > 0
          ? {
              offers: {
                "@type": "Offer",
                price: training.price,
                priceCurrency: "RUB",
                availability: "https://schema.org/InStock",
                url: absoluteUrl("/training"),
              },
            }
          : {}),
      },
    })),
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
      <TrainingsSection
        trainings={trainings}
        contactCity={contactCity}
        adminLoggedIn={Boolean(adminSession)}
        adminEditMode={Boolean(adminSession)}
      />
    </>
  );
}
