export type City = "grozny" | "moscow";

export interface CityInfo {
  label: string;
  whatsapp: string;
  whatsappDisplay: string;
  instagram: string;
}

export const cityInfo: Record<City, CityInfo> = {
  grozny: {
    label: "Грозный",
    whatsapp: "79389121101",
    whatsappDisplay: "+7 938 912-11-01",
    instagram: "sibillacosm",
  },
  moscow: {
    label: "Москва",
    whatsapp: "79882251505",
    whatsappDisplay: "+7 988 225-15-05",
    instagram: "sibillacosm",
  },
};

export interface PriceItem {
  id: string;
  name: string;
  dose?: string;
  prices: Record<City, number>;
  note?: string;
  oldPrice?: Record<City, number>;
}

export interface PriceSection {
  key: string;
  title: string;
  subtitle?: string;
  guarantee?: string;
  items: PriceItem[];
}

export interface TrainingItem {
  id: string;
  title: string;
  subtitle?: string;
  prices: Record<City, number>;
  duration: string;
  planTitle: string;
  topics: Array<{
    title: string;
    items: string[];
  }>;
}

export const sections: PriceSection[] = [
  {
    key: "lips",
    title: "Увеличение губ",
    guarantee:
      "Постоянная связь с косметологом в период заживления. В случае неровностей или асимметрии коррекция бесплатна в течение недели.",
    items: [
      {
        id: "lips:dermalax:0.5ml",
        name: "Dermalax Deep",
        dose: "0,5 мл",
        prices: { grozny: 8500, moscow: 0 },
        note: "Корея",
      },
      {
        id: "lips:dermalax:1ml",
        name: "Dermalax Deep",
        dose: "1 мл",
        prices: { grozny: 14000, moscow: 0 },
        note: "Корея",
      },
      {
        id: "lips:stylage-m:0.5ml",
        name: "Stylage M",
        dose: "0,5 мл",
        prices: { grozny: 10000, moscow: 0 },
        note: "Франция",
      },
      {
        id: "lips:stylage-m:1ml",
        name: "Stylage M",
        dose: "1 мл",
        prices: { grozny: 20000, moscow: 0 },
        note: "Франция",
      },
      {
        id: "lips:juvederm",
        name: "Juvederm Smile",
        dose: "0,6 мл",
        prices: { grozny: 16500, moscow: 0 },
        note: "США",
      },
      {
        id: "lips:belotero",
        name: "Belotero Lips",
        dose: "0,6 мл",
        prices: { grozny: 13000, moscow: 0 },
        note: "увлажнение / питание губ",
      },
    ],
  },
  {
    key: "nose",
    title: "Коррекция носа",
    subtitle: "Убрать горбинку, выровнять спинку, поднять кончик носа",
    guarantee:
      "При выборе полной коррекции носа — бесплатная коррекция после заживления при необходимости.",
    items: [
      {
        id: "nose:dermalax:full",
        name: "Dermalax Implant",
        dose: "полная коррекция",
        prices: { grozny: 14000, moscow: 0 },
      },
      {
        id: "nose:dermalax:0.5ml",
        name: "Dermalax Implant",
        dose: "0,5 мл",
        prices: { grozny: 8500, moscow: 0 },
        note: "одна зона коррекции",
      },
      {
        id: "nose:stylage-xl",
        name: "Stylage XL",
        dose: "полная коррекция",
        prices: { grozny: 20000, moscow: 0 },
      },
      {
        id: "nose:tip",
        name: "Сужение кончика носа / дренаж",
        prices: { grozny: 8500, moscow: 0 },
      },
    ],
  },
  {
    key: "face",
    title: "Контурная пластика лица",
    subtitle: "Углы нижней челюсти / скулы / подбородок",
    items: [
      {
        id: "face:dermalax:0.5ml",
        name: "Dermalax Implant",
        dose: "0,5 мл",
        prices: { grozny: 8500, moscow: 0 },
      },
      {
        id: "face:dermalax:1ml",
        name: "Dermalax Implant",
        dose: "1 мл",
        prices: { grozny: 14000, moscow: 0 },
      },
      {
        id: "face:stylage-xl:0.5ml",
        name: "Stylage XL",
        dose: "0,5 мл",
        prices: { grozny: 10000, moscow: 0 },
      },
      {
        id: "face:stylage-xl:1ml",
        name: "Stylage XL",
        dose: "1 мл",
        prices: { grozny: 20000, moscow: 0 },
      },
    ],
  },
  {
    key: "complex",
    title: "Комплексные процедуры",
    subtitle: "Лицо под ключ",
    items: [
      {
        id: "complex:dermalax:3ml",
        name: "Dermalax Implant",
        dose: "3 мл",
        prices: { grozny: 38500, moscow: 0 },
        oldPrice: { grozny: 42000, moscow: 0 },
      },
      {
        id: "complex:dermalax:4ml",
        name: "Dermalax Implant",
        dose: "4 мл",
        prices: { grozny: 52500, moscow: 0 },
        oldPrice: { grozny: 56000, moscow: 0 },
      },
    ],
  },
  {
    key: "botox",
    title: "Ботулинотерапия",
    items: [
      {
        id: "botox:hyperhidrosis",
        name: "Лечение гипергидроза",
        prices: { grozny: 14000, moscow: 0 },
      },
      {
        id: "botox:jaw",
        name: "Жевательные мышцы",
        prices: { grozny: 11000, moscow: 0 },
      },
      {
        id: "botox:lip-flip",
        name: "Выворот губ",
        prices: { grozny: 6000, moscow: 0 },
      },
      { id: "botox:nose", name: "Нос", prices: { grozny: 8500, moscow: 0 } },
      {
        id: "botox:gummy",
        name: "Десневая улыбка",
        prices: { grozny: 6000, moscow: 0 },
      },
      {
        id: "botox:fox-eyes",
        name: "Лисьи глаза",
        prices: { grozny: 8500, moscow: 0 },
      },
      {
        id: "botox:forehead",
        name: "Лоб + межбровье",
        prices: { grozny: 10000, moscow: 0 },
      },
      { id: "botox:eyes", name: "Глаза", prices: { grozny: 5500, moscow: 0 } },
      {
        id: "botox:chin",
        name: "Подбородок",
        prices: { grozny: 6500, moscow: 0 },
      },
      {
        id: "botox:combo",
        name: "Лоб + межбровье + глаза",
        prices: { grozny: 15000, moscow: 0 },
      },
    ],
  },
  {
    key: "tear-trough",
    title: "Носослезная борозда",
    items: [
      {
        id: "tear:teosyal",
        name: "Teosyal Redensity II",
        prices: { grozny: 19500, moscow: 0 },
      },
    ],
  },
  {
    key: "lipo",
    title: "Липолитики",
    items: [
      {
        id: "lipo:lipolong",
        name: "Липолонг",
        dose: "8 мл",
        prices: { grozny: 18500, moscow: 0 },
      },
      {
        id: "lipo:slimness",
        name: "Стройность",
        dose: "2 мл",
        prices: { grozny: 14500, moscow: 0 },
      },
    ],
  },
  {
    key: "removal",
    title: "Выведение филлера",
    items: [
      {
        id: "removal:any",
        name: "Любая зона",
        prices: { grozny: 5000, moscow: 0 },
      },
    ],
  },
  {
    key: "biorevit",
    title: "Биоревитализация / коллагенотерапия",
    items: [
      {
        id: "bio:plinest",
        name: "Plinest / Plinest Fast",
        prices: { grozny: 15500, moscow: 0 },
      },
      {
        id: "bio:nithya",
        name: "Nithya Stimulate",
        prices: { grozny: 11000, moscow: 0 },
      },
      {
        id: "bio:micro-collost",
        name: "Micro Collost",
        prices: { grozny: 18000, moscow: 0 },
      },
      {
        id: "bio:collost-7",
        name: "Коллост 7%",
        dose: "1,5 мл",
        prices: { grozny: 12000, moscow: 0 },
      },
      {
        id: "bio:collost-15",
        name: "Коллост 15%",
        dose: "1,5 мл",
        prices: { grozny: 17500, moscow: 0 },
      },
      {
        id: "bio:filorga",
        name: "Filorga 135 HA",
        prices: { grozny: 12000, moscow: 0 },
      },
      {
        id: "bio:revi-strong",
        name: "Revi Strong",
        dose: "2 мл",
        prices: { grozny: 14500, moscow: 0 },
      },
      {
        id: "bio:revi-silk",
        name: "Revi Silk",
        dose: "2 мл",
        prices: { grozny: 13500, moscow: 0 },
      },
      {
        id: "bio:novacutan",
        name: "Novacutan",
        prices: { grozny: 13000, moscow: 0 },
      },
      {
        id: "bio:meso-wharton",
        name: "MESO-WHARTON",
        prices: { grozny: 13500, moscow: 0 },
      },
      {
        id: "bio:meso-xanthin",
        name: "MESO-XANTHIN",
        prices: { grozny: 13500, moscow: 0 },
      },
      {
        id: "bio:biogel",
        name: "Biogel Monaco",
        prices: { grozny: 12500, moscow: 0 },
      },
    ],
  },
  {
    key: "eyes",
    title: "Вокруг глаз",
    items: [
      {
        id: "eyes:revi",
        name: "Revi Eyes",
        prices: { grozny: 12000, moscow: 0 },
      },
      {
        id: "eyes:blum",
        name: "Blum Gel",
        prices: { grozny: 6500, moscow: 0 },
      },
      {
        id: "eyes:twac",
        name: "Twac Eyes",
        prices: { grozny: 18500, moscow: 0 },
      },
    ],
  },
];

export const trainings: TrainingItem[] = [
  {
    id: "training:contour-plastic",
    title: "Курс «КОНТУРНАЯ ПЛАСТИКА»",
    subtitle: "Обучение",
    prices: { grozny: 140000, moscow: 140000 },
    duration: "1–5 дней",
    planTitle: "План обучения",
    topics: [
      {
        title: "Коррекция формы губ",
        items: [
          "Техники: плоский бант / ТП / парижская техника",
          "Безоперационная ринопластика",
        ],
      },
      {
        title: "Контурирование лица",
        items: [
          "Скулы",
          "Яблочки молодости",
          "Углы челюсти",
          "Подбородок",
          "Носогубные складки",
        ],
      },
      {
        title: "Ботулинотерапия",
        items: [
          "Межбровье, глаза, лоб",
          "Поднятие бровей",
          "Кроличьи морщины",
          "Расслабление подбородка",
        ],
      },
      {
        title: "Дополнительно",
        items: [
          "Первая медицинская помощь",
          "Анатомия",
          "Осложнения и их лечение",
          "Противопоказания",
          "Предоставление моделей с полной постановкой руки",
          "Теория",
          "Видеоматериалы + возможность съёмки во время работы",
          "Контакты поставщиков",
        ],
      },
      {
        title: "Сертификат",
        items: ["По окончании курса выдается сертификат московского образца"],
      },
    ],
  },
];
