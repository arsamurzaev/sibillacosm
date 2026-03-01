"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { trainings, type City } from "../data";

interface TrainingsSectionProps {
  city: City;
}

function formatTrainingPrice(price: number): string {
  return price > 0 ? `${price.toLocaleString("ru-RU")} \u20BD` : "Цена по запросу";
}

export function TrainingsSection({ city }: TrainingsSectionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const visibleTrainings = useMemo(
    () => trainings.filter((t) => t.prices[city] > 0 || t.prices.grozny > 0 || t.prices.moscow > 0),
    [city],
  );

  const list = visibleTrainings.length > 0 ? visibleTrainings : trainings;

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="mt-16 md:mt-20 animate-fade-in-up" style={{ animationDelay: "420ms" }}>
      <div className="mx-4 md:mx-5 relative overflow-hidden rounded-[30px] border border-foreground/12 bg-card/90 shadow-[0_16px_48px_rgba(26,22,20,0.06)]">
        <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-accent/[0.14] blur-3xl" />

        <div className="relative px-5 md:px-7 pt-7 md:pt-8 pb-5 md:pb-6 border-b border-foreground/10">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-foreground/15" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {"Academy"}
            </span>
            <span className="h-px flex-1 bg-foreground/15" />
          </div>
          <h3 className="mt-4 font-serif text-4xl md:text-5xl leading-none tracking-tight text-foreground">
            {"Обучение"}
          </h3>
          <p className="mt-3 text-[12px] md:text-[13px] leading-relaxed text-muted-foreground max-w-[460px] break-words [overflow-wrap:anywhere]">
            {"Академическая программа с системной постановкой руки, практикой на моделях и рабочими протоколами."}
          </p>
        </div>

        <div className="relative p-2.5 md:p-3.5 space-y-3">
          {list.map((training, index) => {
            const open = openIds.has(training.id);
            const detailsId = `${training.id}-details`;
            const formattedPrice = formatTrainingPrice(training.prices[city]);

            return (
              <article
                key={training.id}
                className={`rounded-2xl md:rounded-3xl border transition-all duration-300 ${
                  open
                    ? "border-primary/25 bg-card shadow-[0_8px_24px_rgba(26,22,20,0.08)]"
                    : "border-foreground/12 bg-card/90 hover:border-foreground/20 hover:bg-card"
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <button
                  type="button"
                  onClick={() => toggle(training.id)}
                  aria-expanded={open}
                  aria-controls={detailsId}
                  className="w-full px-4 md:px-6 py-4 md:py-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:gap-4 text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
                      {training.subtitle ?? "Обучение"}
                    </p>
                    <h4 className="font-sans text-[18px] md:text-[22px] leading-snug font-semibold tracking-[0.08em] text-foreground uppercase break-words [overflow-wrap:anywhere]">
                      {training.title}
                    </h4>
                  </div>

                  <div className="flex flex-col items-end gap-2 md:gap-2.5 min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-secondary/40 px-2.5 py-1">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap">
                        {open ? "Скрыть план" : "Открыть план"}
                      </span>
                      <span
                        className={`w-6 h-6 rounded-full border border-foreground/12 bg-card flex items-center justify-center transition-transform duration-300 ${
                          open ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-foreground/70" strokeWidth={1.7} />
                      </span>
                    </div>
                    <p className="text-[17px] md:text-[21px] font-semibold text-primary leading-tight text-right max-w-[13rem] break-words [overflow-wrap:anywhere] tabular-nums">
                      {formattedPrice}
                    </p>
                  </div>
                </button>

                <div
                  id={detailsId}
                  className={`grid transition-all duration-300 ease-out ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 md:px-6 pb-5 md:pb-6 pt-1">
                      <div className="rounded-2xl border border-foreground/12 bg-background/90 px-4 md:px-5 py-4 md:py-5 min-w-0">
                        <p className="text-[16px] md:text-[18px] font-medium tracking-[0.12em] uppercase text-foreground/90">
                          {training.planTitle}
                        </p>

                        <div className="mt-4 md:mt-5 space-y-5">
                          {training.topics.map((topic, topicIndex) => (
                            <div key={topic.title} className="min-w-0">
                              <p className="text-[15px] md:text-[16px] font-medium leading-relaxed tracking-[0.08em] text-foreground break-words [overflow-wrap:anywhere]">
                                <span className="text-primary/80 mr-2">{topicIndex + 1}.</span>
                                {topic.title}:
                              </p>
                              <ul className="mt-2 space-y-1.5">
                                {topic.items.map((item) => (
                                  <li
                                    key={item}
                                    className="grid grid-cols-[10px_minmax(0,1fr)] gap-1.5 text-[14px] md:text-[15px] leading-relaxed tracking-[0.04em] text-foreground/85"
                                  >
                                    <span aria-hidden="true">{"—"}</span>
                                    <span className="break-words [overflow-wrap:anywhere]">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
                        <div className="rounded-xl border border-foreground/12 bg-card px-4 py-3.5">
                          <p className="text-[13px] md:text-[14px] font-semibold tracking-[0.08em] uppercase text-foreground">
                            {"Стоимость: "}
                            <span className="font-bold">{formattedPrice}</span>
                          </p>
                        </div>
                        <div className="rounded-xl border border-foreground/12 bg-card px-4 py-3.5">
                          <p className="text-[13px] md:text-[14px] font-semibold tracking-[0.08em] uppercase text-foreground">
                            {"Длительность: "}
                            <span className="font-bold">{training.duration}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
