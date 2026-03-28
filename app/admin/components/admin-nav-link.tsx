"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminNavLinkProps extends LinkProps {
  children: ReactNode;
  exact?: boolean;
  className?: string;
}

export function AdminNavLink({
  href,
  children,
  exact = false,
  className,
  ...props
}: AdminNavLinkProps) {
  const pathname = usePathname();
  const hrefValue = typeof href === "string" ? href : href.pathname ?? "";
  const isActive = exact ? pathname === hrefValue : pathname.startsWith(hrefValue);

  return (
    <Link
      href={href}
      className={cn(
        "group rounded-[22px] border px-4 py-3 transition-all duration-300",
        isActive
          ? "border-primary/20 bg-primary/[0.07] text-primary shadow-[0_12px_28px_rgba(107,23,40,0.08)]"
          : "border-border bg-background/65 text-foreground/72 hover:border-primary/18 hover:bg-card hover:text-primary",
        className,
      )}
      {...props}
    >
      <span className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-300 group-hover:text-primary/80">
        Раздел
      </span>
      <span className="mt-1 block text-sm font-medium tracking-tight">{children}</span>
    </Link>
  );
}
