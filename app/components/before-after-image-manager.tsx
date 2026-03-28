"use client";
/* eslint-disable @next/next/no-img-element */

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import {
  addPriceItemImageAction,
  deletePriceItemImageAction,
} from "@/app/admin/actions";
import {
  adminDangerButtonClassName,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
} from "@/app/admin/components/admin-ui";
import {
  getManagedPriceItemImages,
  getPriceItemImageAlt,
} from "@/lib/price-item-images";
import type { PriceItemImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ActionForm } from "./action-form";

type ManagedImageType = "before" | "after";

interface BeforeAfterImageManagerProps {
  itemId: string;
  itemName: string;
  images: PriceItemImage[];
}

const slotCopy: Record<
  ManagedImageType,
  { title: string; sortOrder: number; chooseLabel: string }
> = {
  before: {
    title: "До",
    sortOrder: 10,
    chooseLabel: "Выбрать фото до",
  },
  after: {
    title: "После",
    sortOrder: 20,
    chooseLabel: "Выбрать фото после",
  },
};

function ImageSlotCard({
  itemId,
  itemName,
  imageType,
  existingImage,
}: {
  itemId: string;
  itemName: string;
  imageType: ManagedImageType;
  existingImage?: PriceItemImage;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const copy = slotCopy[imageType];
  const inputId = `${itemId}-${imageType}-image`;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedFileName("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setPreviewUrl(null);
      setSelectedFileName("");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFileName(file.name);
  };

  const previewImageUrl = previewUrl ?? existingImage?.imageUrl ?? "";

  return (
    <div className="rounded-[24px] border border-border bg-background/80 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-primary/[0.07] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
          {copy.title}
        </span>

        {existingImage ? (
          <ActionForm action={deletePriceItemImageAction}>
            <input type="hidden" name="id" value={existingImage.id} />
            <input type="hidden" name="imageUrl" value={existingImage.imageUrl} />
            <button
              className={cn(adminDangerButtonClassName, "min-h-9 px-4 py-2")}
              type="submit"
              aria-label={`Удалить ${getPriceItemImageAlt(imageType).toLowerCase()}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </ActionForm>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-card">
        {previewImageUrl ? (
          <img
            src={previewImageUrl}
            alt={getPriceItemImageAlt(imageType)}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex min-h-[224px] flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,246,242,0.94))] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
              <Camera className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Фото пока не выбрано</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                После выбора файла превью появится здесь.
              </p>
            </div>
          </div>
        )}
      </div>

      <ActionForm
        action={addPriceItemImageAction}
        className="mt-4 space-y-3"
        resetOnSuccess
        onSuccess={resetPreview}
      >
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="imageType" value={imageType} />
        <input type="hidden" name="sortOrder" value={copy.sortOrder} />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(adminSecondaryButtonClassName, "flex w-full gap-2")}
        >
          <Upload className="h-4 w-4" strokeWidth={1.8} />
          {copy.chooseLabel}
        </button>

        <input
          ref={inputRef}
          id={inputId}
          className="hidden"
          type="file"
          name="image"
          accept="image/*"
          required
          aria-label={`${copy.chooseLabel} для ${itemName}`}
          onChange={handleFileChange}
        />

        <p className="text-xs leading-6 text-muted-foreground">
          {previewUrl
            ? `Превью: ${selectedFileName}`
            : existingImage
              ? "Выберите новое фото, посмотрите превью и нажмите «Сохранить»."
              : "Выберите фото, посмотрите превью и нажмите «Сохранить»."}
        </p>

        <button
          className={cn(adminPrimaryButtonClassName, "w-full")}
          type="submit"
          disabled={!previewUrl}
        >
          Сохранить
        </button>
      </ActionForm>
    </div>
  );
}

export function BeforeAfterImageManager({
  itemId,
  itemName,
  images,
}: BeforeAfterImageManagerProps) {
  const managedImages = useMemo(() => getManagedPriceItemImages(images), [images]);
  const beforeImage = managedImages.find((image) => image.imageType === "before");
  const afterImage = managedImages.find((image) => image.imageType === "after");

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ImageSlotCard
        itemId={itemId}
        itemName={itemName}
        imageType="before"
        existingImage={beforeImage}
      />
      <ImageSlotCard
        itemId={itemId}
        itemName={itemName}
        imageType="after"
        existingImage={afterImage}
      />
    </div>
  );
}
