import type { CityRecord } from "@/lib/types";
import { GraduationCap, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

interface CitySelectorProps {
  cities: CityRecord[];
}

const cityOrder = ["grozny", "moscow"];

function getCityMeta(slug: string) {
  if (slug === "grozny") {
    return {
      icon: "G",
      eyebrow: "Город",
      description: "Актуальный прайс, контакты и запись через WhatsApp.",
      href: "/prices/grozny",
    };
  }

  return {
    icon: "M",
    eyebrow: "Город",
    description: "Отдельный прайс и контакты для московского направления.",
    href: "/prices/moscow",
  };
}

export function CitySelector({ cities }: CitySelectorProps) {
  const orderedCities = cityOrder
    .map((slug) => cities.find((city) => city.slug === slug))
    .filter(Boolean) as CityRecord[];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1140px] flex-col px-4 py-10 md:px-6 md:py-12">
        <div className="flex items-end justify-between gap-5 border-b border-border/70 pb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              SIBILLACOSM
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-none tracking-tight md:text-7xl">
              Направления
            </h1>
          </div>

          <div className="hidden rounded-[22px] border border-border bg-card px-5 py-3 text-right md:block">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Эстетическая косметология
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/75">
              Прайс по городам и обучение в отдельном разделе
            </p>
          </div>
        </div>

        <div className="grid flex-1 gap-5 py-8 md:grid-cols-[1.12fr_1fr] md:py-12">
          <section className="relative overflow-hidden rounded-[34px] border border-border bg-card p-6 md:p-8 lg:p-9">
            <div className="pointer-events-none absolute -right-14 -top-12 h-44 w-44 rounded-full bg-primary/[0.10] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-accent/[0.18] blur-3xl" />

            <div className="relative flex h-full flex-col">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.8} />
                Онлайн-каталог
              </div>

              <h2 className="mt-7 max-w-[720px] font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                Выберите, что хотите открыть сейчас
              </h2>
              <p className="mt-5 max-w-[540px] text-sm leading-7 text-foreground/70 md:text-base">
                Для процедур доступны отдельные страницы по городам. Обучение вынесено в
                самостоятельный раздел, где публикуются обе программы и их полное наполнение.
              </p>

              <div className="mt-8 grid gap-4">
                {orderedCities.map((city) => {
                  const meta = getCityMeta(city.slug);

                  return (
                    <Link
                      key={city.id}
                      href={meta.href}
                      className="group rounded-[28px] border border-border bg-background/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_40px_rgba(26,22,20,0.08)] md:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/[0.08] text-lg font-semibold text-primary">
                            {meta.icon}
                          </div>

                          <div className="space-y-2">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                              {meta.eyebrow}
                            </p>
                            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                              {city.title}
                            </h3>
                            <p className="max-w-[440px] text-sm leading-6 text-foreground/70">
                              {meta.description}
                            </p>
                            <p className="pt-1 text-sm text-muted-foreground">
                              WhatsApp: {city.whatsappDisplay}
                            </p>
                          </div>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                          <MapPin className="h-4 w-4" strokeWidth={1.8} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <Link
            href="/training"
            className="group relative overflow-hidden rounded-[34px] border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-accent/[0.12] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(107,23,40,0.12)] md:p-8 lg:p-9"
          >
            <div className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full bg-primary/[0.12] blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-accent/[0.22] blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-primary/80">
                  <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Academy
                </div>
                <h2 className="mt-7 font-serif text-4xl leading-[0.96] tracking-tight md:text-5xl">
                  Обучение
                </h2>
                <p className="mt-5 max-w-[420px] text-sm leading-7 text-foreground/75 md:text-base">
                  Отдельный раздел с программами, длительностью, стоимостью, детальным планом и
                  фото. Сейчас внутри уже готова база под две программы.
                </p>
              </div>

              <div className="mt-10 rounded-[26px] border border-primary/15 bg-background/80 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Сейчас внутри
                </p>
                <div className="mt-5 space-y-4 text-sm text-foreground/80">
                  <div className="flex items-start justify-between gap-4">
                    <span>Основной интенсив</span>
                    <span className="font-medium text-primary">3–5 дней</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span>Стоимость</span>
                    <span className="font-medium text-primary">300 000 ₽</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span>Вторая программа</span>
                    <span className="font-medium text-primary">Черновик</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
