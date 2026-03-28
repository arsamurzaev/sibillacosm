import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAdminPricePage, getPublicPricePage } from "@/lib/content";

export async function GET(
  _request: Request,
  context: { params: Promise<{ city: string }> },
) {
  const { city } = await context.params;
  const adminSession = await getAdminSession();

  const pageData = adminSession
    ? await getAdminPricePage(city)
    : await getPublicPricePage(city);

  if (!pageData) {
    return NextResponse.json({ message: "Страница прайса не найдена." }, { status: 404 });
  }

  return NextResponse.json(pageData);
}
