"use client";
/* eslint-disable @next/next/no-img-element */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trainingPageQueryRoot } from "@/lib/query-keys";
import {
  createTrainingBlockFormDefaults,
  createTrainingFormDefaults,
  createTrainingImageFormDefaults,
  trainingBlockFormSchema,
  trainingFormSchema,
  trainingImageFormSchema,
  type TrainingBlockFormValues,
  type TrainingFormValues,
  type TrainingImageFormValues,
} from "@/lib/training-admin-form";
import type { TrainingBlock, TrainingImage, TrainingRecord } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  ImagePlus,
  ImageUp,
  Layers3,
  Loader2,
  PlusCircle,
  Save,
  Settings2,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormErrorMessage, SectionCardHeader } from "./price-admin-form-shell";
import {
  ApiMutationError,
  applyFieldErrors,
  requestJson,
} from "./price-admin-form-utils";

function formatCurrency(price: number) {
  return `${price.toLocaleString("ru-RU")} ₽`;
}

const adaptiveTwoColumnGridClassName =
  "grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]";

const adaptiveMediaGridClassName =
  "grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]";

function buildTrainingFormData(values: TrainingFormValues) {
  const formData = new FormData();

  formData.set("title", values.title);
  formData.set("subtitle", values.subtitle);
  formData.set("duration", values.duration);
  formData.set("price", String(values.price));
  formData.set("description", values.description);
  formData.set("sortOrder", String(values.sortOrder));
  formData.set("isPublished", String(values.isPublished));
  formData.set("slug", values.slug);
  formData.set("removeCoverImage", String(values.removeCoverImage));

  if (values.coverImage) {
    formData.set("coverImage", values.coverImage);
  }

  return formData;
}

function buildTrainingImageFormData(values: TrainingImageFormValues) {
  const formData = new FormData();

  if (values.image) {
    formData.set("image", values.image);
  }
  formData.set("alt", values.alt);
  formData.set("sortOrder", String(values.sortOrder));

  return formData;
}

function useObjectPreview(file: File | null) {
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return previewUrl;
}

function TrainingCoverImageField({
  form,
  existingImageUrl,
  disabled,
}: {
  form: UseFormReturn<TrainingFormValues>;
  existingImageUrl?: string;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const coverImage = useWatch({
    control: form.control,
    name: "coverImage",
  });
  const removeCoverImage = useWatch({
    control: form.control,
    name: "removeCoverImage",
  });
  const previewUrl = useObjectPreview(coverImage);
  const visibleImageUrl =
    previewUrl ?? (removeCoverImage ? null : existingImageUrl ?? null);
  const hasPendingFile = Boolean(coverImage);
  const canClear = hasPendingFile || Boolean(existingImageUrl);

  return (
    <FormField
      control={form.control}
      name="coverImage"
      render={() => (
        <FormItem className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <FormLabel>Обложка</FormLabel>
              <FormDescription>
                Фото показывается в раскрытой карточке обучения.
              </FormDescription>
            </div>
            {canClear ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                disabled={disabled}
                onClick={() => {
                  if (hasPendingFile) {
                    form.setValue("coverImage", null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    form.setValue("removeCoverImage", false, {
                      shouldDirty: true,
                    });
                    return;
                  }

                  form.setValue(
                    "removeCoverImage",
                    !form.getValues("removeCoverImage"),
                    {
                      shouldDirty: true,
                    },
                  );
                }}
              >
                <Undo2 className="size-4" />
                {hasPendingFile
                  ? "Отменить"
                  : removeCoverImage
                    ? "Вернуть"
                    : "Убрать"}
              </Button>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {visibleImageUrl ? (
              <img
                src={visibleImageUrl}
                alt="Обложка обучения"
                className="h-56 w-full object-cover"
              />
            ) : (
              <div className="flex h-56 flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,246,242,0.94))] px-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ImageUp className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Обложка не выбрана
                  </p>
                  <p className="text-sm text-muted-foreground">
                    После выбора изображения здесь появится превью.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <ImageUp className="size-4" />
              Выбрать обложку
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled}
              tabIndex={-1}
              onChange={(event) => {
                form.setValue("coverImage", event.target.files?.[0] ?? null, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                form.setValue("removeCoverImage", false, {
                  shouldDirty: true,
                });
                event.target.value = "";
              }}
            />
          </div>

          <FormDescription>
            {hasPendingFile
              ? "Новая обложка будет загружена после сохранения формы."
              : removeCoverImage
                ? "Обложка будет удалена после сохранения формы."
                : existingImageUrl
                  ? "Чтобы заменить обложку, выберите новое изображение и сохраните форму."
                  : "Обложку можно добавить сейчас или позже."}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TrainingGalleryImageField({
  form,
  disabled,
}: {
  form: UseFormReturn<TrainingImageFormValues>;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const image = useWatch({
    control: form.control,
    name: "image",
  });
  const previewUrl = useObjectPreview(image);

  return (
    <FormField
      control={form.control}
      name="image"
      render={() => (
        <FormItem className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <FormLabel>Файл</FormLabel>
              <FormDescription>
                Дополнительное изображение для раскрытого блока обучения.
              </FormDescription>
            </div>
            {image ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                disabled={disabled}
                onClick={() =>
                  form.setValue("image", null, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <Undo2 className="size-4" />
                Убрать
              </Button>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Превью изображения"
                className="h-52 w-full object-cover"
              />
            ) : (
              <div className="flex h-52 flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,246,242,0.94))] px-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ImagePlus className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Изображение не выбрано
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Сначала выберите файл, затем сохраните форму.
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            Выбрать изображение
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            tabIndex={-1}
            onChange={(event) => {
              form.setValue("image", event.target.files?.[0] ?? null, {
                shouldDirty: true,
                shouldValidate: true,
              });
              event.target.value = "";
            }}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TrainingBlockEditorCard({ block }: { block: TrainingBlock }) {
  const queryClient = useQueryClient();
  const form = useForm<TrainingBlockFormValues>({
    resolver: zodResolver(trainingBlockFormSchema),
    defaultValues: {
      title: block.title,
      body: block.body,
      sortOrder: block.sortOrder,
    },
    mode: "onSubmit",
  });

  const updateMutation = useMutation({
    mutationKey: ["admin", "training-block", block.id, "update"],
    mutationFn: (values: TrainingBlockFormValues) =>
      requestJson(`/api/admin/training-blocks/${block.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      }),
    onSuccess: async (payload, values) => {
      form.reset(values);
      await queryClient.invalidateQueries({ queryKey: trainingPageQueryRoot });
      toast.success(payload?.message ?? "Блок сохранён.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, form.setError);
        form.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось сохранить блок.";
      form.setError("root.serverError", { message });
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["admin", "training-block", block.id, "delete"],
    mutationFn: () =>
      requestJson(`/api/admin/training-blocks/${block.id}`, {
        method: "DELETE",
      }),
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: trainingPageQueryRoot });
      toast.success(payload?.message ?? "Блок удалён.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        toast.error(error.message);
        return;
      }

      toast.error("Не удалось удалить блок.");
    },
  });

  const isBusy = updateMutation.isPending || deleteMutation.isPending;
  const handleSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    updateMutation.mutate(values);
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[26px] border border-border bg-background/80 p-5"
      >
        <div className={adaptiveTwoColumnGridClassName}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Заголовок блока</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isBusy} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Порядок вывода</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={Number.isFinite(field.value) ? String(field.value) : ""}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    disabled={isBusy}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Текст блока</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isBusy} className="min-h-36" />
              </FormControl>
              <FormDescription>
                Каждую строку можно использовать как отдельный пункт. Для списка
                начинайте строку с дефиса.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormErrorMessage
          message={form.formState.errors.root?.serverError?.message}
        />

        <div className="flex flex-col gap-3 border-t border-border/80 pt-5">
          <Button
            type="button"
            variant="destructive"
            disabled={isBusy}
            onClick={() => deleteMutation.mutate()}
            className="w-full"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Удалить блок
          </Button>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() =>
                form.reset({
                  title: block.title,
                  body: block.body,
                  sortOrder: block.sortOrder,
                })
              }
            >
              Сбросить
            </Button>
            <Button type="submit" disabled={isBusy} className="w-full">
              {updateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Сохранить блок
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function TrainingImageCard({
  image,
  trainingTitle,
}: {
  image: TrainingImage;
  trainingTitle: string;
}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationKey: ["admin", "training-image", image.id, "delete"],
    mutationFn: () =>
      requestJson(`/api/admin/training-images/${image.id}`, {
        method: "DELETE",
      }),
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: trainingPageQueryRoot });
      toast.success(payload?.message ?? "Изображение удалено.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        toast.error(error.message);
        return;
      }

      toast.error("Не удалось удалить изображение.");
    },
  });

  return (
    <Card className="overflow-hidden rounded-[24px] border-border bg-background/80">
      <img
        src={image.imageUrl}
        alt={image.alt || trainingTitle}
        className="h-44 w-full object-cover"
      />
      <CardContent className="space-y-4 py-5">
        <div className="space-y-2 text-sm text-foreground/75">
          <p>Alt: {image.alt || "—"}</p>
          <p>Порядок: {image.sortOrder}</p>
        </div>

        <Button
          type="button"
          variant="destructive"
          disabled={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate()}
          className="w-full"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Удалить изображение
        </Button>
      </CardContent>
    </Card>
  );
}

export function TrainingCreateForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const defaults = createTrainingFormDefaults();
  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: defaults,
    mode: "onSubmit",
  });

  const createMutation = useMutation({
    mutationKey: ["admin", "trainings", "create"],
    mutationFn: (values: TrainingFormValues) =>
      requestJson("/api/admin/trainings", {
        method: "POST",
        body: buildTrainingFormData(values),
      }),
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: trainingPageQueryRoot });
      toast.success(payload?.message ?? "Программа добавлена.");
      onSuccess?.();
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, form.setError);
        form.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось добавить программу.";
      form.setError("root.serverError", { message });
      toast.error(message);
    },
  });

  const isBusy = createMutation.isPending;
  const handleSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    createMutation.mutate(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
          <SectionCardHeader
            icon={<GraduationCap className="size-4" />}
            title="Новая программа"
            description="Создайте новую карточку обучения прямо на публичной странице без перехода в отдельную админку."
          />
          <CardContent className="space-y-5 py-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название программы</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isBusy} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Подзаголовок</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isBusy} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={adaptiveTwoColumnGridClassName}>
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Длительность</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isBusy}
                        placeholder="Например: 3–5 дней"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Стоимость</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={Number.isFinite(field.value) ? String(field.value) : ""}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className={adaptiveTwoColumnGridClassName}>
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Порядок вывода</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={Number.isFinite(field.value) ? String(field.value) : ""}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isBusy}
                        placeholder="Будет сгенерирован автоматически"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isBusy} className="min-h-32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TrainingCoverImageField form={form} disabled={isBusy} />

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                        disabled={isBusy}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>Опубликовать программу сразу</FormLabel>
                      <FormDescription>
                        Если снять галочку, программа сохранится как черновик и
                        останется видна только в admin-режиме.
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <FormErrorMessage
          message={form.formState.errors.root?.serverError?.message}
        />

        <div className="flex flex-col gap-3 border-t border-border/80 py-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset(defaults)}
            disabled={isBusy}
          >
            Очистить
          </Button>
          <Button type="submit" disabled={isBusy} className="sm:min-w-[190px]">
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PlusCircle className="size-4" />
            )}
            Добавить программу
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function TrainingEditorForm({
  training,
  onDelete,
}: {
  training: TrainingRecord;
  onDelete?: () => void;
}) {
  const queryClient = useQueryClient();
  const defaults = createTrainingFormDefaults(training);
  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: defaults,
    mode: "onSubmit",
  });
  const addBlockForm = useForm<TrainingBlockFormValues>({
    resolver: zodResolver(trainingBlockFormSchema),
    defaultValues: createTrainingBlockFormDefaults(),
    mode: "onSubmit",
  });
  const addImageForm = useForm<TrainingImageFormValues>({
    resolver: zodResolver(trainingImageFormSchema),
    defaultValues: createTrainingImageFormDefaults(),
    mode: "onSubmit",
  });

  const updateMutation = useMutation({
    mutationKey: ["admin", "training", training.id, "update"],
    mutationFn: (values: TrainingFormValues) =>
      requestJson(`/api/admin/trainings/${training.id}`, {
        method: "PATCH",
        body: buildTrainingFormData(values),
      }),
    onSuccess: async (payload, values) => {
      form.reset({
        ...values,
        slug: payload?.slug ?? values.slug,
        coverImage: null,
        removeCoverImage: false,
      });
      await queryClient.invalidateQueries({ queryKey: trainingPageQueryRoot });
      toast.success(payload?.message ?? "Программа сохранена.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, form.setError);
        form.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось сохранить программу.";
      form.setError("root.serverError", { message });
      toast.error(message);
    },
  });

  const createBlockMutation = useMutation({
    mutationKey: ["admin", "training", training.id, "blocks", "create"],
    mutationFn: (values: TrainingBlockFormValues) =>
      requestJson(`/api/admin/trainings/${training.id}/blocks`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      }),
    onSuccess: async (payload) => {
      addBlockForm.reset(createTrainingBlockFormDefaults());
      await queryClient.invalidateQueries({ queryKey: trainingPageQueryRoot });
      toast.success(payload?.message ?? "Блок добавлен.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, addBlockForm.setError);
        addBlockForm.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось добавить блок.";
      addBlockForm.setError("root.serverError", { message });
      toast.error(message);
    },
  });

  const createImageMutation = useMutation({
    mutationKey: ["admin", "training", training.id, "images", "create"],
    mutationFn: (values: TrainingImageFormValues) =>
      requestJson(`/api/admin/trainings/${training.id}/images`, {
        method: "POST",
        body: buildTrainingImageFormData(values),
      }),
    onSuccess: async (payload) => {
      addImageForm.reset(createTrainingImageFormDefaults());
      await queryClient.invalidateQueries({ queryKey: trainingPageQueryRoot });
      toast.success(payload?.message ?? "Изображение добавлено.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, addImageForm.setError);
        addImageForm.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось загрузить изображение.";
      addImageForm.setError("root.serverError", { message });
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["admin", "training", training.id, "delete"],
    mutationFn: () =>
      requestJson(`/api/admin/trainings/${training.id}`, {
        method: "DELETE",
      }),
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: trainingPageQueryRoot });
      toast.success(payload?.message ?? "Программа удалена.");
      onDelete?.();
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        toast.error(error.message);
        return;
      }

      toast.error("Не удалось удалить программу.");
    },
  });

  const isMainBusy = updateMutation.isPending || deleteMutation.isPending;
  const isBlockCreateBusy = createBlockMutation.isPending;
  const isImageCreateBusy = createImageMutation.isPending;

  const handleTrainingSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    updateMutation.mutate(values);
  });

  const handleAddBlockSubmit = addBlockForm.handleSubmit((values) => {
    addBlockForm.clearErrors();
    createBlockMutation.mutate(values);
  });

  const handleAddImageSubmit = addImageForm.handleSubmit((values) => {
    addImageForm.clearErrors();
    createImageMutation.mutate(values);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant={training.status === "published" ? "success" : "outline"}>
          {training.status === "published" ? "Опубликовано" : "Черновик"}
        </Badge>
        <Badge variant="outline">{training.blocks.length} блоков</Badge>
        <Badge variant="outline">{formatCurrency(training.price)}</Badge>
      </div>

      <Form {...form}>
        <form onSubmit={handleTrainingSubmit} className="space-y-6">
          <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
            <SectionCardHeader
              icon={<Settings2 className="size-4" />}
              title="Основная информация"
              description="Здесь меняются заголовки, описание, публикация и обложка программы."
            />
            <CardContent className="space-y-5 py-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название программы</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isMainBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Подзаголовок</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isMainBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className={adaptiveTwoColumnGridClassName}>
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Длительность</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isMainBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Стоимость</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={Number.isFinite(field.value) ? String(field.value) : ""}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                          disabled={isMainBusy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className={adaptiveTwoColumnGridClassName}>
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Порядок вывода</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={Number.isFinite(field.value) ? String(field.value) : ""}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                          disabled={isMainBusy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isMainBusy}
                          placeholder="Будет сгенерирован автоматически"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isMainBusy}
                        className="min-h-32"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TrainingCoverImageField
                form={form}
                existingImageUrl={training.coverImageUrl}
                disabled={isMainBusy}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                          disabled={isMainBusy}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Показывать программу на сайте</FormLabel>
                        <FormDescription>
                          Если снять галочку, программа сохранится как черновик и
                          пропадёт с публичной страницы.
                        </FormDescription>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <FormErrorMessage
            message={form.formState.errors.root?.serverError?.message}
          />

          <div className="flex flex-col gap-3 border-t border-border/80 py-6 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={isMainBusy}
              onClick={() => form.reset(createTrainingFormDefaults(training))}
            >
              Сбросить
            </Button>
            <Button
              type="submit"
              disabled={isMainBusy}
              className="sm:min-w-[190px]"
            >
              {updateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Сохранить программу
            </Button>
          </div>
        </form>
      </Form>

      <div className="space-y-6">
        <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
          <SectionCardHeader
            icon={<Layers3 className="size-4" />}
            title="План обучения"
            description="Каждый блок становится отдельным разделом в программе курса."
          />
          <CardContent className="space-y-5 py-6">
            <div className="space-y-4">
              {training.blocks.length > 0 ? (
                training.blocks.map((block) => (
                  <TrainingBlockEditorCard key={block.id} block={block} />
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-border px-4 py-4 text-sm leading-7 text-muted-foreground">
                  Блоки программы пока не добавлены.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Form {...addBlockForm}>
          <form onSubmit={handleAddBlockSubmit} className="space-y-6">
            <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
              <SectionCardHeader
                icon={<PlusCircle className="size-4" />}
                title="Добавить блок"
                description="Новый блок сразу попадёт в план обучения и появится в редакторе ниже."
              />
              <CardContent className="space-y-5 py-6">
                <div className={adaptiveTwoColumnGridClassName}>
                  <FormField
                    control={addBlockForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Заголовок блока</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isBlockCreateBusy} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addBlockForm.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Порядок вывода</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={Number.isFinite(field.value) ? String(field.value) : ""}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value))
                            }
                            disabled={isBlockCreateBusy}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addBlockForm.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Текст блока</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={isBlockCreateBusy}
                          className="min-h-36"
                        />
                      </FormControl>
                      <FormDescription>
                        Структуру можно переносить строками так же, как она
                        отображается на сайте.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <FormErrorMessage
              message={addBlockForm.formState.errors.root?.serverError?.message}
            />

            <div className="flex flex-col gap-3 border-t border-border/80 py-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isBlockCreateBusy}
                onClick={() =>
                  addBlockForm.reset(createTrainingBlockFormDefaults())
                }
              >
                Очистить
              </Button>
              <Button
                type="submit"
                disabled={isBlockCreateBusy}
                className="sm:min-w-[170px]"
              >
                {createBlockMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PlusCircle className="size-4" />
                )}
                Добавить блок
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
          <SectionCardHeader
            icon={<ImagePlus className="size-4" />}
            title="Галерея"
            description="Здесь управляются обложка и дополнительные изображения для раскрытой карточки."
          />
          <CardContent className="space-y-5 py-6">
            {training.images.length > 0 ? (
              <div className={adaptiveMediaGridClassName}>
                {training.images.map((image) => (
                  <TrainingImageCard
                    key={image.id}
                    image={image}
                    trainingTitle={training.title}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-border px-4 py-4 text-sm leading-7 text-muted-foreground">
                Дополнительные изображения пока не загружены.
              </div>
            )}
          </CardContent>
        </Card>

        <Form {...addImageForm}>
          <form onSubmit={handleAddImageSubmit} className="space-y-6">
            <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
              <SectionCardHeader
                icon={<ImageUp className="size-4" />}
                title="Добавить изображение"
                description="Новое изображение будет показано в раскрытом блоке обучения после сохранения."
              />
              <CardContent className="space-y-5 py-6">
                <TrainingGalleryImageField
                  form={addImageForm}
                  disabled={isImageCreateBusy}
                />

                <div className={adaptiveTwoColumnGridClassName}>
                  <FormField
                    control={addImageForm.control}
                    name="alt"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Alt-текст</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isImageCreateBusy}
                            placeholder="Можно оставить пустым"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addImageForm.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Порядок вывода</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={Number.isFinite(field.value) ? String(field.value) : ""}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value))
                            }
                            disabled={isImageCreateBusy}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <FormErrorMessage
              message={addImageForm.formState.errors.root?.serverError?.message}
            />

            <div className="flex flex-col gap-3 border-t border-border/80 py-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isImageCreateBusy}
                onClick={() =>
                  addImageForm.reset(createTrainingImageFormDefaults())
                }
              >
                Очистить
              </Button>
              <Button
                type="submit"
                disabled={isImageCreateBusy}
                className="sm:min-w-[200px]"
              >
                {createImageMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImageUp className="size-4" />
                )}
                Загрузить изображение
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="border-t border-border/80 pt-6">
        <Button
          type="button"
          variant="destructive"
          disabled={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate()}
          className="w-full sm:w-auto sm:min-w-[220px]"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Удалить программу
        </Button>
      </div>
    </div>
  );
}
