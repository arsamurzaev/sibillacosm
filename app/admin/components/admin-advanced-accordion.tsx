"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface AdminAdvancedAccordionProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  title?: string;
  value?: string;
}

export function AdminAdvancedAccordion({
  children,
  className,
  contentClassName,
  title = "Расширенные настройки",
  value = "advanced",
}: AdminAdvancedAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn(
        "overflow-hidden rounded-[20px] border border-dashed border-border bg-background/60",
        className,
      )}
    >
      <AccordionItem value={value} className="border-none">
        <AccordionTrigger className="px-4 py-3 text-sm font-medium text-foreground/78 no-underline transition-colors duration-200 hover:bg-background/70 hover:no-underline data-[state=open]:border-b data-[state=open]:border-border/80 data-[state=open]:bg-background/90 [&>svg]:translate-y-0">
          {title}
        </AccordionTrigger>
        <AccordionContent className={cn("px-4 pb-4 pt-4", contentClassName)}>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
