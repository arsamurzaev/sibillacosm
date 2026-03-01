export const defaultSiteUrl = "https://sibillacosm.com";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? defaultSiteUrl;

export const siteUrl = rawSiteUrl.replace(/\/+$/, "");
export const siteName = "SIBILLACOSM";
export const siteHandle = "@sibillacosm";
export const siteTitle =
  "SIBILLACOSM — Контурная пластика и эстетическая косметология";
export const siteDescription =
  "SIBILLACOSM: контурная пластика, увеличение губ, коррекция носа и лица, ботулинотерапия, биоревитализация и профессиональное обучение в Грозном и Москве.";

export const siteKeywords = [
  "SIBILLACOSM",
  "контурная пластика",
  "увеличение губ",
  "коррекция носа",
  "ботулинотерапия",
  "биоревитализация",
  "косметология Грозный",
  "косметология Москва",
  "обучение косметологов",
];
