"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

interface AdminDrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

function AdminDrawerInner({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex shrink-0 items-start justify-between gap-5 border-b border-border/80 px-5 py-5 md:px-7 md:py-6">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Редактирование
          </p>
          <h2 className="mt-3 font-serif text-[2rem] leading-none tracking-tight text-primary md:text-[2.15rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-[460px] text-sm leading-7 text-foreground/72">
              {description}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors duration-300 hover:border-primary/20 hover:text-primary md:h-11 md:w-11"
          aria-label="Закрыть"
        >
          <X className="h-4.5 w-4.5" strokeWidth={1.8} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-7 md:py-7">
        {children}
      </div>
    </>
  );
}

export function AdminDrawer({
  open,
  title,
  description,
  onClose,
  children,
}: AdminDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex h-[calc(100dvh-2rem)] min-h-0 w-full max-w-none flex-col overflow-hidden border p-0 sm:max-w-[560px] lg:max-w-[620px]"
        >
          <div className="sr-only">
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </div>
          <AdminDrawerInner title={title} description={description} onClose={onClose}>
            {children}
          </AdminDrawerInner>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent className="flex max-h-[92dvh] min-h-[70dvh] flex-col overflow-hidden">
        <div className="sr-only">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </div>
        <AdminDrawerInner title={title} description={description} onClose={onClose}>
          {children}
        </AdminDrawerInner>
      </DrawerContent>
    </Drawer>
  );
}
