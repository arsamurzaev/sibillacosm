import { z } from "zod";
import type { CityRecord, PriceSection } from "@/lib/types";

const slugPattern = /^[a-z0-9\u0400-\u04ff-]*$/i;

const slugField = z
  .string()
  .trim()
  .max(160, "Slug слишком длинный.")
  .refine((value) => !value || slugPattern.test(value), {
    message: "Slug может содержать только буквы, цифры и дефис.",
  });

const sortOrderField = z
  .number()
  .int("Порядок должен быть целым числом.")
  .min(-9999, "Слишком маленькое значение.")
  .max(9999, "Слишком большое значение.");

export const priceCityFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Укажите название города.")
    .max(160, "Название города слишком длинное."),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Укажите телефон WhatsApp.")
    .max(40, "Телефон WhatsApp слишком длинный."),
  whatsappDisplay: z
    .string()
    .trim()
    .max(80, "Подпись WhatsApp слишком длинная."),
  instagram: z
    .string()
    .trim()
    .max(80, "Instagram слишком длинный."),
  sortOrder: sortOrderField,
  isActive: z.boolean(),
});

export type PriceCityFormValues = z.infer<typeof priceCityFormSchema>;

export function createPriceCityFormDefaults(city: CityRecord): PriceCityFormValues {
  return {
    title: city.title,
    whatsapp: city.whatsapp,
    whatsappDisplay: city.whatsappDisplay,
    instagram: city.instagram,
    sortOrder: city.sortOrder,
    isActive: city.isActive,
  };
}

export const priceSectionFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Укажите название раздела.")
    .max(160, "Название раздела слишком длинное."),
  subtitle: z.string().trim().max(200, "Подзаголовок слишком длинный."),
  guarantee: z.string().trim().max(4000, "Текст слишком длинный."),
  sortOrder: sortOrderField,
  isPublished: z.boolean(),
  slug: slugField,
});

export type PriceSectionFormValues = z.infer<typeof priceSectionFormSchema>;

export function createPriceSectionFormDefaults(
  section?: PriceSection | null,
): PriceSectionFormValues {
  return {
    title: section?.title ?? "",
    subtitle: section?.subtitle ?? "",
    guarantee: section?.guarantee ?? "",
    sortOrder: section?.sortOrder ?? 0,
    isPublished: section?.isPublished ?? true,
    slug: section?.slug ?? "",
  };
}

export const priceItemCreateFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Укажите название услуги.")
      .max(160, "Название услуги слишком длинное."),
    secondaryLine: z.string().trim().max(160, "Вторая строка слишком длинная."),
    note: z.string().trim().max(240, "Примечание слишком длинное."),
    price: z
      .number()
      .finite("Укажите цену.")
      .min(0, "Цена не может быть отрицательной."),
    oldPrice: z
      .number()
      .finite("Старая цена указана некорректно.")
      .min(0, "Старая цена не может быть отрицательной.")
      .nullable(),
    sortOrder: sortOrderField,
    isPublished: z.boolean(),
    slug: slugField,
  })
  .refine((value) => value.oldPrice === null || value.oldPrice >= value.price, {
    path: ["oldPrice"],
    message: "Старая цена должна быть не меньше текущей.",
  });

export type PriceItemCreateFormValues = z.infer<typeof priceItemCreateFormSchema>;

export function createPriceItemCreateDefaults(): PriceItemCreateFormValues {
  return {
    name: "",
    secondaryLine: "",
    note: "",
    price: 0,
    oldPrice: null,
    sortOrder: 0,
    isPublished: true,
    slug: "",
  };
}
