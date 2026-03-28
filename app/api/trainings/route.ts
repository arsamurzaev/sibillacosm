import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getAdminTrainings,
  getPrimaryContactCity,
  getPublishedTrainings,
} from "@/lib/content";
import type { TrainingPageData } from "@/lib/types";

export async function GET() {
  const adminSession = await getAdminSession();
  const [trainings, contactCity] = await Promise.all([
    adminSession ? getAdminTrainings() : getPublishedTrainings(),
    getPrimaryContactCity(),
  ]);

  const payload: TrainingPageData = {
    trainings,
    contactCity,
  };

  return NextResponse.json(payload);
}
