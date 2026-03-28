import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { priceItemFormSchema } from "@/lib/price-item-form";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/uploads";
import { createGeneratedSlug, slugify } from "@/lib/utils";

type ManagedImageType = "before" | "after";

function revalidateEverything() {
  revalidatePath("/");
  revalidatePath("/prices/grozny");
  revalidatePath("/prices/moscow");
  revalidatePath("/training");
  revalidatePath("/admin");
  revalidatePath("/admin/prices");
  revalidatePath("/admin/trainings");
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

function getNullableNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
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

function getManagedImageAlt(imageType: ManagedImageType) {
  return imageType === "before" ? "Фото до" : "Фото после";
}

function getManagedImageSortOrder(imageType: ManagedImageType) {
  return imageType === "before" ? 10 : 20;
}

function jsonError(
  message: string,
  status: number,
  fieldErrors?: Record<string, string[] | undefined>,
) {
  return NextResponse.json({ message, fieldErrors }, { status });
}

async function syncManagedImage({
  itemId,
  imageType,
  file,
  remove,
}: {
  itemId: string;
  imageType: ManagedImageType;
  file: File | null;
  remove: boolean;
}) {
  const previousImages = await sql<{ id: string; image_url: string }[]>`
    select id, image_url
    from price_item_images
    where price_item_id = ${itemId}
      and image_type = ${imageType}
  `;

  if (remove || file) {
    await sql`
      delete from price_item_images
      where price_item_id = ${itemId}
        and image_type = ${imageType}
    `;

    for (const previousImage of previousImages) {
      await deleteUploadedFile(previousImage.image_url);
    }
  }

  if (!file) {
    return remove ? false : previousImages.length > 0;
  }

  const imageUrl = await saveUploadedFile(file, "price-items");

  await sql`
    insert into price_item_images (
      price_item_id,
      image_url,
      image_type,
      alt,
      sort_order
    )
    values (
      ${itemId},
      ${imageUrl},
      ${imageType},
      ${getManagedImageAlt(imageType)},
      ${getManagedImageSortOrder(imageType)}
    )
  `;

  return true;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { itemId } = await context.params;
  const formData = await request.formData();

  const parsed = priceItemFormSchema.safeParse({
    name: getString(formData.get("name")),
    secondaryLine: getString(formData.get("secondaryLine")),
    note: getString(formData.get("note")),
    price: getNumber(formData.get("price")),
    oldPrice: getNullableNumber(formData.get("oldPrice")),
    sortOrder: getNumber(formData.get("sortOrder")),
    isPublished: getBoolean(formData.get("isPublished")),
    slug: getString(formData.get("slug")),
    description: getString(formData.get("description")),
    extraText: getString(formData.get("extraText")),
    beforeImage: getOptionalFile(formData.get("beforeImage")),
    afterImage: getOptionalFile(formData.get("afterImage")),
    removeBeforeImage: getBoolean(formData.get("removeBeforeImage")),
    removeAfterImage: getBoolean(formData.get("removeAfterImage")),
  });

  if (!parsed.success) {
    return jsonError(
      "Проверьте поля формы.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const [item] = await sql<{ id: string }[]>`
    select id
    from price_items
    where id = ${itemId}
    limit 1
  `;

  if (!item) {
    return jsonError("Услуга не найдена.", 404);
  }

  const payload = parsed.data;
  const nextSlug = slugify(payload.slug) || createGeneratedSlug(payload.name, "item");

  await sql`
    update price_items
    set
      slug = ${nextSlug},
      name = ${payload.name},
      secondary_line = ${payload.secondaryLine},
      note = ${payload.note},
      price = ${payload.price},
      old_price = ${payload.oldPrice},
      sort_order = ${payload.sortOrder},
      is_published = ${payload.isPublished}
    where id = ${itemId}
  `;

  const hasBeforeImage = await syncManagedImage({
    itemId,
    imageType: "before",
    file: payload.beforeImage,
    remove: payload.removeBeforeImage,
  });
  const hasAfterImage = await syncManagedImage({
    itemId,
    imageType: "after",
    file: payload.afterImage,
    remove: payload.removeAfterImage,
  });
  const showMoreEnabled = Boolean(
    payload.description || payload.extraText || hasBeforeImage || hasAfterImage,
  );

  await sql`
    insert into price_item_details (
      price_item_id,
      description,
      extra_text,
      show_more_enabled
    )
    values (
      ${itemId},
      ${payload.description},
      ${payload.extraText},
      ${showMoreEnabled}
    )
    on conflict (price_item_id) do update
    set
      description = excluded.description,
      extra_text = excluded.extra_text,
      show_more_enabled = excluded.show_more_enabled
  `;

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Изменения сохранены.",
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { itemId } = await context.params;
  const imageRows = await sql<{ image_url: string }[]>`
    select image_url
    from price_item_images
    where price_item_id = ${itemId}
  `;

  const deletedRows = await sql<{ id: string }[]>`
    delete from price_items
    where id = ${itemId}
    returning id
  `;

  if (deletedRows.length === 0) {
    return jsonError("Услуга не найдена.", 404);
  }

  for (const imageRow of imageRows) {
    await deleteUploadedFile(imageRow.image_url);
  }

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Услуга удалена.",
  });
}
