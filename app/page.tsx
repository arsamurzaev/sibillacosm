import { getActiveCities } from "@/lib/content";
import { CitySelector } from "./components/city-selector";

export default async function Page() {
  const cities = await getActiveCities();

  return <CitySelector cities={cities} />;
}
