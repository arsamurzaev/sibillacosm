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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ sectionId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { sectionId } = await context.params;
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

  const [section] = await sql<{ id: string }[]>`
    select id
    from price_sections
    where id = ${sectionId}
    limit 1
  `;

  if (!section) {
    return jsonError("Раздел не найден.", 404);
  }

  const payload = parsed.data;
  const nextSlug = slugify(payload.slug) || createGeneratedSlug(payload.title, "section");

  await sql`
    update price_sections
    set
      slug = ${nextSlug},
      title = ${payload.title},
      subtitle = ${payload.subtitle},
      guarantee = ${payload.guarantee},
      sort_order = ${payload.sortOrder},
      is_published = ${payload.isPublished}
    where id = ${sectionId}
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Раздел сохранён.",
    slug: nextSlug,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ sectionId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { sectionId } = await context.params;
  const deletedRows = await sql<{ id: string }[]>`
    delete from price_sections
    where id = ${sectionId}
    returning id
  `;

  if (deletedRows.length === 0) {
    return jsonError("Раздел не найден.", 404);
  }

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Раздел удалён.",
  });
}
