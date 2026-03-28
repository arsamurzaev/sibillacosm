import { z } from "zod";
import type { TrainingRecord } from "@/lib/types";

const slugPattern = /^[a-z0-9\u0400-\u04ff-]*$/i;
const maxImageSizeBytes = 10 * 1024 * 1024;

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

const requiredImageSchema = optionalImageSchema.refine(Boolean, {
  message: "Выберите изображение.",
});

export const trainingFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Укажите название программы.")
    .max(160, "Название программы слишком длинное."),
  subtitle: z.string().trim().max(200, "Подзаголовок слишком длинный."),
  duration: z.string().trim().max(120, "Длительность слишком длинная."),
  price: z
    .number()
    .finite("Укажите стоимость.")
    .min(0, "Стоимость не может быть отрицательной."),
  description: z.string().trim().max(4000, "Описание слишком длинное."),
  sortOrder: sortOrderField,
  isPublished: z.boolean(),
  slug: slugField,
  coverImage: optionalImageSchema,
  removeCoverImage: z.boolean(),
});

export type TrainingFormValues = z.infer<typeof trainingFormSchema>;

export function createTrainingFormDefaults(
  training?: TrainingRecord | null,
): TrainingFormValues {
  return {
    title: training?.title ?? "",
    subtitle: training?.subtitle ?? "",
    duration: training?.duration ?? "",
    price: training?.price ?? 0,
    description: training?.description ?? "",
    sortOrder: training?.sortOrder ?? 0,
    isPublished: training?.status === "published",
    slug: training?.slug ?? "",
    coverImage: null,
    removeCoverImage: false,
  };
}

export const trainingBlockFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Укажите заголовок блока.")
    .max(160, "Заголовок блока слишком длинный."),
  body: z
    .string()
    .trim()
    .min(1, "Добавьте текст блока.")
    .max(12000, "Текст блока слишком длинный."),
  sortOrder: sortOrderField,
});

export type TrainingBlockFormValues = z.infer<typeof trainingBlockFormSchema>;

export function createTrainingBlockFormDefaults() {
  return {
    title: "",
    body: "",
    sortOrder: 0,
  } satisfies TrainingBlockFormValues;
}

export const trainingImageFormSchema = z.object({
  image: requiredImageSchema,
  alt: z.string().trim().max(200, "Alt-текст слишком длинный."),
  sortOrder: sortOrderField,
});

export type TrainingImageFormValues = z.infer<typeof trainingImageFormSchema>;

export function createTrainingImageFormDefaults() {
  return {
    image: null,
    alt: "",
    sortOrder: 0,
  } as TrainingImageFormValues;
}
