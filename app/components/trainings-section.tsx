"use client";
/* eslint-disable @next/next/no-img-element */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trainingPageQueryKey } from "@/lib/query-keys";
import type {
  CityRecord,
  TrainingBlock,
  TrainingPageData,
  TrainingRecord,
} from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminExitButton } from "./admin-exit-button";
import { PublicEditLink } from "./public-edit-link";
import {
  TrainingAdminDrawer,
  type TrainingDrawerState,
} from "./training-admin-drawer";

const trainingDrawerStorageKey = "training-admin-drawer";

function readStoredTrainingDrawerState(): TrainingDrawerState {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.sessionStorage.getItem(trainingDrawerStorageKey);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as TrainingDrawerState;
    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
      return null;
    }

    if (parsed.type === "addTraining") {
      return parsed;
    }

    if (parsed.type === "training" && typeof parsed.trainingId === "string") {
      return parsed;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
}

function isValidTrainingDrawerState(
  trainings: TrainingRecord[],
  state: TrainingDrawerState,
) {
  if (!state || state.type === "addTraining") return true;
  return trainings.some((training) => training.id === state.trainingId);
}

function formatPrice(price: number) {
  return price > 0 ? `${price.toLocaleString("ru-RU")} ₽` : "Цена по запросу";
}

function buildTrainingMessage(training: TrainingRecord) {
  return [
    "Здравствуйте!",
    "",
    `Интересует обучение: ${training.title}.`,
    training.duration ? `Длительность: ${training.duration}.` : "",
    "Подскажите, пожалуйста, ближайшие даты и условия участия.",
  ]
    .filter(Boolean)
    .join("\n");
}

function getTrainingBlockLines(body: string) {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function TrainingPlanBlock({
  block,
  isLast,
}: {
  block: TrainingBlock;
  isLast: boolean;
}) {
  const lines = getTrainingBlockLines(block.body);

  if (lines.length === 0) {
    return null;
  }

  return (
    <section
      className={
        isLast ? "space-y-4" : "space-y-4 border-b border-border/70 pb-6"
      }
    >
      <h4 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary/85">
        {block.title}
      </h4>
      <div className="space-y-2.5 text-[15px] leading-7 text-foreground/78">
        {lines.map((line, index) => {
          const bulletMatch = line.match(/^[-•]\s*(.+)$/);

          if (bulletMatch) {
            return (
              <div key={`${block.id}-${index}`} className="flex gap-3">
                <span className="mt-0.5 text-primary/55">-</span>
                <p className="flex-1">{bulletMatch[1]}</p>
              </div>
            );
          }

          return <p key={`${block.id}-${index}`}>{line}</p>;
        })}
      </div>
    </section>
  );
}

interface TrainingsSectionProps {
  trainings: TrainingRecord[];
  contactCity: CityRecord | null;
  adminLoggedIn?: boolean;
  adminEditMode?: boolean;
}

async function fetchTrainingPage() {
  const response = await fetch("/api/trainings", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить страницу обучения.");
  }

  return (await response.json()) as TrainingPageData;
}

export function TrainingsSection({
  trainings,
  contactCity,
  adminLoggedIn = false,
  adminEditMode = false,
}: TrainingsSectionProps) {
  const { data: trainingPage = { trainings, contactCity } } = useQuery({
    queryKey: trainingPageQueryKey,
    queryFn: fetchTrainingPage,
    initialData: {
      trainings,
      contactCity,
    } satisfies TrainingPageData,
    enabled: adminEditMode,
  });
  const [drawerState, setDrawerState] = useState<TrainingDrawerState>(() =>
    adminEditMode ? readStoredTrainingDrawerState() : null,
  );
  const resolvedDrawerState = useMemo(
    () =>
      isValidTrainingDrawerState(trainingPage.trainings, drawerState)
        ? drawerState
        : null,
    [drawerState, trainingPage.trainings],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !adminEditMode) return;

    if (resolvedDrawerState) {
      window.sessionStorage.setItem(
        trainingDrawerStorageKey,
        JSON.stringify(resolvedDrawerState),
      );
      return;
    }

    window.sessionStorage.removeItem(trainingDrawerStorageKey);
  }, [adminEditMode, resolvedDrawerState]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[900px] px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-12">
        <header className="rounded-[32px] border border-border bg-card px-5 py-6 shadow-[0_14px_40px_rgba(26,22,20,0.05)] md:px-7 md:py-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-300 hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
              Назад
            </Link>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Academy
              </span>
              {adminEditMode ? (
                <>
                  <PublicEditLink
                    onClick={() => setDrawerState({ type: "addTraining" })}
                    label="Добавить программу"
                    icon={<Plus className="h-4 w-4" strokeWidth={1.8} />}
                  />
                  <AdminExitButton />
                </>
              ) : null}
            </div>
          </div>

          <h1 className="mt-6 font-serif text-5xl leading-none tracking-tight md:text-6xl">
            Обучение
          </h1>
          <p className="mt-5 max-w-[620px] text-sm leading-7 text-foreground/72 md:text-[15px]">
            Отдельный раздел для программ обучения. Тексты, стоимость,
            длительность, структура курса и фото управляются прямо с этой
            страницы.
          </p>

          {trainingPage.contactCity ? (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${trainingPage.contactCity.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-4 py-2 text-sm text-foreground/75 transition-colors duration-300 hover:border-primary/30 hover:text-primary"
              >
                {trainingPage.contactCity.whatsappDisplay}
              </a>
              <a
                href={`https://instagram.com/${trainingPage.contactCity.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-4 py-2 text-sm text-foreground/75 transition-colors duration-300 hover:border-primary/30 hover:text-primary"
              >
                @{trainingPage.contactCity.instagram}
              </a>
            </div>
          ) : null}
        </header>

        <section className="mt-8 space-y-5">
          {trainingPage.trainings.length === 0 ? (
            <div className="rounded-[28px] border border-border bg-card px-5 py-6 text-sm leading-7 text-foreground/70">
              Пока нет опубликованных программ. Первая карточка добавляется
              прямо из встроенного режима редактирования на этой странице.
            </div>
          ) : null}

          {trainingPage.trainings.map((training, index) => {
            const whatsappUrl =
              trainingPage.contactCity &&
              `https://wa.me/${trainingPage.contactCity.whatsapp}?text=${encodeURIComponent(
                buildTrainingMessage(training),
              )}`;

            const previewDescription =
              training.description || "Описание программы пока не заполнено.";

            return (
              <Accordion
                key={training.id}
                type="single"
                collapsible
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <AccordionItem
                  value={training.id}
                  id={`training-public-${training.id}`}
                  className="overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_14px_40px_rgba(26,22,20,0.04)]"
                >
                  <div className="px-5 py-5 md:px-6 md:py-6">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 pr-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        {training.subtitle || "Программа"}
                      </p>

                      <div className="flex shrink-0 items-center gap-2">
                        {adminEditMode ? (
                          <PublicEditLink
                            onClick={() =>
                              setDrawerState({
                                type: "training",
                                trainingId: training.id,
                              })
                            }
                            label={`Редактировать программу ${training.title}`}
                          />
                        ) : null}

                        <AccordionTrigger className="!flex-none !items-center !justify-center !gap-0 !py-0 h-10 w-10 rounded-full border border-border bg-background text-muted-foreground no-underline shadow-[0_10px_24px_rgba(26,22,20,0.05)] transition-all duration-300 hover:border-primary/25 hover:bg-card hover:text-primary hover:no-underline [&>svg]:h-4 [&>svg]:w-4 [&>svg]:translate-y-0 [&>svg]:text-current">
                          <span className="sr-only">{`Переключить программу ${training.title}`}</span>
                        </AccordionTrigger>
                      </div>
                    </div>

                    <div className="mt-5 min-w-0">
                      <h2 className="font-serif text-[clamp(2.1rem,8.6vw,3.2rem)] leading-[0.94] tracking-tight">
                        {training.title}
                      </h2>

                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-2 text-primary">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/65">
                            Стоимость
                          </span>
                          <span className="text-base font-semibold">
                            {formatPrice(training.price)}
                          </span>
                        </span>

                        {training.duration ? (
                          <span className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/72">
                            {training.duration}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-5 line-clamp-4 max-w-[42rem] text-sm leading-7 text-foreground/72">
                        {previewDescription}
                      </p>
                    </div>
                  </div>

                  <AccordionContent className="pb-0">
                    <div className="border-t border-border/80 px-5 py-5 md:px-6 md:py-6">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="rounded-[24px] border border-border bg-background px-4 py-4.5">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            О курсе
                          </p>
                          <div className="mt-4 space-y-3 text-sm leading-7 text-foreground/80">
                            {training.duration ? (
                              <p>Длительность: {training.duration}</p>
                            ) : null}
                            <p>{previewDescription}</p>
                          </div>
                        </div>

                        {whatsappUrl && !adminLoggedIn ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex min-h-[184px] flex-col justify-between rounded-[24px] border border-primary/15 bg-[linear-gradient(155deg,rgba(123,22,42,0.02),rgba(123,22,42,0.08))] px-5 py-5 text-left shadow-[0_12px_26px_rgba(123,22,42,0.04)] transition-all duration-300 hover:-translate-y-px hover:border-primary/28 hover:bg-[linear-gradient(155deg,rgba(123,22,42,0.04),rgba(123,22,42,0.11))]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/16 bg-background text-primary shadow-[0_10px_24px_rgba(26,22,20,0.05)]">
                                <MessageCircle
                                  className="h-4.5 w-4.5"
                                  strokeWidth={1.8}
                                />
                              </span>
                              <span className="pt-1 text-[10px] uppercase tracking-[0.22em] text-primary/55">
                                WhatsApp
                              </span>
                            </div>

                            <div className="space-y-2">
                              <p className="text-lg font-semibold leading-snug text-foreground">
                                Записаться на обучение
                              </p>
                              <p className="max-w-[15rem] text-sm leading-6 text-foreground/68">
                                Уточнить даты, формат курса и условия участия.
                              </p>
                            </div>

                            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                              Написать в WhatsApp
                              <ArrowUpRight
                                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                strokeWidth={1.8}
                              />
                            </span>
                          </a>
                        ) : null}
                      </div>

                      {training.blocks.length > 0 ? (
                        <section className="mt-6 overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(249,246,242,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                          <div className="border-b border-border/75 px-5 py-4.5 md:px-6">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                              Программа курса
                            </p>
                            <h3 className="mt-2 font-serif text-2xl leading-none tracking-tight md:text-[2rem]">
                              План обучения
                            </h3>
                          </div>

                          <div className="space-y-6 px-5 py-5 md:px-6 md:py-6">
                            {training.blocks.map((block, blockIndex) => (
                              <TrainingPlanBlock
                                key={block.id}
                                block={block}
                                isLast={blockIndex === training.blocks.length - 1}
                              />
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {training.coverImageUrl || training.images.length > 0 ? (
                        <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                          {training.coverImageUrl ? (
                            <figure className="overflow-hidden rounded-[22px] border border-border bg-background">
                              <div className="border-b border-border/80 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                Обложка
                              </div>
                              <img
                                src={training.coverImageUrl}
                                alt={training.title}
                                className="h-64 w-full object-cover"
                              />
                            </figure>
                          ) : null}

                          {training.images.map((image) => (
                            <figure
                              key={image.id}
                              className="overflow-hidden rounded-[22px] border border-border bg-background"
                            >
                              <img
                                src={image.imageUrl}
                                alt={image.alt || training.title}
                                className="h-64 w-full object-cover"
                              />
                            </figure>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })}
        </section>
      </div>

      {adminEditMode ? (
        <TrainingAdminDrawer
          trainings={trainingPage.trainings}
          state={resolvedDrawerState}
          onClose={() => setDrawerState(null)}
        />
      ) : null}
    </main>
  );
}
