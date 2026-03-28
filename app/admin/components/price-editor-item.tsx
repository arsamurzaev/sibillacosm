"use client";
/* eslint-disable @next/next/no-img-element */

import { BeforeAfterImageManager } from "@/app/components/before-after-image-manager";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    getManagedPriceItemImages,
    getPriceItemImageAlt,
} from "@/lib/price-item-images";
import type { PriceItem } from "@/lib/types";
import { CircleHelp, PackageOpen, Settings2 } from "lucide-react";
import {
    deleteItemAction,
    saveItemDetailsAction,
    updateItemAction,
} from "../actions";
import { AdminAdvancedAccordion } from "./admin-advanced-accordion";
import {
    AdminCheckbox,
    AdminField,
    AdminFormActions,
    AdminStatusPill,
    adminDangerButtonClassName,
    adminInputClassName,
    adminPrimaryButtonClassName,
    adminSecondaryButtonClassName,
    adminTextareaClassName,
    formatCurrency,
} from "./admin-ui";
import { hasItemDetails, imageTypeLabel } from "./price-editor-helpers";

interface PriceEditorItemProps {
  item: PriceItem;
  expanded?: boolean;
}

export function PriceEditorItem({
  item,
  expanded = false,
}: PriceEditorItemProps) {
  const detailImages = getManagedPriceItemImages(item.details?.images ?? []);

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={expanded ? item.id : undefined}
    >
      <AccordionItem
        value={item.id}
        id={`item-${item.id}`}
        className="overflow-hidden rounded-[26px] border border-border bg-card"
      >
        <AccordionTrigger className="px-4 py-4 text-left no-underline hover:no-underline [&>svg]:mt-6 [&>svg]:h-10 [&>svg]:w-10 [&>svg]:rounded-full [&>svg]:border [&>svg]:border-border [&>svg]:bg-background [&>svg]:p-2 [&>svg]:text-muted-foreground [&>svg]:translate-y-0">
          <div
            className={`w-full rounded-[24px] border px-4 py-4 transition-colors duration-300 ${
              item.isPublished
                ? "border-border bg-background"
                : "border-amber-200 bg-amber-50/60"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusPill
                    tone={item.isPublished ? "success" : "draft"}
                  >
                    {item.isPublished ? "Виден на сайте" : "Скрыт"}
                  </AdminStatusPill>
                  {hasItemDetails(item) ? (
                    <AdminStatusPill>Есть доп. информация</AdminStatusPill>
                  ) : null}
                </div>
                <h4 className="mt-3 text-lg font-semibold tracking-tight text-foreground md:text-xl">
                  {item.name}
                </h4>
                {item.secondaryLine ? (
                  <p className="mt-1 text-base font-semibold tracking-tight text-foreground/90">
                    {item.secondaryLine}
                  </p>
                ) : null}
                {item.note ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.note}
                  </p>
                ) : null}
              </div>

              <div className="text-right">
                {item.oldPrice ? (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatCurrency(item.oldPrice)}
                  </p>
                ) : null}
                <p className="text-lg font-semibold tracking-tight text-primary">
                  {formatCurrency(item.price)}
                </p>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pb-0">
          <div className="border-t border-border/80 px-4 py-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <PackageOpen className="h-4 w-4" strokeWidth={1.8} />
                    <span className="text-[11px] uppercase tracking-[0.18em]">
                      Как это выглядит на сайте
                    </span>
                  </div>

                  <div className="mt-4 rounded-[24px] border border-border bg-card px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h5 className="text-lg font-semibold tracking-tight text-foreground">
                          {item.name}
                        </h5>
                        {item.secondaryLine ? (
                          <p className="mt-1 text-base font-semibold tracking-tight text-foreground/90">
                            {item.secondaryLine}
                          </p>
                        ) : null}
                        {item.note ? (
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {item.note}
                          </p>
                        ) : null}
                      </div>

                      <div className="text-right">
                        {item.oldPrice ? (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatCurrency(item.oldPrice)}
                          </p>
                        ) : null}
                        <p className="text-lg font-semibold tracking-tight text-primary">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.details?.description ? (
                    <div className="mt-4 rounded-[22px] border border-border bg-card px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Описание процедуры
                      </p>
                      <p className="mt-3 text-sm leading-7 text-foreground/78">
                        {item.details.description}
                      </p>
                      {item.details.extraText ? (
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          {item.details.extraText}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[22px] border border-dashed border-border px-4 py-4 text-sm leading-7 text-muted-foreground">
                      Дополнительное описание пока не заполнено.
                    </div>
                  )}

                  {detailImages.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {detailImages.map((image) => (
                        <figure
                          key={image.id}
                          className="overflow-hidden rounded-[22px] border border-border bg-card"
                        >
                          <div className="border-b border-border/80 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {imageTypeLabel(image.imageType)}
                          </div>
                          <img
                            src={image.imageUrl}
                            alt={getPriceItemImageAlt(image.imageType)}
                            className="h-52 w-full object-cover"
                          />
                        </figure>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-border bg-background/75 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Settings2 className="h-4 w-4" strokeWidth={1.8} />
                    <span className="text-[11px] uppercase tracking-[0.18em]">
                      Основные поля
                    </span>
                  </div>

                  <form action={updateItemAction} className="mt-4 grid gap-4">
                    <input type="hidden" name="id" value={item.id} />

                    <AdminField label="Название услуги">
                      <input
                        className={adminInputClassName}
                        type="text"
                        name="name"
                        defaultValue={item.name}
                      />
                    </AdminField>

                    <AdminField
                      label="Вторая строка"
                      hint="Например: 0,5 мл, 1 мл, полная коррекция."
                    >
                      <input
                        className={adminInputClassName}
                        type="text"
                        name="secondaryLine"
                        defaultValue={item.secondaryLine}
                      />
                    </AdminField>

                    <AdminField
                      label="Короткое примечание"
                      hint="Небольшое пояснение под названием."
                    >
                      <input
                        className={adminInputClassName}
                        type="text"
                        name="note"
                        defaultValue={item.note}
                      />
                    </AdminField>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <AdminField label="Текущая цена">
                        <input
                          className={adminInputClassName}
                          type="number"
                          name="price"
                          defaultValue={item.price}
                        />
                      </AdminField>
                      <AdminField
                        label="Старая цена"
                        hint="Заполняйте только если хотите показать зачёркнутую цену."
                      >
                        <input
                          className={adminInputClassName}
                          type="number"
                          name="oldPrice"
                          defaultValue={item.oldPrice ?? undefined}
                        />
                      </AdminField>
                    </div>

                    <AdminField
                      label="Порядок вывода"
                      hint="Меньшее число показывает услугу выше."
                    >
                      <input
                        className={adminInputClassName}
                        type="number"
                        name="sortOrder"
                        defaultValue={item.sortOrder}
                      />
                    </AdminField>

                    <AdminCheckbox
                      name="isPublished"
                      label="Показывать услугу на сайте"
                      defaultChecked={item.isPublished}
                      hint="Если снять галочку, услуга останется в админке, но исчезнет с сайта."
                    />

                    <AdminAdvancedAccordion value={`item-slug-${item.id}`}>
                      <AdminField
                        label="Slug"
                        hint="Обычно менять не нужно. Если поле пустое, адрес будет сгенерирован автоматически."
                      >
                        <input
                          className={adminInputClassName}
                          type="text"
                          name="slug"
                          defaultValue={item.slug}
                        />
                      </AdminField>
                    </AdminAdvancedAccordion>

                    <AdminFormActions>
                      <button
                        className={adminPrimaryButtonClassName}
                        type="submit"
                      >
                        Сохранить услугу
                      </button>
                    </AdminFormActions>
                  </form>
                </div>

                <div className="rounded-[24px] border border-border bg-background/75 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <CircleHelp className="h-4 w-4" strokeWidth={1.8} />
                    <span className="text-[11px] uppercase tracking-[0.18em]">
                      Блок «Дополнительно»
                    </span>
                  </div>

                  <form
                    action={saveItemDetailsAction}
                    className="mt-4 grid gap-4"
                  >
                    <input type="hidden" name="itemId" value={item.id} />

                    <AdminField
                      label="Описание процедуры"
                      hint="Основной текст, который открывается по кнопке «Дополнительно»."
                    >
                      <textarea
                        className={adminTextareaClassName}
                        name="description"
                        defaultValue={item.details?.description ?? ""}
                      />
                    </AdminField>

                    <AdminField
                      label="Дополнительный текст"
                      hint="Можно использовать для рекомендаций, условий или пояснений."
                    >
                      <textarea
                        className={adminTextareaClassName}
                        name="extraText"
                        defaultValue={item.details?.extraText ?? ""}
                      />
                    </AdminField>

                    <AdminCheckbox
                      name="showMoreEnabled"
                      label="Показывать кнопку «Дополнительно»"
                      defaultChecked={item.details?.showMoreEnabled ?? false}
                      hint="Если текста и фото нет, кнопку лучше не показывать."
                    />

                    <AdminFormActions>
                      <button
                        className={adminSecondaryButtonClassName}
                        type="submit"
                      >
                        Сохранить дополнительную информацию
                      </button>
                    </AdminFormActions>
                  </form>

                  <div className="mt-6 border-t border-border/70 py-6">
                    <p className="text-sm leading-7 text-foreground/72">
                      Фото «До» и «После» теперь находятся здесь же. После
                      выбора файла сразу показывается превью, а alt-текст
                      подставляется автоматически.
                    </p>

                    <div className="mt-4">
                      <BeforeAfterImageManager
                        itemId={item.id}
                        itemName={item.name}
                        images={item.details?.images ?? []}
                      />
                    </div>
                  </div>
                </div>

                <form action={deleteItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className={adminDangerButtonClassName} type="submit">
                    Удалить услугу
                  </button>
                </form>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
