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
import {
    createPriceCityFormDefaults,
    priceCityFormSchema,
    type PriceCityFormValues,
} from "@/lib/price-admin-form";
import { pricePageQueryRoot } from "@/lib/query-keys";
import type { CityRecord } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPinned, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormErrorMessage, SectionCardHeader } from "./price-admin-form-shell";
import {
    ApiMutationError,
    applyFieldErrors,
    requestJson,
} from "./price-admin-form-utils";

export function PriceCityEditorForm({ city }: { city: CityRecord }) {
  const queryClient = useQueryClient();
  const defaults = createPriceCityFormDefaults(city);
  const form = useForm<PriceCityFormValues>({
    resolver: zodResolver(priceCityFormSchema),
    defaultValues: defaults,
    mode: "onSubmit",
  });

  const updateMutation = useMutation({
    mutationKey: ["admin", "price-city", city.id, "update"],
    mutationFn: (values: PriceCityFormValues) =>
      requestJson(`/api/admin/cities/${city.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      }),
    onSuccess: async (payload, values) => {
      form.reset(values);
      await queryClient.invalidateQueries({ queryKey: pricePageQueryRoot });
      toast.success(payload?.message ?? "Город сохранён.");
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        applyFieldErrors(error.fieldErrors, form.setError);
        form.setError("root.serverError", { message: error.message });
        toast.error(error.message);
        return;
      }

      const message = "Не удалось сохранить город.";
      form.setError("root.serverError", { message });
      toast.error(message);
    },
  });

  const isBusy = updateMutation.isPending;
  const handleSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    updateMutation.mutate(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="overflow-hidden rounded-[26px] border-border bg-background/80">
          <SectionCardHeader
            icon={<MapPinned className="size-4" />}
            title="Город"
            description="Изменения применяются к публичной странице города сразу после сохранения."
          />
          <CardContent className="space-y-5 py-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant={city.isActive ? "success" : "outline"}>
                {city.isActive ? "Показывается на сайте" : "Скрыт"}
              </Badge>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название города</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isBusy} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон WhatsApp</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappDisplay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Подпись WhatsApp</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy} />
                    </FormControl>
                    <FormDescription>
                      Короткий текст, который показывается на кнопке или в
                      ссылке.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
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
              name="isActive"
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
                      <FormLabel>Показывать город на сайте</FormLabel>
                      <FormDescription>
                        Если снять галочку, страница города останется в системе,
                        но скроется с сайта.
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
            Сбросить
          </Button>
          <Button type="submit" disabled={isBusy} className="sm:min-w-[180px]">
            {updateMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Сохранить город
          </Button>
        </div>
      </form>
    </Form>
  );
}
