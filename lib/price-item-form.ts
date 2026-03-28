import { z } from "zod";
import type { PriceItem } from "@/lib/types";

const slugPattern = /^[a-z0-9\u0400-\u04ff-]*$/i;
const maxImageSizeBytes = 10 * 1024 * 1024;

const optionalImageSchema = z
  .custom<File | null>((value) => value === null || value instanceof File, {
    message: "Выберите корректный файл изображения.",
  })
  .refine((file) => !file || file.type.startsWith("image/"), {
    message: "Можно загружать только изображения.",
  })
  .refine((file) => !file || file.size <= maxImageSizeBytes, {
    message: "Размер изображения должен быть меньше 10 МБ.",
  });

export const priceItemFormSchema = z
  .object({
    name: z.string().trim().min(1, "Укажите название услуги.").max(160, "Слишком длинное название."),
    secondaryLine: z.string().trim().max(160, "Слишком длинная вторая строка."),
    note: z.string().trim().max(240, "Слишком длинное примечание."),
    price: z.number().finite("Укажите цену.").min(0, "Цена не может быть отрицательной."),
    oldPrice: z.number().finite("Старая цена указана некорректно.").min(0, "Старая цена не может быть отрицательной.").nullable(),
    sortOrder: z.number().int("Порядок должен быть целым числом.").min(-9999, "Слишком маленькое значение.").max(9999, "Слишком большое значение."),
    isPublished: z.boolean(),
    slug: z
      .string()
      .trim()
      .max(160, "Slug слишком длинный.")
      .refine((value) => !value || slugPattern.test(value), {
        message: "Slug может содержать только буквы, цифры и дефис.",
      }),
    description: z.string().trim().max(4000, "Описание слишком длинное."),
    extraText: z.string().trim().max(4000, "Дополнительный текст слишком длинный."),
    beforeImage: optionalImageSchema,
    afterImage: optionalImageSchema,
    removeBeforeImage: z.boolean(),
    removeAfterImage: z.boolean(),
  })
  .refine(
    (value) => value.oldPrice === null || value.oldPrice >= value.price,
    {
      path: ["oldPrice"],
      message: "Старая цена должна быть не меньше текущей.",
    },
  );

export type PriceItemFormValues = z.infer<typeof priceItemFormSchema>;

export function createPriceItemFormDefaults(item: PriceItem): PriceItemFormValues {
  return {
    name: item.name,
    secondaryLine: item.secondaryLine,
    note: item.note,
    price: item.price,
    oldPrice: item.oldPrice,
    sortOrder: item.sortOrder,
    isPublished: item.isPublished,
    slug: item.slug,
    description: item.details?.description ?? "",
    extraText: item.details?.extraText ?? "",
    beforeImage: null,
    afterImage: null,
    removeBeforeImage: false,
    removeAfterImage: false,
  };
}
