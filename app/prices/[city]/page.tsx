import { getAdminSession } from "@/lib/auth";
import { getAdminPricePage, getPublicPricePage } from "@/lib/content";
import { notFound } from "next/navigation";
import { PriceList } from "../../components/price-list";

interface PricePageProps {
  params: Promise<{ city: string }>;
}

export default async function PricePage({ params }: PricePageProps) {
  const [{ city }, adminSession] = await Promise.all([params, getAdminSession()]);
  const pageData = adminSession
    ? await getAdminPricePage(city)
    : await getPublicPricePage(city);

  if (!pageData) {
    notFound();
  }

  return <PriceList city={pageData} adminLoggedIn={Boolean(adminSession)} adminEditMode={Boolean(adminSession)} />;
}

export async function generateStaticParams() {
  return [{ city: "grozny" }, { city: "moscow" }];
}
