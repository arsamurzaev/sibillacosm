import type { ImageType, PriceItemImage } from "./types";

export function isManagedPriceItemImageType(
  imageType: ImageType,
): imageType is "before" | "after" {
  return imageType === "before" || imageType === "after";
}

export function getPriceItemImageAlt(imageType: ImageType) {
  if (imageType === "before") return "Фото до";
  if (imageType === "after") return "Фото после";
  return "Фото";
}

export function sortPriceItemImages(left: PriceItemImage, right: PriceItemImage) {
  const typeOrder = (value: ImageType) => (value === "before" ? 0 : value === "after" ? 1 : 2);
  return typeOrder(left.imageType) - typeOrder(right.imageType) || left.sortOrder - right.sortOrder;
}

export function getManagedPriceItemImages(images: PriceItemImage[]) {
  return [...images]
    .filter((image) => isManagedPriceItemImageType(image.imageType))
    .sort(sortPriceItemImages);
}

export function hasManagedPriceItemImages(images: PriceItemImage[]) {
  return images.some((image) => isManagedPriceItemImageType(image.imageType));
}
