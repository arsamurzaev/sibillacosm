import { getAdminSession } from "@/lib/auth";
import {
  getAdminTrainings,
  getPrimaryContactCity,
  getPublishedTrainings,
} from "@/lib/content";
import { TrainingsSection } from "../components/trainings-section";

export default async function TrainingPage() {
  const adminSession = await getAdminSession();
  const [trainings, contactCity] = await Promise.all([
    adminSession ? getAdminTrainings() : getPublishedTrainings(),
    getPrimaryContactCity(),
  ]);

  return (
    <TrainingsSection
      trainings={trainings}
      contactCity={contactCity}
      adminLoggedIn={Boolean(adminSession)}
      adminEditMode={Boolean(adminSession)}
    />
  );
}
