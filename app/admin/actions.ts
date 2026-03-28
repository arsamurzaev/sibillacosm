"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  isValidAdminCredentials,
  requireAdminSession,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/uploads";
import {
  createGeneratedSlug,
  isChecked,
  parseNumber,
  parseOptionalNumber,
  slugify,
} from "@/lib/utils";

function getString(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function getStatus(value: FormDataEntryValue | null) {
  return value === "published" ? "published" : "draft";
}

function getImageType(value: FormDataEntryValue | null) {
  return value === "before" || value === "after" ? value : "gallery";
}

function getPriceItemImageAlt(imageType: ReturnType<typeof getImageType>) {
  if (imageType === "before") return "Фото до";
  if (imageType === "after") return "Фото после";
  return "";
}

function revalidateEverything() {
  revalidatePath("/");
  revalidatePath("/prices/grozny");
  revalidatePath("/prices/moscow");
  revalidatePath("/training");
  revalidatePath("/admin");
  revalidatePath("/admin/prices");
  revalidatePath("/admin/trainings");
}

export async function loginAction(formData: FormData) {
  const email = getString(formData.get("email")).toLowerCase();
  const password = getString(formData.get("password"));

  if (!isValidAdminCredentials(email, password)) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession(email);
  redirect("/");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/");
}

export async function updateCityAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData.get("id"));

  await sql`
    update cities
    set
      title = ${getString(formData.get("title"))},
      whatsapp = ${getString(formData.get("whatsapp"))},
      whatsapp_display = ${getString(formData.get("whatsappDisplay"))},
      instagram = ${getString(formData.get("instagram"))},
      sort_order = ${parseNumber(formData.get("sortOrder"))},
      is_active = ${isChecked(formData.get("isActive"))}
    where id = ${id}
  `;

  revalidateEverything();
}

export async function addSectionAction(formData: FormData) {
  await requireAdminSession();

  const title = getString(formData.get("title"));
  const rawSlug = slugify(getString(formData.get("slug")));

  await sql`
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
      ${getString(formData.get("cityId"))},
      ${rawSlug || createGeneratedSlug(title, "section")},
      ${title},
      ${getString(formData.get("subtitle"))},
      ${getString(formData.get("guarantee"))},
      ${parseNumber(formData.get("sortOrder"))},
      ${isChecked(formData.get("isPublished"))}
    )
  `;

  revalidateEverything();
}

export async function updateSectionAction(formData: FormData) {
  await requireAdminSession();

  const title = getString(formData.get("title"));
  const rawSlug = slugify(getString(formData.get("slug")));

  await sql`
    update price_sections
    set
      slug = ${rawSlug || createGeneratedSlug(title, "section")},
      title = ${title},
      subtitle = ${getString(formData.get("subtitle"))},
      guarantee = ${getString(formData.get("guarantee"))},
      sort_order = ${parseNumber(formData.get("sortOrder"))},
      is_published = ${isChecked(formData.get("isPublished"))}
    where id = ${getString(formData.get("id"))}
  `;

  revalidateEverything();
}

export async function deleteSectionAction(formData: FormData) {
  await requireAdminSession();

  await sql`delete from price_sections where id = ${getString(formData.get("id"))}`;
  revalidateEverything();
}

export async function addItemAction(formData: FormData) {
  await requireAdminSession();

  const name = getString(formData.get("name"));
  const rawSlug = slugify(getString(formData.get("slug")));

  await sql`
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
      ${getString(formData.get("sectionId"))},
      ${rawSlug || createGeneratedSlug(name, "item")},
      ${name},
      ${getString(formData.get("secondaryLine"))},
      ${getString(formData.get("note"))},
      ${parseNumber(formData.get("price"))},
      ${parseOptionalNumber(formData.get("oldPrice"))},
      ${parseNumber(formData.get("sortOrder"))},
      ${isChecked(formData.get("isPublished"))}
    )
  `;

  revalidateEverything();
}

export async function updateItemAction(formData: FormData) {
  await requireAdminSession();

  const name = getString(formData.get("name"));
  const rawSlug = slugify(getString(formData.get("slug")));

  await sql`
    update price_items
    set
      slug = ${rawSlug || createGeneratedSlug(name, "item")},
      name = ${name},
      secondary_line = ${getString(formData.get("secondaryLine"))},
      note = ${getString(formData.get("note"))},
      price = ${parseNumber(formData.get("price"))},
      old_price = ${parseOptionalNumber(formData.get("oldPrice"))},
      sort_order = ${parseNumber(formData.get("sortOrder"))},
      is_published = ${isChecked(formData.get("isPublished"))}
    where id = ${getString(formData.get("id"))}
  `;

  revalidateEverything();
}

export async function deleteItemAction(formData: FormData) {
  await requireAdminSession();

  const itemId = getString(formData.get("id"));
  const imageRows = await sql<{ image_url: string }[]>`
    select image_url
    from price_item_images
    where price_item_id = ${itemId}
  `;

  await sql`delete from price_items where id = ${itemId}`;

  for (const imageRow of imageRows) {
    await deleteUploadedFile(imageRow.image_url);
  }

  revalidateEverything();
}

export async function saveItemDetailsAction(formData: FormData) {
  await requireAdminSession();

  const description = getString(formData.get("description"));
  const extraText = getString(formData.get("extraText"));

  await sql`
    insert into price_item_details (
      price_item_id,
      description,
      extra_text,
      show_more_enabled
    )
    values (
      ${getString(formData.get("itemId"))},
      ${description},
      ${extraText},
      ${Boolean(description || extraText)}
    )
    on conflict (price_item_id) do update
    set
      description = excluded.description,
      extra_text = excluded.extra_text,
      show_more_enabled = excluded.show_more_enabled
  `;

  revalidateEverything();
}

export async function addPriceItemImageAction(formData: FormData) {
  await requireAdminSession();

  const file = formData.get("image");
  const itemId = getString(formData.get("itemId"));
  const imageType = getImageType(formData.get("imageType"));
  const sortOrder =
    imageType === "before" ? 10 : imageType === "after" ? 20 : parseNumber(formData.get("sortOrder"));
  const alt = getPriceItemImageAlt(imageType) || getString(formData.get("alt"));

  if (!(file instanceof File) || file.size === 0) {
    return;
  }

  if (imageType !== "gallery") {
    const previousImages = await sql<{ id: string; image_url: string }[]>`
      select id, image_url
      from price_item_images
      where price_item_id = ${itemId}
        and image_type = ${imageType}
    `;

    if (previousImages.length > 0) {
      await sql`
        delete from price_item_images
        where price_item_id = ${itemId}
          and image_type = ${imageType}
      `;

      for (const previousImage of previousImages) {
        await deleteUploadedFile(previousImage.image_url);
      }
    }
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
      ${alt},
      ${sortOrder}
    )
  `;

  revalidateEverything();
}

export async function deletePriceItemImageAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData.get("id"));
  const imageUrl = getString(formData.get("imageUrl"));

  await sql`delete from price_item_images where id = ${id}`;
  await deleteUploadedFile(imageUrl);

  revalidateEverything();
}

export async function addTrainingAction(formData: FormData) {
  await requireAdminSession();

  const title = getString(formData.get("title"));
  const rawSlug = slugify(getString(formData.get("slug")));
  const coverImage = formData.get("coverImage");
  const coverImageUrl =
    coverImage instanceof File && coverImage.size > 0
      ? await saveUploadedFile(coverImage, "trainings")
      : "";

  await sql`
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
      ${rawSlug || createGeneratedSlug(title, "training")},
      ${title},
      ${getString(formData.get("subtitle"))},
      ${getString(formData.get("duration"))},
      ${parseNumber(formData.get("price"))},
      ${getString(formData.get("description"))},
      ${coverImageUrl},
      ${getStatus(formData.get("status"))},
      ${parseNumber(formData.get("sortOrder"))}
    )
  `;

  revalidateEverything();
}

export async function updateTrainingAction(formData: FormData) {
  await requireAdminSession();

  const title = getString(formData.get("title"));
  const rawSlug = slugify(getString(formData.get("slug")));
  const existingCoverImageUrl = getString(formData.get("existingCoverImageUrl"));
  const coverImage = formData.get("coverImage");

  let nextCoverImageUrl = existingCoverImageUrl;

  if (coverImage instanceof File && coverImage.size > 0) {
    nextCoverImageUrl = await saveUploadedFile(coverImage, "trainings");
    if (existingCoverImageUrl) {
      await deleteUploadedFile(existingCoverImageUrl);
    }
  }

  await sql`
    update trainings
    set
      slug = ${rawSlug || createGeneratedSlug(title, "training")},
      title = ${title},
      subtitle = ${getString(formData.get("subtitle"))},
      duration = ${getString(formData.get("duration"))},
      price = ${parseNumber(formData.get("price"))},
      description = ${getString(formData.get("description"))},
      cover_image_url = ${nextCoverImageUrl},
      status = ${getStatus(formData.get("status"))},
      sort_order = ${parseNumber(formData.get("sortOrder"))}
    where id = ${getString(formData.get("id"))}
  `;

  revalidateEverything();
}

export async function deleteTrainingAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData.get("id"));
  const [training] = await sql<{ cover_image_url: string }[]>`
    select cover_image_url
    from trainings
    where id = ${id}
    limit 1
  `;
  const imageRows = await sql<{ image_url: string }[]>`
    select image_url
    from training_images
    where training_id = ${id}
  `;

  await sql`delete from trainings where id = ${id}`;

  if (training?.cover_image_url) {
    await deleteUploadedFile(training.cover_image_url);
  }

  for (const imageRow of imageRows) {
    await deleteUploadedFile(imageRow.image_url);
  }

  revalidateEverything();
}

export async function addTrainingBlockAction(formData: FormData) {
  await requireAdminSession();

  await sql`
    insert into training_blocks (
      training_id,
      title,
      body,
      sort_order
    )
    values (
      ${getString(formData.get("trainingId"))},
      ${getString(formData.get("title"))},
      ${getString(formData.get("body"))},
      ${parseNumber(formData.get("sortOrder"))}
    )
  `;

  revalidateEverything();
}

export async function updateTrainingBlockAction(formData: FormData) {
  await requireAdminSession();

  await sql`
    update training_blocks
    set
      title = ${getString(formData.get("title"))},
      body = ${getString(formData.get("body"))},
      sort_order = ${parseNumber(formData.get("sortOrder"))}
    where id = ${getString(formData.get("id"))}
  `;

  revalidateEverything();
}

export async function deleteTrainingBlockAction(formData: FormData) {
  await requireAdminSession();

  await sql`delete from training_blocks where id = ${getString(formData.get("id"))}`;
  revalidateEverything();
}

export async function addTrainingImageAction(formData: FormData) {
  await requireAdminSession();

  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return;
  }

  const imageUrl = await saveUploadedFile(file, "trainings");

  await sql`
    insert into training_images (
      training_id,
      image_url,
      alt,
      sort_order
    )
    values (
      ${getString(formData.get("trainingId"))},
      ${imageUrl},
      ${getString(formData.get("alt"))},
      ${parseNumber(formData.get("sortOrder"))}
    )
  `;

  revalidateEverything();
}

export async function deleteTrainingImageAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData.get("id"));
  const imageUrl = getString(formData.get("imageUrl"));

  await sql`delete from training_images where id = ${id}`;
  await deleteUploadedFile(imageUrl);

  revalidateEverything();
}
