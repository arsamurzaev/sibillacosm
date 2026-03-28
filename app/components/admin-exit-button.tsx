"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

interface AdminExitButtonProps {
  className?: string;
  label?: string;
}

export function AdminExitButton({
  className,
  label = "Выйти из административного режима",
}: AdminExitButtonProps) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full border border-border/85 bg-background/92 text-muted-foreground shadow-[0_10px_24px_rgba(26,22,20,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-primary/28 hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:w-auto sm:px-4",
          className,
        )}
        aria-label={label}
        title={label}
      >
        <LogOut className="h-4 w-4" strokeWidth={1.8} />
        <span className="hidden text-sm sm:inline">Выйти</span>
        <span className="sr-only">{label}</span>
      </button>
    </form>
  );
}
