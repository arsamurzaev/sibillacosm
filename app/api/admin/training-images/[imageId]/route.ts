import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { deleteUploadedFile } from "@/lib/uploads";

function revalidateEverything() {
  revalidatePath("/");
  revalidatePath("/prices/grozny");
  revalidatePath("/prices/moscow");
  revalidatePath("/training");
  revalidatePath("/admin");
  revalidatePath("/admin/prices");
  revalidatePath("/admin/trainings");
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ imageId: string }> },
) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return jsonError("Требуется авторизация администратора.", 401);
  }

  const { imageId } = await context.params;
  const [image] = await sql<{ image_url: string }[]>`
    select image_url
    from training_images
    where id = ${imageId}
    limit 1
  `;

  if (!image) {
    return jsonError("Изображение не найдено.", 404);
  }

  await sql`
    delete from training_images
    where id = ${imageId}
  `;
  await deleteUploadedFile(image.image_url);

  revalidateEverything();

  return NextResponse.json({
    success: true,
    message: "Изображение удалено.",
  });
}
