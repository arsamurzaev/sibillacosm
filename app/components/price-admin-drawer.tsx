"use client";

import { useEffect, useRef, useState } from "react";
import type { CityWithSections, PriceSection } from "@/lib/types";
import { AdminDrawer } from "./admin-drawer";
import { PriceCityEditorForm } from "./price-city-editor-form";
import { PriceItemEditorForm } from "./price-item-editor-form";
import { PriceSectionCreateForm } from "./price-section-create-form";
import { PriceSectionEditorForm } from "./price-section-editor-form";

const drawerCloseDelayMs = 220;

export type PriceDrawerState =
  | { type: "city" }
  | { type: "addSection" }
  | { type: "section"; sectionId: string }
  | { type: "item"; sectionId: string; itemId: string }
  | null;

interface PriceAdminDrawerProps {
  city: CityWithSections;
  state: PriceDrawerState;
  onClose: () => void;
}

function findSection(city: CityWithSections, sectionId: string) {
  return city.sections.find((section) => section.id === sectionId) ?? null;
}

function findItem(section: PriceSection | null, itemId: string) {
  return section?.items.find((item) => item.id === itemId) ?? null;
}

export function PriceAdminDrawer({
  city,
  state,
  onClose,
}: PriceAdminDrawerProps) {
  const [renderedState, setRenderedState] = useState<PriceDrawerState>(state);
  const [open, setOpen] = useState(Boolean(state));
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (openFrameRef.current !== null) {
      cancelAnimationFrame(openFrameRef.current);
    }

    openFrameRef.current = requestAnimationFrame(() => {
      setRenderedState(state);
      setOpen(true);
      openFrameRef.current = null;
    });
  }, [state]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      if (openFrameRef.current !== null) {
        cancelAnimationFrame(openFrameRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (!renderedState || !open) return;

    setOpen(false);

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setRenderedState(null);
      onClose();
    }, drawerCloseDelayMs);
  };

  if (!renderedState) return null;

  if (renderedState.type === "city") {
    return (
      <AdminDrawer
        open={open}
        onClose={handleClose}
        title={`Город: ${city.title}`}
        description="Изменения применяются к публичной странице этого города."
      >
        <PriceCityEditorForm key={city.id} city={city} />
      </AdminDrawer>
    );
  }

  if (renderedState.type === "addSection") {
    return (
      <AdminDrawer
        open={open}
        onClose={handleClose}
        title="Новый раздел прайса"
        description="Создайте новую категорию услуг без перехода в отдельную админку."
      >
        <PriceSectionCreateForm cityId={city.id} onSuccess={handleClose} />
      </AdminDrawer>
    );
  }

  if (renderedState.type === "section") {
    const section = findSection(city, renderedState.sectionId);
    if (!section) return null;

    return (
      <AdminDrawer
        open={open}
        onClose={handleClose}
        title={section.title}
        description="Здесь можно обновить сам раздел и сразу добавить в него новую услугу."
      >
        <PriceSectionEditorForm key={section.id} section={section} onDelete={handleClose} />
      </AdminDrawer>
    );
  }

  const section = findSection(city, renderedState.sectionId);
  const item = findItem(section, renderedState.itemId);
  if (!section || !item) return null;

  return (
    <AdminDrawer
      open={open}
      onClose={handleClose}
      title={item.name}
      description="Меняйте карточку услуги прямо поверх страницы: текст, цены, дополнительное описание и фото."
    >
      <PriceItemEditorForm key={item.id} item={item} onDelete={handleClose} />
    </AdminDrawer>
  );
}
