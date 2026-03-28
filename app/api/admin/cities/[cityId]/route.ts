import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { priceCityFormSchema } from "@/lib/price-admin-form";

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
  context: { params: Promise<{ cityId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { cityId } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const parsed = priceCityFormSchema.safeParse({
    title: typeof body?.title === "string" ? body.title : "",
    whatsapp: typeof body?.whatsapp === "string" ? body.whatsapp : "",
    whatsappDisplay: typeof body?.whatsappDisplay === "string" ? body.whatsappDisplay : "",
    instagram: typeof body?.instagram === "string" ? body.instagram : "",
    sortOrder: typeof body?.sortOrder === "number" ? body.sortOrder : Number.NaN,
    isActive: Boolean(body?.isActive),
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

  await sql`
    update cities
    set
      title = ${payload.title},
      whatsapp = ${payload.whatsapp},
      whatsapp_display = ${payload.whatsappDisplay},
      instagram = ${payload.instagram},
      sort_order = ${payload.sortOrder},
      is_active = ${payload.isActive}
    where id = ${cityId}
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Город сохранён.",
  });
}
