import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { trainingImageFormSchema } from "@/lib/training-admin-form";
import { saveUploadedFile } from "@/lib/uploads";

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

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}

function getOptionalFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
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
  const formData = await request.formData();

  const parsed = trainingImageFormSchema.safeParse({
    image: getOptionalFile(formData.get("image")),
    alt: getString(formData.get("alt")),
    sortOrder: getNumber(formData.get("sortOrder")),
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
  if (!payload.image) {
    return jsonError("Выберите изображение.", 400, {
      image: ["Выберите изображение."],
    });
  }

  const imageUrl = await saveUploadedFile(payload.image, "trainings");

  const [createdImage] = await sql<{ id: string }[]>`
    insert into training_images (
      training_id,
      image_url,
      alt,
      sort_order
    )
    values (
      ${trainingId},
      ${imageUrl},
      ${payload.alt},
      ${payload.sortOrder}
    )
    returning id
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Изображение добавлено.",
    imageId: createdImage?.id ?? null,
  });
}
