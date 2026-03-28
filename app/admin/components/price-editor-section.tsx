"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PriceSection } from "@/lib/types";
import { MapPinned, PlusCircle, ShieldCheck } from "lucide-react";
import { addItemAction, deleteSectionAction, updateSectionAction } from "../actions";
import {
  AdminCheckbox,
  AdminField,
  AdminFormActions,
  AdminStatusPill,
  adminDangerButtonClassName,
  adminInputClassName,
  adminPrimaryButtonClassName,
  adminTextareaClassName,
} from "./admin-ui";
import { AdminAdvancedAccordion } from "./admin-advanced-accordion";
import { PriceEditorItem } from "./price-editor-item";

interface PriceEditorSectionProps {
  section: PriceSection;
  expanded?: boolean;
  focusedItemId?: string;
}

export function PriceEditorSection({
  section,
  expanded = false,
  focusedItemId,
}: PriceEditorSectionProps) {
  return (
    <Accordion type="single" collapsible defaultValue={expanded ? section.id : undefined}>
      <AccordionItem
        value={section.id}
        id={`section-${section.id}`}
        className="overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_18px_44px_rgba(26,22,20,0.04)]"
      >
        <AccordionTrigger className="px-5 py-5 text-left no-underline hover:no-underline md:px-6 [&>svg]:mt-6 [&>svg]:h-10 [&>svg]:w-10 [&>svg]:rounded-full [&>svg]:border [&>svg]:border-border [&>svg]:bg-background [&>svg]:p-2 [&>svg]:text-muted-foreground [&>svg]:translate-y-0">
          <div className="w-full min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusPill tone={section.isPublished ? "success" : "draft"}>
                    {section.isPublished ? "Опубликован" : "Скрыт"}
                  </AdminStatusPill>
                  <AdminStatusPill>{section.items.length} услуг</AdminStatusPill>
                </div>
                <h3 className="mt-3 font-serif text-3xl leading-none tracking-tight text-primary md:text-4xl">
                  {section.title}
                </h3>
                {section.subtitle ? (
                  <p className="mt-3 max-w-[760px] text-sm leading-7 text-foreground/72">
                    {section.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pb-0">
          <div className="border-t border-border/80 px-5 py-5 md:px-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,430px)]">
              <div className="space-y-4">
                <div className="rounded-[28px] border border-border bg-background/80 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatusPill>{section.items.length} карточек</AdminStatusPill>
                    <AdminStatusPill>{`Порядок: ${section.sortOrder}`}</AdminStatusPill>
                  </div>

                  {section.guarantee ? (
                    <div className="mt-4 rounded-[22px] border border-primary/12 bg-primary/[0.04] px-4 py-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                        <p className="text-sm leading-7 text-foreground/76">{section.guarantee}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[22px] border border-dashed border-border px-4 py-4 text-sm leading-7 text-muted-foreground">
                      В этом разделе пока нет отдельного текста про гарантии или условия.
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <PriceEditorItem
                      key={item.id}
                      item={item}
                      expanded={item.id === focusedItemId}
                    />
                  ))}

                  {section.items.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-border px-4 py-5 text-sm leading-7 text-muted-foreground">
                      В этом разделе пока нет услуг. Добавьте первую карточку справа.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-border bg-background/75 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <MapPinned className="h-4 w-4" strokeWidth={1.8} />
                    <span className="text-[11px] uppercase tracking-[0.18em]">
                      Настройки раздела
                    </span>
                  </div>

                  <form action={updateSectionAction} className="mt-4 grid gap-4">
                    <input type="hidden" name="id" value={section.id} />

                    <AdminField label="Название раздела">
                      <input className={adminInputClassName} type="text" name="title" defaultValue={section.title} />
                    </AdminField>

                    <AdminField label="Подзаголовок">
                      <input className={adminInputClassName} type="text" name="subtitle" defaultValue={section.subtitle} />
                    </AdminField>

                    <AdminField
                      label="Гарантия / пояснение"
                      hint="Например, условия бесплатной коррекции или важные рекомендации."
                    >
                      <textarea
                        className={adminTextareaClassName}
                        name="guarantee"
                        defaultValue={section.guarantee}
                      />
                    </AdminField>

                    <AdminField
                      label="Порядок вывода"
                      hint="Чем меньше число, тем выше раздел расположен на странице."
                    >
                      <input
                        className={adminInputClassName}
                        type="number"
                        name="sortOrder"
                        defaultValue={section.sortOrder}
                      />
                    </AdminField>

                    <AdminCheckbox
                      name="isPublished"
                      label="Показывать раздел на сайте"
                      defaultChecked={section.isPublished}
                      hint="Если выключить, клиентам раздел не будет виден."
                    />

                    <AdminAdvancedAccordion value={`section-slug-${section.id}`}>
                      <AdminField
                        label="Slug"
                        hint="Обычно меняется редко. Если поле оставить пустым, система создаст адрес сама."
                      >
                        <input className={adminInputClassName} type="text" name="slug" defaultValue={section.slug} />
                      </AdminField>
                    </AdminAdvancedAccordion>

                    <AdminFormActions>
                      <button className={adminPrimaryButtonClassName} type="submit">
                        Сохранить раздел
                      </button>
                    </AdminFormActions>
                  </form>
                </div>

                <div className="rounded-[24px] border border-border bg-background/75 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <PlusCircle className="h-4 w-4" strokeWidth={1.8} />
                    <span className="text-[11px] uppercase tracking-[0.18em]">Добавить услугу</span>
                  </div>

                  <form action={addItemAction} className="mt-4 grid gap-4">
                    <input type="hidden" name="sectionId" value={section.id} />

                    <AdminField label="Название услуги">
                      <input className={adminInputClassName} type="text" name="name" required />
                    </AdminField>

                    <AdminField
                      label="Вторая строка"
                      hint="Например: 1 мл, 0,5 мл, полная коррекция."
                    >
                      <input className={adminInputClassName} type="text" name="secondaryLine" />
                    </AdminField>

                    <AdminField label="Короткое примечание">
                      <input className={adminInputClassName} type="text" name="note" />
                    </AdminField>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <AdminField label="Цена">
                        <input className={adminInputClassName} type="number" name="price" defaultValue={0} />
                      </AdminField>
                      <AdminField label="Старая цена">
                        <input className={adminInputClassName} type="number" name="oldPrice" />
                      </AdminField>
                    </div>

                    <AdminField label="Порядок вывода">
                      <input className={adminInputClassName} type="number" name="sortOrder" defaultValue={0} />
                    </AdminField>

                    <AdminCheckbox
                      name="isPublished"
                      label="Показывать услугу сразу"
                      defaultChecked
                      hint="Можно сохранить скрыто, если карточка ещё не готова."
                    />

                    <AdminAdvancedAccordion value={`section-new-item-slug-${section.id}`}>
                      <AdminField
                        label="Slug"
                        hint="Оставьте пустым, если не хотите задавать адрес вручную."
                      >
                        <input className={adminInputClassName} type="text" name="slug" />
                      </AdminField>
                    </AdminAdvancedAccordion>

                    <AdminFormActions>
                      <button className={adminPrimaryButtonClassName} type="submit">
                        Добавить услугу
                      </button>
                    </AdminFormActions>
                  </form>
                </div>

                <form action={deleteSectionAction}>
                  <input type="hidden" name="id" value={section.id} />
                  <button className={adminDangerButtonClassName} type="submit">
                    Удалить раздел
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
