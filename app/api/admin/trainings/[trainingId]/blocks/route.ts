import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  trainingBlockFormSchema,
} from "@/lib/training-admin-form";

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
  context: { params: Promise<{ trainingId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { trainingId } = await context.params;
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

  const [training] = await sql<{ id: string }[]>`
    select id
    from trainings
    where id = ${trainingId}
    limit 1
  `;

  if (!training) {
    return jsonError("Программа не найдена.", 404);
  }

  const payload = parsed.data;
  const [createdBlock] = await sql<{ id: string }[]>`
    insert into training_blocks (
      training_id,
      title,
      body,
      sort_order
    )
    values (
      ${trainingId},
      ${payload.title},
      ${payload.body},
      ${payload.sortOrder}
    )
    returning id
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Блок добавлен.",
    blockId: createdBlock?.id ?? null,
  });
}
