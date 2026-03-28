"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PriceSection as PriceSectionType } from "@/lib/types";
import { ShieldCheck } from "lucide-react";
import { PriceRow } from "./price-row";
import { PublicEditLink } from "./public-edit-link";

interface PriceSectionProps {
  section: PriceSectionType;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  sectionIndex: number;
  adminEditMode?: boolean;
  onEditSection?: () => void;
  onEditItem?: (itemId: string) => void;
}

export function PriceSection({
  section,
  selectedIds,
  onToggle,
  sectionIndex,
  adminEditMode = false,
  onEditSection,
  onEditItem,
}: PriceSectionProps) {
  const selectedCount = section.items.filter((item) =>
    selectedIds.has(item.id),
  ).length;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={section.id}
      className="animate-fade-in-up"
      style={{ animationDelay: `${sectionIndex * 80}ms` }}
    >
      <AccordionItem
        value={section.id}
        id={`section-${section.id}`}
        className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_14px_40px_rgba(26,22,20,0.04)]"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-5 md:px-6 md:py-6">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-3">
              <h2 className="truncate font-serif text-3xl leading-none tracking-tight text-primary md:text-4xl">
                {section.title}
              </h2>
              {selectedCount > 0 ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {selectedCount}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            {adminEditMode && onEditSection ? (
              <PublicEditLink
                onClick={onEditSection}
                label={`Редактировать раздел ${section.title}`}
              />
            ) : null}

            <AccordionTrigger className="!flex-none !items-center !justify-center !gap-0 !py-0 h-10 w-10 rounded-full border border-border bg-background text-muted-foreground no-underline shadow-[0_10px_24px_rgba(26,22,20,0.05)] transition-all duration-300 hover:border-primary/25 hover:bg-card hover:text-primary hover:no-underline [&>svg]:h-4 [&>svg]:w-4 [&>svg]:translate-y-0 [&>svg]:text-current">
              <span className="sr-only">{`Переключить раздел ${section.title}`}</span>
            </AccordionTrigger>
          </div>
        </div>

        <AccordionContent className="pb-0">
          <div className="px-3 pb-4 md:px-4 md:pb-5">
            {section.subtitle ? (
              <p className="px-2 pb-4 text-sm leading-7 text-muted-foreground md:px-3">
                {section.subtitle}
              </p>
            ) : null}

            {section.guarantee ? (
              <div className="mx-2 mb-5 rounded-[22px] border border-primary/12 bg-primary/[0.04] px-4 py-4 md:mx-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    strokeWidth={1.8}
                  />
                  <p className="text-sm leading-7 text-foreground/72">
                    {section.guarantee}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="space-y-3.5">
              {section.items.map((item, index) => (
                <PriceRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onToggle={onToggle}
                  index={index}
                  adminEditMode={adminEditMode}
                  onEdit={onEditItem ? () => onEditItem(item.id) : undefined}
                />
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
