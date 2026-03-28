import { cn } from "@/lib/utils";
import { CircleHelp, Eye, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export const adminInputClassName =
  "w-full rounded-[20px] border border-border bg-background/88 px-4 py-3.5 text-[15px] text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground/55 focus:border-primary/35";
export const adminTextareaClassName =
  "w-full min-h-[148px] rounded-[20px] border border-border bg-background/88 px-4 py-3.5 text-[15px] leading-7 text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground/55 focus:border-primary/35";
export const adminPrimaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center rounded-[20px] bg-primary px-5 py-3 text-sm font-medium tracking-wide text-primary-foreground shadow-[0_14px_30px_rgba(107,23,40,0.18)] transition-transform duration-300 hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50";
export const adminSecondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center rounded-[20px] border border-border bg-background px-5 py-3 text-sm font-medium text-foreground/78 transition-colors duration-300 hover:border-primary/25 hover:text-primary disabled:pointer-events-none disabled:opacity-50";
export const adminDangerButtonClassName =
  "inline-flex min-h-11 items-center justify-center rounded-[20px] border border-red-200 bg-red-50/70 px-5 py-3 text-sm font-medium text-red-700 transition-colors duration-300 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50";

export const adminPanelClassName =
  "rounded-[26px] border border-border bg-background/74 p-5 shadow-[0_16px_40px_rgba(26,22,20,0.04)] sm:p-6";

export function AdminPageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[34px] border border-border bg-card shadow-[0_20px_50px_rgba(26,22,20,0.05)]">
      <div className="bg-[radial-gradient(circle_at_top_left,rgba(201,168,124,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,248,245,0.94))] px-6 py-7 md:px-8 md:py-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-[760px]">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-none tracking-tight md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-sm leading-7 text-foreground/72 md:text-[15px]">
              {description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
            <QuickInfoCard
              icon={<Eye className="h-4 w-4" strokeWidth={1.8} />}
              title="Визуальный режим"
              text="Редактирование строится вокруг тех же карточек и блоков, которые видит клиент на сайте."
            />
            <QuickInfoCard
              icon={<CircleHelp className="h-4 w-4" strokeWidth={1.8} />}
              title="Минимум техники"
              text="Технические поля спрятаны в расширенные настройки и не мешают повседневной работе."
            />
          </div>
        </div>

        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </section>
  );
}

function QuickInfoCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-[24px] border border-border/80 bg-background/88 px-4 py-4 shadow-[0_10px_24px_rgba(26,22,20,0.03)]">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[11px] uppercase tracking-[0.18em] text-primary/85">
          {title}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-foreground/72">{text}</p>
    </article>
  );
}

export function AdminPanel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[30px] border border-border bg-card px-5 py-5 shadow-[0_18px_44px_rgba(26,22,20,0.04)] md:px-6 md:py-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border/80 pb-5">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
          {title}
        </div>
        {description ? (
          <p className="max-w-[760px] text-sm leading-7 text-foreground/72">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function AdminField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-3 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-2 block text-xs leading-6 text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function AdminCheckbox({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-[20px] border border-border bg-background/70 px-4 py-4 text-sm text-foreground/78">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1"
      />
      <span className="block">
        <span className="block font-medium text-foreground">{label}</span>
        {hint ? (
          <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-background/88 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

export function AdminStatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "draft";
}) {
  const toneClassName =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "draft"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-border bg-background text-foreground/72";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
        toneClassName,
      )}
    >
      {children}
    </span>
  );
}

export function AdminFormActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 flex flex-wrap gap-3 py-5 sm:py-6">{children}</div>
  );
}

export function formatCurrency(price: number | null | undefined) {
  if (!price || price <= 0) {
    return "По запросу";
  }

  return `${price.toLocaleString("ru-RU")} ₽`;
}
