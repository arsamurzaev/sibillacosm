"use client";

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
import {
    createPriceItemCreateDefaults,
    createPriceSectionFormDefaults,
    priceItemCreateFormSchema,
    priceSectionFormSchema,
    type PriceItemCreateFormValues,
    type PriceSectionFormValues,
} from "@/lib/price-admin-form";
import { pricePageQueryRoot } from "@/lib/query-keys";
import type { PriceSection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPinned, PlusCircle, Save, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormErrorMessage, SectionCardHeader } from "./price-admin-form-shell";
import {
    ApiMutationError,
    applyFieldErrors,
    normalizeNullableNumber,
    requestJson,
} from "./price-admin-form-utils";

export function PriceSectionEditorForm({
  section,
  onDelete,
}: {
  section: PriceSection;
  onDelete?: () => void;
}) {
  const queryClient = useQueryClient();
  const sectionDefaults = createPriceSectionFormDefaults(section);
  const itemDefaults = createPriceItemCreateDefaults();
  const sectionForm = useForm<PriceSectionFormValues>({
    resolver: zodResolver(priceSectionFormSchema),
    defaultValues: sectionDefaults,
    mode: "onSubmit",
  });
  const itemForm = useForm<PriceItemCreateFormValues>({
    resolver: zodResolver(priceItemCreateFormSchema),
    defaultValues: itemDefaults,
    mode: "onSubmit",
  });

  const updateMutation = useMutation({
    mutationKey: ["admin", "price-section", section.id, "update"],
    mutationFn: (values: PriceSectionFormValues) =>
      requestJson(`/api/admin/price-sections/${section.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      }),
    onSuccess: async (payload, values) => {
      sectionForm.reset({
        ...values,
        slug: payload?.slug ?? values.slug,
      });
      await queryClient.invalidateQueries({ queryKey: pricePageQueryRoot });
      toast.success(payload?.message ?? "Раздел сохранён.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, sectionForm.setError);
        sectionForm.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось сохранить раздел.";
      sectionForm.setError("root.serverError", { message });
      toast.error(message);
    },
  });

  const createItemMutation = useMutation({
    mutationKey: ["admin", "price-section", section.id, "items", "create"],
    mutationFn: (values: PriceItemCreateFormValues) =>
      requestJson(`/api/admin/price-sections/${section.id}/items`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      }),
    onSuccess: async (payload) => {
      itemForm.reset(createPriceItemCreateDefaults());
      await queryClient.invalidateQueries({ queryKey: pricePageQueryRoot });
      toast.success(payload?.message ?? "Услуга добавлена.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, itemForm.setError);
        itemForm.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось добавить услугу.";
      itemForm.setError("root.serverError", { message });
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["admin", "price-section", section.id, "delete"],
    mutationFn: () =>
      requestJson(`/api/admin/price-sections/${section.id}`, {
        method: "DELETE",
      }),
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: pricePageQueryRoot });
      toast.success(payload?.message ?? "Раздел удалён.");
      onDelete?.();
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        toast.error(error.message);
        return;
      }

      toast.error("Не удалось удалить раздел.");
    },
  });

  const isBusy =
    updateMutation.isPending ||
    createItemMutation.isPending ||
    deleteMutation.isPending;

  const handleSectionSubmit = sectionForm.handleSubmit((values) => {
    sectionForm.clearErrors();
    updateMutation.mutate(values);
  });

  const handleItemSubmit = itemForm.handleSubmit((values) => {
    itemForm.clearErrors();
    createItemMutation.mutate(values);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant={section.isPublished ? "success" : "outline"}>
          {section.isPublished ? "Опубликован" : "Скрыт"}
        </Badge>
        <Badge variant="outline">{section.items.length} услуг</Badge>
      </div>

      <Form {...sectionForm}>
        <form onSubmit={handleSectionSubmit} className="space-y-6">
          <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
            <SectionCardHeader
              icon={<MapPinned className="size-4" />}
              title="Настройки раздела"
              description="Здесь меняются заголовок, порядок и публикация раздела."
            />
            <CardContent className="space-y-5 py-6">
              <FormField
                control={sectionForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название раздела</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sectionForm.control}
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

              <FormField
                control={sectionForm.control}
                name="guarantee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Гарантия / пояснение</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isBusy}
                        className="min-h-28"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={sectionForm.control}
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

                <FormField
                  control={sectionForm.control}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={sectionForm.control}
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
                        <FormLabel>Показывать раздел на сайте</FormLabel>
                        <FormDescription>
                          Если снять галочку, раздел сохранится в админке, но
                          пропадёт с сайта.
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
            message={sectionForm.formState.errors.root?.serverError?.message}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => sectionForm.reset(sectionDefaults)}
              disabled={isBusy}
            >
              Сбросить
            </Button>
            <Button
              type="submit"
              disabled={isBusy}
              className="sm:min-w-[180px]"
            >
              {updateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Сохранить раздел
            </Button>
          </div>
        </form>
      </Form>

      <Form {...itemForm}>
        <form onSubmit={handleItemSubmit} className="space-y-6">
          <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
            <SectionCardHeader
              icon={<PlusCircle className="size-4" />}
              title="Добавить услугу"
              description="После сохранения новую услугу можно сразу открыть и заполнить ей фото и доп. информацию."
            />
            <CardContent className="space-y-5 py-6">
              <FormField
                control={itemForm.control}
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
                control={itemForm.control}
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

              <FormField
                control={itemForm.control}
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
                  control={itemForm.control}
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
                  control={itemForm.control}
                  name="oldPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Старая цена</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={
                            field.value === null ? "" : String(field.value)
                          }
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
                  control={itemForm.control}
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
                control={itemForm.control}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={itemForm.control}
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
                        <FormLabel>Показывать услугу сразу</FormLabel>
                        <FormDescription>
                          Если нужно подготовить карточку позже, снимите галочку
                          перед сохранением.
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
            message={itemForm.formState.errors.root?.serverError?.message}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => itemForm.reset(itemDefaults)}
              disabled={isBusy}
            >
              Очистить
            </Button>
            <Button
              type="submit"
              disabled={isBusy}
              className="sm:min-w-[180px]"
            >
              {createItemMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PlusCircle className="size-4" />
              )}
              Добавить услугу
            </Button>
          </div>
        </form>
      </Form>

      <div className="border-t border-border/80 py-6">
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            if (!window.confirm(`Удалить раздел «${section.title}»?`)) {
              return;
            }

            deleteMutation.mutate();
          }}
          disabled={isBusy}
          className={cn("w-full sm:w-auto")}
        >
          {deleteMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Удалить раздел
        </Button>
      </div>
    </div>
  );
}
