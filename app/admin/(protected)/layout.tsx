import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth";
import Link from "next/link";
import { ExternalLink, GraduationCap, LayoutTemplate, MapPinned } from "lucide-react";
import { AdminNavLink } from "../components/admin-nav-link";
import { logoutAction } from "../actions";

export const metadata: Metadata = {
  title: {
    default: "Админ-панель",
    template: "%s | Админ-панель",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1560px] gap-6 px-4 py-6 md:px-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[34px] border border-border bg-card p-5 shadow-[0_20px_50px_rgba(26,22,20,0.05)] md:p-6">
          <div className="rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(201,168,124,0.18),transparent_45%),linear-gradient(180deg,#fffdf9,#faf8f5)] px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Admin panel
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-none tracking-tight">
              SIBILLACOSM
            </h1>
            <p className="mt-3 text-sm leading-7 text-foreground/72">
              Визуальная админка для человека, который хочет просто управлять сайтом без
              технических сложностей.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            <AdminNavLink href="/admin" exact>
              Обзор
            </AdminNavLink>
            <AdminNavLink href="/admin/prices">
              Прайс и города
            </AdminNavLink>
            <AdminNavLink href="/admin/trainings">
              Обучение
            </AdminNavLink>
          </nav>

          <div className="mt-6 grid gap-3">
            <Link
              href="/"
              className="flex items-center justify-between rounded-[22px] border border-border bg-background/75 px-4 py-3 text-sm text-foreground/78 transition-colors duration-300 hover:border-primary/22 hover:text-primary"
            >
              <span className="inline-flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4" strokeWidth={1.8} />
                Открыть главную
              </span>
              <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
            </Link>

            <Link
              href="/prices/grozny"
              className="flex items-center justify-between rounded-[22px] border border-border bg-background/75 px-4 py-3 text-sm text-foreground/78 transition-colors duration-300 hover:border-primary/22 hover:text-primary"
            >
              <span className="inline-flex items-center gap-2">
                <MapPinned className="h-4 w-4" strokeWidth={1.8} />
                Прайс на сайте
              </span>
              <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
            </Link>

            <Link
              href="/training"
              className="flex items-center justify-between rounded-[22px] border border-border bg-background/75 px-4 py-3 text-sm text-foreground/78 transition-colors duration-300 hover:border-primary/22 hover:text-primary"
            >
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="h-4 w-4" strokeWidth={1.8} />
                Обучение на сайте
              </span>
              <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </div>

          <div className="mt-6 rounded-[24px] border border-border bg-background/85 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Текущая сессия
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {(session.email as string | undefined) ?? "admin"}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Все изменения сохраняются сразу и после сохранения видны на сайте.
            </p>
          </div>

          <form action={logoutAction} className="mt-4">
            <button
              type="submit"
              className="w-full rounded-[18px] border border-border bg-background px-4 py-3 text-sm text-foreground/78 transition-colors duration-300 hover:border-primary/25 hover:text-primary"
            >
              Выйти
            </button>
          </form>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
