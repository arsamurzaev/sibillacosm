"use client";
/* eslint-disable @next/next/no-img-element */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { TrainingRecord } from "@/lib/types";
import { BookOpen, ImagePlus, Layers3, Settings2 } from "lucide-react";
import {
  addTrainingBlockAction,
  addTrainingImageAction,
  deleteTrainingAction,
  deleteTrainingBlockAction,
  deleteTrainingImageAction,
  updateTrainingAction,
  updateTrainingBlockAction,
} from "../actions";
import {
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
import { AdminAdvancedAccordion } from "./admin-advanced-accordion";

interface TrainingEditorCardProps {
  training: TrainingRecord;
  expanded?: boolean;
}

export function TrainingEditorCard({
  training,
  expanded = false,
}: TrainingEditorCardProps) {
  return (
    <Accordion type="single" collapsible defaultValue={expanded ? training.id : undefined}>
      <AccordionItem
        value={training.id}
        id={`training-card-${training.id}`}
        className="overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_18px_44px_rgba(26,22,20,0.04)]"
      >
        <AccordionTrigger className="px-5 py-5 text-left no-underline hover:no-underline md:px-6 [&>svg]:mt-6 [&>svg]:h-10 [&>svg]:w-10 [&>svg]:rounded-full [&>svg]:border [&>svg]:border-border [&>svg]:bg-background [&>svg]:p-2 [&>svg]:text-muted-foreground [&>svg]:translate-y-0">
          <div className="w-full">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusPill tone={training.status === "published" ? "success" : "draft"}>
                    {training.status === "published" ? "Опубликовано" : "Черновик"}
                  </AdminStatusPill>
                  <AdminStatusPill>{training.blocks.length} блоков</AdminStatusPill>
                  <AdminStatusPill>{training.images.length} фото</AdminStatusPill>
                </div>
                <h2 className="mt-3 font-serif text-3xl leading-none tracking-tight text-primary md:text-4xl">
                  {training.title}
                </h2>
                <p className="mt-3 max-w-[760px] text-sm leading-7 text-foreground/72">
                  {training.description || "Описание пока не заполнено."}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Стоимость
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-primary">
                    {formatCurrency(training.price)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pb-0">
          <div className="border-t border-border/80 px-5 py-5 md:px-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,430px)]">
              <div className="space-y-4">
                <div className="rounded-[28px] border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <BookOpen className="h-4 w-4" strokeWidth={1.8} />
                    <span className="text-[11px] uppercase tracking-[0.18em]">
                      Как это выглядит на сайте
                    </span>
                  </div>

                  <div className="mt-4 rounded-[24px] border border-border bg-card px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatusPill tone={training.status === "published" ? "success" : "draft"}>
                        {training.status === "published" ? "Опубликовано" : "Черновик"}
                      </AdminStatusPill>
                      {training.duration ? <AdminStatusPill>{training.duration}</AdminStatusPill> : null}
                    </div>

                    <h3 className="mt-4 font-serif text-3xl leading-none tracking-tight text-foreground">
                      {training.title}
                    </h3>
                    {training.subtitle ? (
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{training.subtitle}</p>
                    ) : null}
                    <p className="mt-3 text-sm leading-7 text-foreground/78">
                      {training.description || "Описание пока не заполнено."}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/75">
                        {training.duration || "Длительность не указана"}
                      </span>
                      <span className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-primary">
                        {formatCurrency(training.price)}
                      </span>
                    </div>
                  </div>

                  {training.coverImageUrl ? (
                    <figure className="mt-4 overflow-hidden rounded-[22px] border border-border bg-card">
                      <div className="border-b border-border/80 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Обложка
                      </div>
                      <img
                        src={training.coverImageUrl}
                        alt={training.title}
                        className="h-64 w-full object-cover"
                      />
                    </figure>
                  ) : (
                    <div className="mt-4 rounded-[22px] border border-dashed border-border px-4 py-4 text-sm leading-7 text-muted-foreground">
                      Обложка пока не загружена.
                    </div>
                  )}

                  {training.blocks.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {training.blocks.map((block) => (
                        <section key={block.id} className="rounded-[22px] border border-border bg-card px-4 py-4">
                          <h4 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
                            {block.title}
                          </h4>
                          <div className="mt-3 space-y-2 text-sm leading-7 text-foreground/78">
                            {block.body.split("\n").map((line) => (
                              <p key={`${block.id}-${line}`}>{line}</p>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : null}

                  {training.images.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {training.images.map((image) => (
                        <figure
                          key={image.id}
                          className="overflow-hidden rounded-[22px] border border-border bg-card"
                        >
                          <img
                            src={image.imageUrl}
                            alt={image.alt || training.title}
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

                  <form action={updateTrainingAction} className="mt-4 grid gap-4">
                    <input type="hidden" name="id" value={training.id} />
                    <input type="hidden" name="existingCoverImageUrl" value={training.coverImageUrl} />

                    <AdminField label="Название программы">
                      <input className={adminInputClassName} type="text" name="title" defaultValue={training.title} />
                    </AdminField>

                    <AdminField label="Подзаголовок">
                      <input className={adminInputClassName} type="text" name="subtitle" defaultValue={training.subtitle} />
                    </AdminField>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <AdminField label="Длительность">
                        <input className={adminInputClassName} type="text" name="duration" defaultValue={training.duration} />
                      </AdminField>
                      <AdminField label="Стоимость">
                        <input className={adminInputClassName} type="number" name="price" defaultValue={training.price} />
                      </AdminField>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <AdminField label="Порядок вывода">
                        <input className={adminInputClassName} type="number" name="sortOrder" defaultValue={training.sortOrder} />
                      </AdminField>
                      <AdminField label="Статус">
                        <select className={adminInputClassName} name="status" defaultValue={training.status}>
                          <option value="draft">Черновик</option>
                          <option value="published">Опубликовано</option>
                        </select>
                      </AdminField>
                    </div>

                    <AdminField
                      label="Описание"
                      hint="Основной текст, который клиент видит в карточке программы."
                    >
                      <textarea className={adminTextareaClassName} name="description" defaultValue={training.description} />
                    </AdminField>

                    <AdminField
                      label="Новая обложка"
                      hint="Можно заменить текущую обложку. Если файл не выбран, старая обложка сохранится."
                    >
                      <input className={adminInputClassName} type="file" name="coverImage" accept="image/*" />
                    </AdminField>

                    <AdminAdvancedAccordion value={`training-slug-${training.id}`}>
                      <AdminField
                        label="Slug"
                        hint="Если оставить как есть, адрес страницы останется прежним."
                      >
                        <input className={adminInputClassName} type="text" name="slug" defaultValue={training.slug} />
                      </AdminField>
                    </AdminAdvancedAccordion>

                    <AdminFormActions>
                      <button className={adminPrimaryButtonClassName} type="submit">
                        Сохранить программу
                      </button>
                    </AdminFormActions>
                  </form>
                </div>

                <div className="rounded-[24px] border border-border bg-background/75 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Layers3 className="h-4 w-4" strokeWidth={1.8} />
                    <span className="text-[11px] uppercase tracking-[0.18em]">Блоки программы</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {training.blocks.map((block) => (
                      <div key={block.id} className="rounded-[20px] border border-border bg-card p-4">
                        <form action={updateTrainingBlockAction} className="grid gap-4">
                          <input type="hidden" name="id" value={block.id} />

                          <AdminField label="Заголовок блока">
                            <input className={adminInputClassName} type="text" name="title" defaultValue={block.title} />
                          </AdminField>

                          <AdminField label="Порядок вывода">
                            <input className={adminInputClassName} type="number" name="sortOrder" defaultValue={block.sortOrder} />
                          </AdminField>

                          <AdminField label="Текст блока">
                            <textarea className={adminTextareaClassName} name="body" defaultValue={block.body} />
                          </AdminField>

                          <AdminFormActions>
                            <button className={adminSecondaryButtonClassName} type="submit">
                              Сохранить блок
                            </button>
                          </AdminFormActions>
                        </form>

                        <form action={deleteTrainingBlockAction} className="mt-3">
                          <input type="hidden" name="id" value={block.id} />
                          <button className={adminDangerButtonClassName} type="submit">
                            Удалить блок
                          </button>
                        </form>
                      </div>
                    ))}

                    {training.blocks.length === 0 ? (
                      <div className="rounded-[20px] border border-dashed border-border px-4 py-4 text-sm leading-7 text-muted-foreground">
                        Блоки программы пока не добавлены.
                      </div>
                    ) : null}
                  </div>

                  <form action={addTrainingBlockAction} className="mt-4 grid gap-4">
                    <input type="hidden" name="trainingId" value={training.id} />

                    <AdminField label="Новый заголовок блока">
                      <input className={adminInputClassName} type="text" name="title" required />
                    </AdminField>

                    <AdminField label="Порядок вывода">
                      <input className={adminInputClassName} type="number" name="sortOrder" defaultValue={0} />
                    </AdminField>

                    <AdminField label="Текст блока">
                      <textarea className={adminTextareaClassName} name="body" required />
                    </AdminField>

                    <AdminFormActions>
                      <button className={adminSecondaryButtonClassName} type="submit">
                        Добавить блок
                      </button>
                    </AdminFormActions>
                  </form>
                </div>

                <div className="rounded-[24px] border border-border bg-background/75 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <ImagePlus className="h-4 w-4" strokeWidth={1.8} />
                    <span className="text-[11px] uppercase tracking-[0.18em]">Фотографии</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {training.images.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-[20px] border border-border bg-card"
                      >
                        <img
                          src={image.imageUrl}
                          alt={image.alt || training.title}
                          className="h-40 w-full object-cover"
                        />
                        <div className="space-y-2 px-4 py-4 text-sm text-foreground/75">
                          <p>Alt: {image.alt || "—"}</p>
                          <form action={deleteTrainingImageAction}>
                            <input type="hidden" name="id" value={image.id} />
                            <input type="hidden" name="imageUrl" value={image.imageUrl} />
                            <button className={adminDangerButtonClassName} type="submit">
                              Удалить изображение
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}

                    {training.images.length === 0 ? (
                      <div className="rounded-[20px] border border-dashed border-border px-4 py-4 text-sm leading-7 text-muted-foreground">
                        Дополнительные изображения пока не загружены.
                      </div>
                    ) : null}
                  </div>

                  <form action={addTrainingImageAction} className="mt-4 grid gap-4">
                    <input type="hidden" name="trainingId" value={training.id} />

                    <AdminField label="Файл">
                      <input className={adminInputClassName} type="file" name="image" accept="image/*" required />
                    </AdminField>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <AdminField label="Alt-текст">
                        <input className={adminInputClassName} type="text" name="alt" />
                      </AdminField>
                      <AdminField label="Порядок вывода">
                        <input className={adminInputClassName} type="number" name="sortOrder" defaultValue={0} />
                      </AdminField>
                    </div>

                    <AdminFormActions>
                      <button className={adminSecondaryButtonClassName} type="submit">
                        Загрузить изображение
                      </button>
                    </AdminFormActions>
                  </form>
                </div>

                <form action={deleteTrainingAction}>
                  <input type="hidden" name="id" value={training.id} />
                  <button className={adminDangerButtonClassName} type="submit">
                    Удалить программу
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
