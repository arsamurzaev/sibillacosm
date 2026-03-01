"use client";

import { ChevronDown, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { City, PriceSection as PriceSectionType } from "../data";
import { PriceRow } from "./price-row";

interface PriceSectionProps {
  section: PriceSectionType;
  city: City;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  sectionIndex: number;
}

export function PriceSection({
  section,
  city,
  selectedIds,
  onToggle,
  sectionIndex,
}: PriceSectionProps) {
  const [open, setOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const selectedCount = section.items.filter((i) =>
    selectedIds.has(i.id),
  ).length;

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [section.items, city]);

  return (
    <section
      className="animate-fade-in-up"
      style={{ animationDelay: `${sectionIndex * 100}ms` }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          sticky top-0 z-30
          w-full flex items-center justify-between gap-3 md:gap-4
          px-4 md:px-5 py-4 md:py-5
          bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-sm
          border-t border-border/70
          group cursor-pointer
        "
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-left font-serif text-2xl md:text-3xl font-semibold text-primary leading-snug tracking-tight text-balance break-words [overflow-wrap:anywhere]">
            {section.title}
          </h3>
          {selectedCount > 0 && (
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
              {selectedCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`flex-shrink-0 w-5 h-5 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
          strokeWidth={1.5}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-400 ease-out"
        style={{
          maxHeight: open ? (height ?? 2000) : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="pb-3 px-1">
          {/* Subtitle */}
          {section.subtitle && (
            <p className="px-4 md:px-5 pb-3 text-[12px] text-muted-foreground tracking-wide break-words [overflow-wrap:anywhere]">
              {section.subtitle}
            </p>
          )}

          {/* Guarantee */}
          {section.guarantee && (
            <div className="mx-4 md:mx-5 mb-4 px-4 py-3 rounded-xl bg-primary/[0.04] border border-primary/10">
              <div className="flex gap-2.5 items-start">
                <ShieldCheck
                  className="w-4 h-4 text-primary flex-shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <p className="text-[12px] text-foreground/70 leading-relaxed break-words [overflow-wrap:anywhere]">
                  {section.guarantee}
                </p>
              </div>
            </div>
          )}

          {section.items.map((item, i) => (
            <PriceRow
              key={item.id}
              item={item}
              city={city}
              selected={selectedIds.has(item.id)}
              onToggle={onToggle}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
