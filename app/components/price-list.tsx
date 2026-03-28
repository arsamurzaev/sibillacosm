"use client";

import { useQuery } from "@tanstack/react-query";
import type { CityWithSections } from "@/lib/types";
import { pricePageQueryKey } from "@/lib/query-keys";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminExitButton } from "./admin-exit-button";
import { PriceSection } from "./price-section";
import { PriceAdminDrawer, type PriceDrawerState } from "./price-admin-drawer";
import { PublicEditLink } from "./public-edit-link";

function getPriceDrawerStorageKey(citySlug: string) {
  return `price-admin-drawer:${citySlug}`;
}

function readStoredPriceDrawerState(citySlug: string): PriceDrawerState {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.sessionStorage.getItem(getPriceDrawerStorageKey(citySlug));
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as PriceDrawerState;
    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
      return null;
    }

    if (parsed.type === "city" || parsed.type === "addSection") {
      return parsed;
    }

    if (
      parsed.type === "section" &&
      typeof parsed.sectionId === "string"
    ) {
      return parsed;
    }

    if (
      parsed.type === "item" &&
      typeof parsed.sectionId === "string" &&
      typeof parsed.itemId === "string"
    ) {
      return parsed;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
}

function isValidPriceDrawerState(city: CityWithSections, state: PriceDrawerState) {
  if (!state) return true;
  if (state.type === "city" || state.type === "addSection") return true;

  const section = city.sections.find((entry) => entry.id === state.sectionId);
  if (!section) return false;

  if (state.type === "section") return true;

  return section.items.some((item) => item.id === state.itemId);
}

interface PriceListProps {
  city: CityWithSections;
  adminLoggedIn?: boolean;
  adminEditMode?: boolean;
}

async function fetchPricePage(citySlug: string) {
  const response = await fetch(`/api/prices/${citySlug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить данные прайса.");
  }

  return (await response.json()) as CityWithSections;
}

function buildWhatsAppMessage(selectedIds: Set<string>, city: CityWithSections): string {
  const lines: string[] = [
    "Здравствуйте!",
    "",
    `Хочу записаться на процедуры в городе ${city.title}:`,
    "",
  ];

  for (const section of city.sections) {
    const picked = section.items.filter((item) => selectedIds.has(item.id));

    if (picked.length === 0) continue;

    lines.push(`${section.title}:`);

    for (const item of picked) {
      const secondary = item.secondaryLine ? ` (${item.secondaryLine})` : "";
      const price = item.price > 0 ? `${item.price.toLocaleString("ru-RU")} ₽` : "уточнить";
      lines.push(`- ${item.name}${secondary} - ${price}`);
    }

    lines.push("");
  }

  lines.push("Подскажите, пожалуйста, ближайшие свободные даты и время.");

  return lines.join("\n");
}

function calcTotal(selectedIds: Set<string>, city: CityWithSections) {
  return city.sections.reduce((total, section) => {
    const sectionTotal = section.items.reduce((sum, item) => {
      if (!selectedIds.has(item.id)) return sum;
      return sum + item.price;
    }, 0);

    return total + sectionTotal;
  }, 0);
}

export function PriceList({
  city,
  adminLoggedIn = false,
  adminEditMode = false,
}: PriceListProps) {
  const { data: pricePage = city } = useQuery({
    queryKey: pricePageQueryKey(city.slug),
    queryFn: () => fetchPricePage(city.slug),
    initialData: city,
    enabled: adminEditMode,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerState, setDrawerState] = useState<PriceDrawerState>(() =>
    adminEditMode ? readStoredPriceDrawerState(city.slug) : null,
  );
  const effectiveDrawerState = useMemo(
    () => (isValidPriceDrawerState(pricePage, drawerState) ? drawerState : null),
    [pricePage, drawerState],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !adminEditMode) return;

    const storageKey = getPriceDrawerStorageKey(city.slug);

    if (effectiveDrawerState) {
      window.sessionStorage.setItem(storageKey, JSON.stringify(effectiveDrawerState));
      return;
    }

    window.sessionStorage.removeItem(storageKey);
  }, [adminEditMode, city.slug, effectiveDrawerState]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const total = useMemo(() => calcTotal(selectedIds, pricePage), [pricePage, selectedIds]);
  const hasSelection = selectedIds.size > 0;

  const whatsappUrl = useMemo(() => {
    if (!hasSelection) return "";
    return `https://wa.me/${pricePage.whatsapp}?text=${encodeURIComponent(
      buildWhatsAppMessage(selectedIds, pricePage),
    )}`;
  }, [hasSelection, pricePage, selectedIds]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[720px] px-4 pb-32 pt-10 md:px-6 md:pb-36 md:pt-12">
        <header className="rounded-[30px] border border-border bg-card px-5 py-6 shadow-[0_14px_40px_rgba(26,22,20,0.05)] md:px-7 md:py-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-300 hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
              Назад
            </Link>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                {pricePage.title}
              </span>
              {adminEditMode ? (
                <>
                  <PublicEditLink
                    onClick={() => setDrawerState({ type: "city" })}
                    label="Настроить город"
                  />
                  <PublicEditLink
                    onClick={() => setDrawerState({ type: "addSection" })}
                    label="Добавить раздел"
                    icon={<Plus className="h-4 w-4" strokeWidth={1.8} />}
                  />
                  <AdminExitButton />
                </>
              ) : null}
            </div>
          </div>

          <h1 className="mt-6 font-serif text-5xl leading-none tracking-tight md:text-6xl">
            Прайс
          </h1>
          <p className="mt-5 max-w-[520px] text-sm leading-7 text-foreground/72 md:text-[15px]">
            Выберите интересующие процедуры, чтобы сразу отправить заявку в WhatsApp.
            Дополнительные материалы по процедурам открываются прямо внутри карточек.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/${pricePage.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-4 py-2 text-sm text-foreground/75 transition-colors duration-300 hover:border-primary/30 hover:text-primary"
            >
              {pricePage.whatsappDisplay}
            </a>
            <a
              href={`https://instagram.com/${pricePage.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-4 py-2 text-sm text-foreground/75 transition-colors duration-300 hover:border-primary/30 hover:text-primary"
            >
              @{pricePage.instagram}
            </a>
            <Link
              href="/training"
              className="rounded-full border border-border px-4 py-2 text-sm text-foreground/75 transition-colors duration-300 hover:border-primary/30 hover:text-primary"
            >
              Обучение
            </Link>
          </div>
        </header>

        <section className="mt-8 flex flex-col gap-5">
          {pricePage.sections.length === 0 ? (
            <div className="rounded-[28px] border border-border bg-card px-5 py-6 text-sm leading-7 text-foreground/70">
              Для этого города пока не заполнен прайс. Контент уже вынесен в систему управления,
              поэтому его можно добавить без изменений в коде.
            </div>
          ) : null}

          {pricePage.sections.map((section, index) => (
            <PriceSection
              key={section.id}
              section={section}
              selectedIds={selectedIds}
              onToggle={toggle}
              sectionIndex={index}
              adminEditMode={adminEditMode}
              onEditSection={() => setDrawerState({ type: "section", sectionId: section.id })}
              onEditItem={(itemId) => setDrawerState({ type: "item", sectionId: section.id, itemId })}
            />
          ))}
        </section>
      </div>

      {hasSelection && !adminLoggedIn ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-5 pt-8 md:px-6 md:pb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full max-w-[720px] items-center justify-center gap-3 rounded-[24px] bg-primary px-6 py-4.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[0_18px_40px_rgba(107,23,40,0.22)] transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
            <span>Записаться в WhatsApp</span>
            {total > 0 ? (
              <span className="text-primary-foreground/70">{total.toLocaleString("ru-RU")} ₽</span>
            ) : null}
          </a>
        </div>
      ) : null}

      {adminEditMode ? (
        <PriceAdminDrawer city={pricePage} state={effectiveDrawerState} onClose={() => setDrawerState(null)} />
      ) : null}
    </main>
  );
}
