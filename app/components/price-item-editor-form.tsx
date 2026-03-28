"use client";
/* eslint-disable @next/next/no-img-element */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  createPriceItemFormDefaults,
  priceItemFormSchema,
  type PriceItemFormValues,
} from "@/lib/price-item-form";
import {
  getManagedPriceItemImages,
  getPriceItemImageAlt,
} from "@/lib/price-item-images";
import { pricePageQueryRoot } from "@/lib/query-keys";
import type { PriceItem, PriceItemImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CircleHelp,
  ImageUp,
  Loader2,
  Save,
  Settings2,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type ManagedImageType = "before" | "after";

type ApiFieldErrors = Partial<
  Record<keyof PriceItemFormValues, string[] | undefined>
>;

class ApiMutationError extends Error {
  fieldErrors?: ApiFieldErrors;

  constructor(message: string, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.name = "ApiMutationError";
    this.fieldErrors = fieldErrors;
  }
}

async function updatePriceItemRequest(
  itemId: string,
  values: PriceItemFormValues,
) {
  const formData = new FormData();

  formData.set("name", values.name);
  formData.set("secondaryLine", values.secondaryLine);
  formData.set("note", values.note);
  formData.set("price", String(values.price));
  formData.set(
    "oldPrice",
    values.oldPrice === null ? "" : String(values.oldPrice),
  );
  formData.set("sortOrder", String(values.sortOrder));
  formData.set("isPublished", String(values.isPublished));
  formData.set("slug", values.slug);
  formData.set("description", values.description);
  formData.set("extraText", values.extraText);
  formData.set("removeBeforeImage", String(values.removeBeforeImage));
  formData.set("removeAfterImage", String(values.removeAfterImage));

  if (values.beforeImage) {
    formData.set("beforeImage", values.beforeImage);
  }

  if (values.afterImage) {
    formData.set("afterImage", values.afterImage);
  }

  const response = await fetch(`/api/admin/price-items/${itemId}`, {
    method: "PATCH",
    body: formData,
  });
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    fieldErrors?: ApiFieldErrors;
  } | null;

  if (!response.ok) {
    throw new ApiMutationError(
      payload?.message ?? "Не удалось сохранить форму.",
      payload?.fieldErrors,
    );
  }

  return payload;
}

async function deletePriceItemRequest(itemId: string) {
  const response = await fetch(`/api/admin/price-items/${itemId}`, {
    method: "DELETE",
  });
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!response.ok) {
    throw new ApiMutationError(
      payload?.message ?? "Не удалось удалить услугу.",
    );
  }

  return payload;
}

function getExistingManagedImage(
  images: PriceItemImage[],
  imageType: ManagedImageType,
) {
  return images.find((image) => image.imageType === imageType);
}

function normalizeNullableNumber(value: string) {
  if (!value.trim()) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function applyFieldErrors(
  fieldErrors: ApiFieldErrors | undefined,
  setError: ReturnType<typeof useForm<PriceItemFormValues>>["setError"],
) {
  if (!fieldErrors) return;

  for (const [fieldName, errors] of Object.entries(fieldErrors)) {
    if (!errors?.length) continue;

    setError(fieldName as keyof PriceItemFormValues, {
      message: errors[0],
    });
  }
}

function PriceImageField({
  imageType,
  existingImage,
  previewUrl,
  isMarkedForRemoval,
  disabled,
  onFileChange,
  onClear,
}: {
  imageType: ManagedImageType;
  existingImage?: PriceItemImage;
  previewUrl: string | null;
  isMarkedForRemoval: boolean;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
}) {
  const title = imageType === "before" ? "До" : "После";
  const inputId = `price-item-${imageType}-image`;
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleImageUrl =
    previewUrl ??
    (isMarkedForRemoval ? null : (existingImage?.imageUrl ?? null));
  const hasPendingFile = Boolean(previewUrl);
  const canClear = hasPendingFile || Boolean(existingImage);

  return (
    <FormItem className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <FormLabel className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Фото {title.toLowerCase()}
        </FormLabel>
        {canClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={disabled}
            className="h-8 px-2 text-muted-foreground"
          >
            <Undo2 className="size-4" />
            {hasPendingFile
              ? "Отменить"
              : isMarkedForRemoval
                ? "Вернуть"
                : "Убрать"}
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {visibleImageUrl ? (
          <img
            src={visibleImageUrl}
            alt={getPriceItemImageAlt(imageType)}
            className="h-52 w-full object-cover"
          />
        ) : (
          <div className="flex h-52 flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,246,242,0.94))] px-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImageUp className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Фото не выбрано
              </p>
              <p className="text-sm text-muted-foreground">
                После выбора файла здесь появится превью.
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
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <span>
            <ImageUp className="size-4" />
            Выбрать {title.toLowerCase()}
          </span>
        </Button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          tabIndex={-1}
          onChange={(event) => {
            onFileChange(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
      </div>

      <FormDescription>
        {hasPendingFile
          ? "Новое фото будет загружено после сохранения формы."
          : isMarkedForRemoval
            ? "Фото будет удалено после сохранения формы."
            : existingImage
              ? "Если нужно заменить фото, выберите новый файл и сохраните форму."
              : "Фото относится к блоку «Дополнительно» и публикуется после сохранения формы."}
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
}

export function PriceItemEditorForm({
  item,
  onDelete,
}: {
  item: PriceItem;
  onDelete?: () => void;
}) {
  const queryClient = useQueryClient();
  const managedImages = useMemo(
    () => getManagedPriceItemImages(item.details?.images ?? []),
    [item.details?.images],
  );
  const existingBeforeImage = getExistingManagedImage(managedImages, "before");
  const existingAfterImage = getExistingManagedImage(managedImages, "after");
  const [previewUrls, setPreviewUrls] = useState<
    Record<ManagedImageType, string | null>
  >({
    before: null,
    after: null,
  });

  const form = useForm<PriceItemFormValues>({
    resolver: zodResolver(priceItemFormSchema),
    defaultValues: createPriceItemFormDefaults(item),
    mode: "onSubmit",
  });

  const removeBeforeImage = useWatch({
    control: form.control,
    name: "removeBeforeImage",
  });
  const removeAfterImage = useWatch({
    control: form.control,
    name: "removeAfterImage",
  });

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const updatePreview = (
    imageType: ManagedImageType,
    nextUrl: string | null,
  ) => {
    setPreviewUrls((current) => {
      if (current[imageType]) {
        URL.revokeObjectURL(current[imageType]);
      }

      return {
        ...current,
        [imageType]: nextUrl,
      };
    });
  };

  const setImageFile = (imageType: ManagedImageType, file: File | null) => {
    const fieldName = imageType === "before" ? "beforeImage" : "afterImage";
    const removeFieldName =
      imageType === "before" ? "removeBeforeImage" : "removeAfterImage";

    updatePreview(imageType, file ? URL.createObjectURL(file) : null);
    form.setValue(fieldName, file, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(removeFieldName, false, {
      shouldDirty: true,
    });
  };

  const clearImageSelection = (imageType: ManagedImageType) => {
    const existingImage =
      imageType === "before" ? existingBeforeImage : existingAfterImage;
    const fileFieldName = imageType === "before" ? "beforeImage" : "afterImage";
    const removeFieldName =
      imageType === "before" ? "removeBeforeImage" : "removeAfterImage";
    const hasPendingPreview = Boolean(previewUrls[imageType]);

    if (hasPendingPreview) {
      updatePreview(imageType, null);
      form.setValue(fileFieldName, null, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue(removeFieldName, false, { shouldDirty: true });
      return;
    }

    if (!existingImage) {
      return;
    }

    form.setValue(removeFieldName, !form.getValues(removeFieldName), {
      shouldDirty: true,
    });
  };

  const resetLocalFiles = () => {
    setPreviewUrls((current) => {
      Object.values(current).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });

      return { before: null, after: null };
    });

    form.setValue("beforeImage", null);
    form.setValue("afterImage", null);
    form.setValue("removeBeforeImage", false);
    form.setValue("removeAfterImage", false);
  };

  const updateMutation = useMutation({
    mutationKey: ["admin", "price-item", item.id, "update"],
    mutationFn: (values: PriceItemFormValues) =>
      updatePriceItemRequest(item.id, values),
    onSuccess: async (payload) => {
      resetLocalFiles();
      await queryClient.invalidateQueries({ queryKey: pricePageQueryRoot });
      toast.success(payload?.message ?? "Изменения сохранены.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, form.setError);
        form.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось сохранить изменения.";
      form.setError("root.serverError", { message });
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["admin", "price-item", item.id, "delete"],
    mutationFn: () => deletePriceItemRequest(item.id),
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: pricePageQueryRoot });
      toast.success(payload?.message ?? "Услуга удалена.");
      onDelete?.();
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        toast.error(error.message);
        return;
      }

      toast.error("Не удалось удалить услугу.");
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    updateMutation.mutate(values);
  });

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
          <CardHeader className="space-y-2 border-b border-border/80">
            <div className="flex items-center gap-2 text-primary">
              <Settings2 className="size-4" />
              <CardTitle>Основная информация</CardTitle>
            </div>
            <CardDescription>
              Все основные поля собраны в одной форме, поэтому изменения
              сохраняются единообразно.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название услуги</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryLine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Вторая строка</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy} />
                    </FormControl>
                    <FormDescription>
                      Например: 0,5 мл, 1 мл или полная коррекция.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Короткое примечание</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isBusy} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={
                          Number.isFinite(field.value)
                            ? String(field.value)
                            : ""
                        }
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oldPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Старая цена</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={field.value === null ? "" : String(field.value)}
                        onChange={(event) =>
                          field.onChange(
                            normalizeNullableNumber(event.target.value),
                          )
                        }
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Порядок вывода</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={
                          Number.isFinite(field.value)
                            ? String(field.value)
                            : ""
                        }
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isBusy}
                      placeholder="Будет сгенерирован автоматически"
                    />
                  </FormControl>
                  <FormDescription>
                    Поле можно оставить пустым, тогда адрес создастся
                    автоматически.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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
                        disabled={isBusy}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>Показывать услугу на сайте</FormLabel>
                      <FormDescription>
                        Если снять галочку, услуга останется в админке, но
                        исчезнет с сайта.
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
          <CardHeader className="space-y-2 border-b border-border/80">
            <div className="flex items-center gap-2 text-primary">
              <CircleHelp className="size-4" />
              <CardTitle>Дополнительная информация</CardTitle>
            </div>
            <CardDescription>
              Фото тоже относятся к этому блоку. Кнопка «Дополнительно»
              появляется, если заполнен текст или добавлены изображения.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 py-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание процедуры</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isBusy}
                      className="min-h-32"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="extraText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дополнительный текст</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isBusy}
                      className="min-h-28"
                    />
                  </FormControl>
                  <FormDescription>
                    Здесь можно указать рекомендации, нюансы заживления или
                    условия коррекции.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 xl:grid-cols-2">
              <FormField
                control={form.control}
                name="beforeImage"
                render={() => (
                  <PriceImageField
                    imageType="before"
                    existingImage={existingBeforeImage}
                    previewUrl={previewUrls.before}
                    isMarkedForRemoval={removeBeforeImage}
                    disabled={isBusy}
                    onFileChange={(file) => setImageFile("before", file)}
                    onClear={() => clearImageSelection("before")}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="afterImage"
                render={() => (
                  <PriceImageField
                    imageType="after"
                    existingImage={existingAfterImage}
                    previewUrl={previewUrls.after}
                    isMarkedForRemoval={removeAfterImage}
                    disabled={isBusy}
                    onFileChange={(file) => setImageFile("after", file)}
                    onClear={() => clearImageSelection("after")}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {form.formState.errors.root?.serverError?.message ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {form.formState.errors.root.serverError.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border/80 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (!window.confirm(`Удалить услугу «${item.name}»?`)) {
                return;
              }

              deleteMutation.mutate();
            }}
            disabled={isBusy}
            className="sm:order-1"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Удалить услугу
          </Button>

          <div className="flex flex-col gap-3 sm:order-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset(createPriceItemFormDefaults(item));
                resetLocalFiles();
              }}
              disabled={isBusy}
            >
              Сбросить изменения
            </Button>
            <Button
              type="submit"
              disabled={isBusy}
              className={cn("min-w-[180px]")}
            >
              {updateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Сохранить форму
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
