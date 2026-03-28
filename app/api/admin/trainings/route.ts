import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { trainingFormSchema } from "@/lib/training-admin-form";
import { saveUploadedFile } from "@/lib/uploads";
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

export async function POST(request: Request) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

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
    removeCoverImage: false,
  });

  if (!parsed.success) {
    return jsonError(
      "Проверьте поля формы.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const payload = parsed.data;
  const nextSlug =
    slugify(payload.slug) || createGeneratedSlug(payload.title, "training");
  const coverImageUrl = payload.coverImage
    ? await saveUploadedFile(payload.coverImage, "trainings")
    : "";

  const [createdTraining] = await sql<{ id: string }[]>`
    insert into trainings (
      slug,
      title,
      subtitle,
      duration,
      price,
      description,
      cover_image_url,
      status,
      sort_order
    )
    values (
      ${nextSlug},
      ${payload.title},
      ${payload.subtitle},
      ${payload.duration},
      ${payload.price},
      ${payload.description},
      ${coverImageUrl},
      ${payload.isPublished ? "published" : "draft"},
      ${payload.sortOrder}
    )
    returning id
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Программа добавлена.",
    trainingId: createdTraining?.id ?? null,
  });
}
