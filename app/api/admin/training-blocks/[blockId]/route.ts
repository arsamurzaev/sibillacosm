import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { trainingBlockFormSchema } from "@/lib/training-admin-form";

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
  context: { params: Promise<{ blockId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { blockId } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  const parsed = trainingBlockFormSchema.safeParse({
    title: typeof body?.title === "string" ? body.title : "",
    body: typeof body?.body === "string" ? body.body : "",
    sortOrder:
      typeof body?.sortOrder === "number" ? body.sortOrder : Number.NaN,
  });

  if (!parsed.success) {
    return jsonError(
      "Проверьте поля формы.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const [block] = await sql<{ id: string }[]>`
    select id
    from training_blocks
    where id = ${blockId}
    limit 1
  `;

  if (!block) {
    return jsonError("Блок не найден.", 404);
  }

  const payload = parsed.data;

  await sql`
    update training_blocks
    set
      title = ${payload.title},
      body = ${payload.body},
      sort_order = ${payload.sortOrder}
    where id = ${blockId}
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Блок сохранён.",
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ blockId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { blockId } = await context.params;
  const deletedRows = await sql<{ id: string }[]>`
    delete from training_blocks
    where id = ${blockId}
    returning id
  `;

  if (deletedRows.length === 0) {
    return jsonError("Блок не найден.", 404);
  }

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Блок удалён.",
  });
}
