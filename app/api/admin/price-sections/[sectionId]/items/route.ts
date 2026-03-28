import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { priceItemCreateFormSchema } from "@/lib/price-admin-form";
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
  context: { params: Promise<{ sectionId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { sectionId } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const parsed = priceItemCreateFormSchema.safeParse({
    name: typeof body?.name === "string" ? body.name : "",
    secondaryLine: typeof body?.secondaryLine === "string" ? body.secondaryLine : "",
    note: typeof body?.note === "string" ? body.note : "",
    price: typeof body?.price === "number" ? body.price : Number.NaN,
    oldPrice:
      typeof body?.oldPrice === "number" || body?.oldPrice === null
        ? (body.oldPrice as number | null)
        : null,
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
  const nextSlug = slugify(payload.slug) || createGeneratedSlug(payload.name, "item");
  const [createdItem] = await sql<{ id: string }[]>`
    insert into price_items (
      section_id,
      slug,
      name,
      secondary_line,
      note,
      price,
      old_price,
      sort_order,
      is_published
    )
    values (
      ${sectionId},
      ${nextSlug},
      ${payload.name},
      ${payload.secondaryLine},
      ${payload.note},
      ${payload.price},
      ${payload.oldPrice},
      ${payload.sortOrder},
      ${payload.isPublished}
    )
    returning id
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Услуга добавлена.",
    itemId: createdItem?.id ?? null,
  });
}
