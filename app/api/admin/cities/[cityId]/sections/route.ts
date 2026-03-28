import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { priceSectionFormSchema } from "@/lib/price-admin-form";
import { createGeneratedSlug, slugify } from "@/lib/utils";

function revalidateEverything() {
  revalidatePath("/");
  revalidatePath("/prices/grozny");
  revalidatePath("/prices/moscow");
  revalidatePath("/training");
  revalidatePath("/admin");
  revalidatePath("/admin/prices");
  revalidatePath("/admin/trainings");
}

function jsonError(
  message: string,
  status: number,
  fieldErrors?: Record<string, string[] | undefined>,
) {
  return NextResponse.json({ message, fieldErrors }, { status });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ cityId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { cityId } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const parsed = priceSectionFormSchema.safeParse({
    title: typeof body?.title === "string" ? body.title : "",
    subtitle: typeof body?.subtitle === "string" ? body.subtitle : "",
    guarantee: typeof body?.guarantee === "string" ? body.guarantee : "",
    sortOrder: typeof body?.sortOrder === "number" ? body.sortOrder : Number.NaN,
    isPublished: Boolean(body?.isPublished),
    slug: typeof body?.slug === "string" ? body.slug : "",
  });

  if (!parsed.success) {
    return jsonError("Проверьте поля формы.", 400, parsed.error.flatten().fieldErrors);
  }

  const [city] = await sql<{ id: string }[]>`
    select id
    from cities
    where id = ${cityId}
    limit 1
  `;

  if (!city) {
    return jsonError("Город не найден.", 404);
  }

  const payload = parsed.data;
  const nextSlug = slugify(payload.slug) || createGeneratedSlug(payload.title, "section");
  const [createdSection] = await sql<{ id: string }[]>`
    insert into price_sections (
      city_id,
      slug,
      title,
      subtitle,
      guarantee,
      sort_order,
      is_published
    )
    values (
      ${cityId},
      ${nextSlug},
      ${payload.title},
      ${payload.subtitle},
      ${payload.guarantee},
      ${payload.sortOrder},
      ${payload.isPublished}
    )
    returning id
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Раздел добавлен.",
    sectionId: createdSection?.id ?? null,
  });
}
