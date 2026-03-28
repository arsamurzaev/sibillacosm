export type CitySlug = "grozny" | "moscow";
export type ImageType = "before" | "after" | "gallery";
export type TrainingStatus = "draft" | "published";

export interface CityRecord {
  id: string;
  slug: CitySlug | string;
  title: string;
  whatsapp: string;
  whatsappDisplay: string;
  instagram: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PriceItemImage {
  id: string;
  imageUrl: string;
  imageType: ImageType;
  alt: string;
  sortOrder: number;
}

export interface PriceItemDetails {
  id: string;
  description: string;
  extraText: string;
  showMoreEnabled: boolean;
  images: PriceItemImage[];
}

export interface PriceItem {
  id: string;
  slug: string;
  name: string;
  secondaryLine: string;
  note: string;
  price: number;
  oldPrice: number | null;
  sortOrder: number;
  isPublished: boolean;
  details: PriceItemDetails | null;
}

export interface PriceSection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  guarantee: string;
  sortOrder: number;
  isPublished: boolean;
  items: PriceItem[];
}

export interface CityWithSections extends CityRecord {
  sections: PriceSection[];
}

export interface TrainingBlock {
  id: string;
  title: string;
  body: string;
  sortOrder: number;
}

export interface TrainingImage {
  id: string;
  imageUrl: string;
  alt: string;
  sortOrder: number;
}

export interface TrainingRecord {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  duration: string;
  price: number;
  description: string;
  coverImageUrl: string;
  status: TrainingStatus;
  sortOrder: number;
  blocks: TrainingBlock[];
  images: TrainingImage[];
}

export interface TrainingPageData {
  trainings: TrainingRecord[];
  contactCity: CityRecord | null;
}

export interface DashboardStats {
  cityCount: number;
  sectionCount: number;
  itemCount: number;
  trainingCount: number;
}
