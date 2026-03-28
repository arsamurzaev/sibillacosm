export const defaultSiteUrl = "https://sibillacosm.com";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? defaultSiteUrl;

export const siteUrl = rawSiteUrl.replace(/\/+$/, "");
export const siteName = "SIBILLACOSM";
export const siteHandle = "@sibillacosm";
export const siteTitle = "SIBILLACOSM — прайс эстетической косметологии и обучение";
export const siteDescription =
  "SIBILLACOSM: прайс эстетической косметологии для Грозного и Москвы, отдельный раздел обучения, запись через WhatsApp и редактирование контента через админку.";

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
