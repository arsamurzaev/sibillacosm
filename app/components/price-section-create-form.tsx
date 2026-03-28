"use client";

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
    createPriceSectionFormDefaults,
    priceSectionFormSchema,
    type PriceSectionFormValues,
} from "@/lib/price-admin-form";
import { pricePageQueryRoot } from "@/lib/query-keys";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormErrorMessage, SectionCardHeader } from "./price-admin-form-shell";
import {
    ApiMutationError,
    applyFieldErrors,
    requestJson,
} from "./price-admin-form-utils";

export function PriceSectionCreateForm({
  cityId,
  onSuccess,
}: {
  cityId: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const defaults = createPriceSectionFormDefaults();
  const form = useForm<PriceSectionFormValues>({
    resolver: zodResolver(priceSectionFormSchema),
    defaultValues: defaults,
    mode: "onSubmit",
  });

  const createMutation = useMutation({
    mutationKey: ["admin", "price-city", cityId, "sections", "create"],
    mutationFn: (values: PriceSectionFormValues) =>
      requestJson(`/api/admin/cities/${cityId}/sections`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      }),
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: pricePageQueryRoot });
      toast.success(payload?.message ?? "Раздел добавлен.");
      onSuccess?.();
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, form.setError);
        form.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось добавить раздел.";
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
            icon={<PlusCircle className="size-4" />}
            title="Новый раздел"
            description="Создайте новую категорию услуг без перехода в отдельную админку."
          />
          <CardContent className="space-y-5 py-6">
            <FormField
              control={form.control}
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

            <FormField
              control={form.control}
              name="guarantee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Гарантия или пояснение</FormLabel>
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
                      Поле можно оставить пустым.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <FormLabel>Опубликовать раздел сразу</FormLabel>
                      <FormDescription>
                        Раздел станет виден на сайте сразу после сохранения.
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
          <Button type="submit" disabled={isBusy} className="sm:min-w-[180px]">
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PlusCircle className="size-4" />
            )}
            Добавить раздел
          </Button>
        </div>
      </form>
    </Form>
  );
}
