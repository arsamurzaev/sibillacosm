import type { PriceItem } from "@/lib/types";
import { hasManagedPriceItemImages } from "@/lib/price-item-images";

export function hasItemDetails(item: PriceItem) {
  if (!item.details) {
    return false;
  }

  return Boolean(
    item.details.description || item.details.extraText || hasManagedPriceItemImages(item.details.images),
  );
}

export function imageTypeLabel(type: "before" | "after" | "gallery") {
  if (type === "before") return "До";
  if (type === "after") return "После";
  return "Галерея";
}
