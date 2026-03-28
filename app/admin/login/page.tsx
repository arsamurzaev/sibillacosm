import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { loginAction } from "../actions";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export const metadata: Metadata = {
  title: "Вход в админ-панель",
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

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const [params, adminSession] = await Promise.all([searchParams, getAdminSession()]);

  if (adminSession) {
    redirect("/");
  }

  const hasError = params.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[480px] rounded-[32px] border border-border bg-card p-7 shadow-[0_24px_60px_rgba(26,22,20,0.08)] md:p-9">
        <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          SIBILLACOSM
        </p>
        <h1 className="mt-5 font-serif text-4xl leading-none tracking-tight md:text-5xl">
          Вход в режим редактирования
        </h1>
        <p className="mt-5 text-sm leading-7 text-foreground/72">
          После входа сайт сразу откроется в режиме редактирования. Здесь можно менять цены,
          города, обучение, описания и изображения без правок кода.
        </p>

        {hasError ? (
          <div className="mt-6 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            Неверный email или пароль.
          </div>
        ) : null}

        <form action={loginAction} className="mt-7 space-y-5">
          <label className="block">
            <span className="mb-2.5 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-[20px] border border-border bg-background px-4 py-3.5 text-[15px] outline-none transition-colors duration-300 focus:border-primary/40"
            />
          </label>

          <label className="block">
            <span className="mb-2.5 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Пароль
            </span>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-[20px] border border-border bg-background px-4 py-3.5 text-[15px] outline-none transition-colors duration-300 focus:border-primary/40"
            />
          </label>

          <button
            type="submit"
            className="mt-1 w-full rounded-[22px] bg-primary px-5 py-3.5 text-sm font-medium tracking-wide text-primary-foreground transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            Войти
          </button>
        </form>
      </div>
    </main>
  );
}
