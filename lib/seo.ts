export const defaultSiteUrl = "https://sibillacosm.com";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? defaultSiteUrl;

export const siteUrl = rawSiteUrl.replace(/\/+$/, "");
export const siteName = "SIBILLACOSM";
export const siteHandle = "@sibillacosm";
export const siteLocale = "ru_RU";
export const siteLanguage = "ru-RU";
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

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function buildPricePageTitle(cityTitle: string) {
  return `Прайс косметологии в ${cityTitle}`;
}

export function buildPricePageDescription(
  cityTitle: string,
  sectionTitles: string[] = [],
) {
  const normalizedSections = sectionTitles
    .map((title) => title.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");

  if (normalizedSections) {
    return `Актуальный прайс эстетической косметологии в ${cityTitle}: ${normalizedSections}. Онлайн-запись через WhatsApp и подробная информация по процедурам.`;
  }

  return `Актуальный прайс эстетической косметологии в ${cityTitle}. Онлайн-запись через WhatsApp и подробная информация по процедурам.`;
}

export function buildTrainingPageTitle() {
  return "Обучение косметологии";
}

export function buildTrainingPageDescription(programCount: number) {
  if (programCount > 0) {
    return `Программы обучения SIBILLACOSM: ${programCount} ${programCount === 1 ? "курс" : "курса"}, длительность, стоимость, подробный план и запись через WhatsApp.`;
  }

  return "Программы обучения SIBILLACOSM: длительность, стоимость, подробный план и запись через WhatsApp.";
}

export function buildHomePageTitle() {
  return "Эстетическая косметология и обучение";
}

export function buildHomePageDescription() {
  return "SIBILLACOSM: прайс эстетической косметологии по городам, программы обучения, контакты и запись через WhatsApp.";
}
