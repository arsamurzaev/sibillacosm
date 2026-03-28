import type { Metadata } from "next";
import { getActiveCities } from "@/lib/content";
import {
  absoluteUrl,
  buildHomePageDescription,
  buildHomePageTitle,
  siteHandle,
  siteKeywords,
  siteName,
} from "@/lib/seo";
import { CitySelector } from "./components/city-selector";

const homePageTitle = buildHomePageTitle();
const homePageDescription = buildHomePageDescription();

export const metadata: Metadata = {
  title: homePageTitle,
  description: homePageDescription,
  keywords: [
    ...siteKeywords,
    "эстетическая косметология",
    "прайс косметологии",
    "обучение косметологии",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${homePageTitle} | ${siteName}`,
    description: homePageDescription,
    url: "/",
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${siteName} — эстетическая косметология и обучение`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${homePageTitle} | ${siteName}`,
    description: homePageDescription,
    creator: siteHandle,
    images: [absoluteUrl("/twitter-image")],
  },
};

export default async function Page() {
  const cities = await getActiveCities();

  return <CitySelector cities={cities} />;
}
