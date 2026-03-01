"use client";

import { Check, Plus } from "lucide-react";
import type { City, PriceItem } from "../data";

interface PriceRowProps {
  item: PriceItem;
  city: City;
  selected: boolean;
  onToggle: (id: string) => void;
  index: number;
}

export function PriceRow({
  item,
  city,
  selected,
  onToggle,
  index,
}: PriceRowProps) {
  const price = item.prices[city];
  const oldPrice = item.oldPrice?.[city];
  const formattedPrice =
    price === 0 ? "Уточняйте" : `${price.toLocaleString("ru-RU")} \u20BD`;
  const formattedOld =
    oldPrice && oldPrice > 0
      ? `${oldPrice.toLocaleString("ru-RU")} \u20BD`
      : null;
  const isAvailable = price > 0;

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`
          flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4
          rounded-xl transition-all duration-300 ease-out
          ${isAvailable ? "cursor-pointer" : "opacity-60 cursor-default"}
          ${
            selected
              ? "bg-primary/[0.06] ring-1 ring-primary/20"
              : isAvailable
                ? "hover:bg-secondary/60"
                : ""
          }
        `}
        onClick={() => isAvailable && onToggle(item.id)}
        role="button"
        tabIndex={isAvailable ? 0 : -1}
        aria-pressed={selected}
        aria-label={`${item.name}${item.dose ? `, ${item.dose}` : ""} — ${formattedPrice}`}
        onKeyDown={(e) => {
          if (isAvailable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onToggle(item.id);
          }
        }}
      >
        {/* Selection indicator */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 ease-out
            ${
              selected
                ? "bg-primary text-primary-foreground scale-100"
                : isAvailable
                  ? "bg-secondary text-muted-foreground group-hover:bg-accent/20 group-hover:text-accent"
                  : "bg-secondary/60 text-muted-foreground/50"
            }
          `}
        >
          <div
            className={`transition-transform duration-300 ${selected ? "scale-100" : "scale-90"}`}
          >
            {selected ? (
              <Check className="w-4 h-4" strokeWidth={2.5} />
            ) : (
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <span
                className={`block text-[15px] font-medium tracking-tight transition-colors duration-300 break-words [overflow-wrap:anywhere] ${selected ? "text-primary" : "text-foreground"}`}
              >
                {item.name}
              </span>
              {(item.dose || item.note) && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed tracking-wide break-words [overflow-wrap:anywhere]">
                  {[item.dose, item.note].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex items-baseline gap-2 flex-shrink-0 min-w-0">
              {formattedOld && (
                <span className="text-[12px] tabular-nums text-muted-foreground line-through">
                  {formattedOld}
                </span>
              )}
              <span
                className={`text-[15px] tabular-nums whitespace-nowrap font-semibold tracking-tight transition-colors duration-300 text-right ${
                  price === 0
                    ? "text-muted-foreground text-[13px] font-normal"
                    : selected
                      ? "text-primary"
                      : "text-foreground"
                }`}
              >
                {formattedPrice}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
