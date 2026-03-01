"use client";

import { ArrowLeftRight, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { cityInfo, sections, type City } from "../data";
import { CitySelector } from "./city-selector";
import { PriceSection } from "./price-section";
import { TrainingsSection } from "./trainings-section";

function buildWhatsAppMessage(selectedIds: Set<string>, city: City): string {
  const lines: string[] = ["Здравствуйте!\n\nХочу записаться на процедуры:\n"];

  for (const section of sections) {
    const picked = section.items.filter((i) => selectedIds.has(i.id));
    if (picked.length === 0) continue;

    lines.push(`\n${section.title}:`);
    for (const item of picked) {
      const price = item.prices[city];
      const dose = item.dose ? ` (${item.dose})` : "";
      const priceStr =
        price > 0 ? `${price.toLocaleString("ru-RU")} \u20BD` : "уточнить";
      lines.push(`  \u2014 ${item.name}${dose} \u2014 ${priceStr}`);
    }
  }

  lines.push("\n\nПодскажите, пожалуйста, ближайшие свободные даты/время");
  return lines.join("\n");
}

function calcTotal(selectedIds: Set<string>, city: City): number {
  let total = 0;
  for (const section of sections) {
    for (const item of section.items) {
      if (selectedIds.has(item.id)) {
        total += item.prices[city];
      }
    }
  }
  return total;
}

export function PriceList() {
  const [city, setCity] = useState<City | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCitySelect = useCallback((c: City) => {
    setCity(c);
    setSelectedIds(new Set());
  }, []);

  const hasSelection = selectedIds.size > 0;

  const whatsappUrl = useMemo(() => {
    if (!hasSelection || !city) return "";
    const info = cityInfo[city];
    const msg = buildWhatsAppMessage(selectedIds, city);
    return `https://wa.me/${info.whatsapp}?text=${encodeURIComponent(msg)}`;
  }, [selectedIds, hasSelection, city]);

  const total = useMemo(() => {
    if (!city) return 0;
    return calcTotal(selectedIds, city);
  }, [selectedIds, city]);

  // City selector screen
  if (!city) {
    return <CitySelector onSelect={handleCitySelect} />;
  }

  const info = cityInfo[city];

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-background">
      {/* Decorative top line */}
      <div className="w-full h-px bg-accent/30" />

      <div className="w-full max-w-[620px] mx-auto px-4 md:px-6 pt-10 md:pt-12 pb-32 md:pb-36">
        {/* Header */}
        <header className="mb-11 md:mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-7">
            <div className="h-px flex-1 bg-border" />
            <button
              type="button"
              onClick={() => setCity(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group"
            >
              <MapPin
                className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors duration-300"
                strokeWidth={1.5}
              />
              <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground group-hover:text-primary transition-colors duration-300 font-medium">
                {info.label}
              </span>
              <ArrowLeftRight
                className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors duration-300"
                strokeWidth={1.5}
              />
            </button>
            <div className="h-px flex-1 bg-border" />
          </div>

          <h1 className="font-serif inline text-6xl md:text-7xl font-light text-foreground leading-none tracking-tight">
            {"Price"}
          </h1>
          <h1 className="font-serif inline text-6xl md:text-7xl font-light text-foreground leading-none tracking-tight -mt-1">
            <span className="italic text-primary">{"list"}</span>
          </h1>

          <div className="mt-8 md:mt-9 flex items-center gap-4">
            <div className="px-5 py-2.5 border border-foreground/10 rounded-full">
              <Link
                href={`https://www.instagram.com/${info.instagram}`}
                target="__blank"
              >
                <span className="text-[11px] tracking-[0.25em] uppercase text-foreground/70 font-medium">
                  {"@"}
                  {info.instagram}
                </span>
              </Link>
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-6 text-[13px] text-muted-foreground leading-relaxed max-w-[360px] break-words [overflow-wrap:anywhere]">
            {
              "Выберите интересующие процедуры, чтобы записаться на консультацию через WhatsApp"
            }
          </p>
        </header>

        {/* Sections */}
        <main className="flex flex-col">
          {sections.map((s, i) => (
            <div key={s.key}>
              <PriceSection
                section={s}
                city={city}
                selectedIds={selectedIds}
                onToggle={toggle}
                sectionIndex={i}
              />
              {i < sections.length - 1 && (
                <div className="mx-4 md:mx-5 h-px bg-border" />
              )}
            </div>
          ))}
        </main>

        <TrainingsSection city={city} />

        {/* Footer */}
        <footer
          className="mt-12 md:mt-14 pt-8 px-4 md:px-5 animate-fade-in-up"
          style={{ animationDelay: "600ms" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              {"Контакты"}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <a
              href={`https://wa.me/${info.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-foreground/70 hover:text-primary transition-colors duration-300 tracking-wide"
            >
              {info.whatsappDisplay}
            </a>
            <a
              href={`https://instagram.com/${info.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-foreground/70 hover:text-primary transition-colors duration-300 tracking-wide"
            >
              {"@"}
              {info.instagram}
            </a>
          </div>
        </footer>
      </div>

      {/* Sticky CTA */}
      {hasSelection && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center animate-slide-up">
          <div className="w-full max-w-[620px] px-4 md:px-5 pb-5 md:pb-6 pt-7 md:pt-8 bg-gradient-to-t from-background via-background/95 to-transparent">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center justify-center gap-3
                w-full py-4 px-6 rounded-2xl
                bg-primary text-primary-foreground
                text-[14px] font-medium tracking-wide
                transition-all duration-300
                hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.01]
                active:scale-[0.99]
              "
            >
              <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
              <span>{"Записаться"}</span>
              {total > 0 && (
                <span className="text-primary-foreground/60 ml-1">
                  {total.toLocaleString("ru-RU")} {"\u20BD"}
                </span>
              )}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
