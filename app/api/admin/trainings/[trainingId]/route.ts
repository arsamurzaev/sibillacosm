import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { trainingFormSchema } from "@/lib/training-admin-form";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/uploads";
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

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}

function getBoolean(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

function getOptionalFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ trainingId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { trainingId } = await context.params;
  const formData = await request.formData();

  const parsed = trainingFormSchema.safeParse({
    title: getString(formData.get("title")),
    subtitle: getString(formData.get("subtitle")),
    duration: getString(formData.get("duration")),
    price: getNumber(formData.get("price")),
    description: getString(formData.get("description")),
    sortOrder: getNumber(formData.get("sortOrder")),
    isPublished: getBoolean(formData.get("isPublished")),
    slug: getString(formData.get("slug")),
    coverImage: getOptionalFile(formData.get("coverImage")),
    removeCoverImage: getBoolean(formData.get("removeCoverImage")),
  });

  if (!parsed.success) {
    return jsonError(
      "Проверьте поля формы.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const [training] = await sql<{ id: string; cover_image_url: string }[]>`
    select id, cover_image_url
    from trainings
    where id = ${trainingId}
    limit 1
  `;

  if (!training) {
    return jsonError("Программа не найдена.", 404);
  }

  const payload = parsed.data;
  const nextSlug =
    slugify(payload.slug) || createGeneratedSlug(payload.title, "training");
  let nextCoverImageUrl = training.cover_image_url;

  if (payload.coverImage) {
    nextCoverImageUrl = await saveUploadedFile(payload.coverImage, "trainings");

    if (training.cover_image_url) {
      await deleteUploadedFile(training.cover_image_url);
    }
  } else if (payload.removeCoverImage && training.cover_image_url) {
    await deleteUploadedFile(training.cover_image_url);
    nextCoverImageUrl = "";
  }

  await sql`
    update trainings
    set
      slug = ${nextSlug},
      title = ${payload.title},
      subtitle = ${payload.subtitle},
      duration = ${payload.duration},
      price = ${payload.price},
      description = ${payload.description},
      cover_image_url = ${nextCoverImageUrl},
      status = ${payload.isPublished ? "published" : "draft"},
      sort_order = ${payload.sortOrder}
    where id = ${trainingId}
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Программа сохранена.",
    slug: nextSlug,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ trainingId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { trainingId } = await context.params;
  const [training] = await sql<{ cover_image_url: string }[]>`
    select cover_image_url
    from trainings
    where id = ${trainingId}
    limit 1
  `;
  const imageRows = await sql<{ image_url: string }[]>`
    select image_url
    from training_images
    where training_id = ${trainingId}
  `;

  const deletedRows = await sql<{ id: string }[]>`
    delete from trainings
    where id = ${trainingId}
    returning id
  `;

  if (deletedRows.length === 0) {
    return jsonError("Программа не найдена.", 404);
  }

  if (training?.cover_image_url) {
    await deleteUploadedFile(training.cover_image_url);
  }

  for (const imageRow of imageRows) {
    await deleteUploadedFile(imageRow.image_url);
  }

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Программа удалена.",
  });
}
