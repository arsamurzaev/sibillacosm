"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicEditLinkProps {
  href?: string;
  label: string;
  className?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export function PublicEditLink({
  href,
  label,
  className,
  onClick,
  icon,
}: PublicEditLinkProps) {
  const content = icon ?? <PencilLine className="h-4 w-4" strokeWidth={1.8} />;
  const baseClassName = cn(
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/85 bg-background/92 text-muted-foreground shadow-[0_10px_24px_rgba(26,22,20,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-primary/28 hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.currentTarget.blur();
          onClick();
        }}
        className={baseClassName}
        aria-label={label}
        title={label}
      >
        {content}
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} className={baseClassName} aria-label={label} title={label}>
      {content}
      <span className="sr-only">{label}</span>
    </Link>
  );
}
