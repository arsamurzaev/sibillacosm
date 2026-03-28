"use client";
/* eslint-disable @next/next/no-img-element */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getManagedPriceItemImages,
  getPriceItemImageAlt,
  hasManagedPriceItemImages,
} from "@/lib/price-item-images";
import type { ImageType, PriceItem } from "@/lib/types";
import { Check, Plus } from "lucide-react";
import { useMemo } from "react";
import { PublicEditLink } from "./public-edit-link";

interface PriceRowProps {
  item: PriceItem;
  selected: boolean;
  onToggle: (id: string) => void;
  index: number;
  adminEditMode?: boolean;
  onEdit?: () => void;
}

function imageTypeLabel(type: ImageType) {
  if (type === "before") return "До";
  if (type === "after") return "После";
  return "Фото";
}

function hasDetails(item: PriceItem) {
  if (!item.details) return false;

  return Boolean(
    item.details.description ||
    item.details.extraText ||
    hasManagedPriceItemImages(item.details.images),
  );
}

export function PriceRow({
  item,
  selected,
  onToggle,
  index,
  adminEditMode = false,
  onEdit,
}: PriceRowProps) {
  const available = item.price > 0;
  const detailsAvailable = useMemo(() => hasDetails(item), [item]);
  const detailImages = useMemo(
    () => getManagedPriceItemImages(item.details?.images ?? []),
    [item.details?.images],
  );

  const formattedPrice = available
    ? `${item.price.toLocaleString("ru-RU")} ₽`
    : "Уточняйте";
  const formattedOldPrice =
    item.oldPrice && item.oldPrice > 0
      ? `${item.oldPrice.toLocaleString("ru-RU")} ₽`
      : null;

  return (
    <article
      id={`item-${item.id}`}
      className={`relative overflow-hidden rounded-[24px] border transition-all duration-300 animate-fade-in-up ${
        selected
          ? "border-primary/25 bg-primary/[0.05] shadow-[0_14px_34px_rgba(107,23,40,0.08)]"
          : "border-border bg-background hover:border-primary/18 hover:bg-card"
      }`}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      {adminEditMode && onEdit ? (
        <PublicEditLink
          onClick={onEdit}
          label={`Редактировать карточку ${item.name}`}
          className="absolute right-3 top-3 z-10 md:right-4 md:top-4"
        />
      ) : null}

      <button
        type="button"
        onClick={() => available && onToggle(item.id)}
        disabled={!available}
        className={`flex w-full items-start gap-4 px-4 py-4.5 text-left md:px-5 md:py-5 ${
          available ? "cursor-pointer" : "cursor-default opacity-70"
        } ${adminEditMode && onEdit ? "pr-16 md:pr-20" : ""}`}
      >
        <span
          className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {selected ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={1.8} />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <span className="min-w-0">
              <span
                className={`block text-[17px] font-medium leading-snug tracking-tight ${
                  selected ? "text-primary" : "text-foreground"
                }`}
              >
                {item.name}
              </span>
              {item.secondaryLine ? (
                <span className="mt-1 block text-[15px] font-semibold leading-6 tracking-tight text-foreground/90 md:text-base">
                  {item.secondaryLine}
                </span>
              ) : null}
              {item.note ? (
                <span className="mt-1.5 block text-[12px] leading-6 text-muted-foreground md:text-[13px]">
                  {item.note}
                </span>
              ) : null}
            </span>

            <span className="flex min-w-0 items-baseline gap-2">
              {formattedOldPrice ? (
                <span className="text-[12px] text-muted-foreground line-through">
                  {formattedOldPrice}
                </span>
              ) : null}
              <span
                className={`whitespace-nowrap text-right text-[16px] font-semibold tracking-tight ${
                  available ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {formattedPrice}
              </span>
            </span>
          </span>
        </span>
      </button>

      {detailsAvailable && item.details ? (
        <Accordion
          type="single"
          collapsible
          className="px-4 pb-4.5 md:px-5 md:pb-5"
        >
          <AccordionItem
            value="details"
            className="overflow-hidden rounded-[20px] border border-border bg-card/80 transition-colors duration-300 data-[state=open]:bg-card"
          >
            <AccordionTrigger className="px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground no-underline transition-colors duration-300 hover:text-primary hover:no-underline data-[state=open]:border-b data-[state=open]:border-border/80 data-[state=open]:text-primary [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:translate-y-0 [&>svg]:text-current">
              Дополнительно
            </AccordionTrigger>
            <AccordionContent className="overflow-visible px-4 pb-4 pt-4 md:pb-5">
              <div>
                {item.details.description ? (
                  <p className="text-sm leading-7 text-foreground/78">
                    {item.details.description}
                  </p>
                ) : null}

                {item.details.extraText ? (
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.details.extraText}
                  </p>
                ) : null}

                {detailImages.length > 0 ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {detailImages.map((image) => (
                      <figure
                        key={image.id}
                        className="overflow-hidden rounded-[20px] border border-border bg-background"
                      >
                        <div className="flex items-center justify-between border-b border-border/80 px-3 py-2">
                          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {imageTypeLabel(image.imageType)}
                          </span>
                        </div>
                        <img
                          src={image.imageUrl}
                          alt={getPriceItemImageAlt(image.imageType)}
                          className="h-56 w-full object-cover"
                        />
                      </figure>
                    ))}
                  </div>
                ) : null}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </article>
  );
}
