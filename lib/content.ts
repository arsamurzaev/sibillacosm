import { unstable_noStore as noStore } from "next/cache";
import { sql } from "./db";
import type {
  CityRecord,
  DashboardStats,
  PriceItem,
  PriceItemDetails,
  PriceItemImage,
  PriceSection,
  TrainingBlock,
  TrainingImage,
  TrainingRecord,
} from "./types";

interface CityRow {
  id: string;
  slug: string;
  title: string;
  whatsapp: string;
  whatsapp_display: string;
  instagram: string;
  sort_order: number;
  is_active: boolean;
}

interface SectionRow {
  id: string;
  city_id: string;
  slug: string;
  title: string;
  subtitle: string;
  guarantee: string;
  sort_order: number;
  is_published: boolean;
}

interface ItemRow {
  id: string;
  section_id: string;
  slug: string;
  name: string;
  secondary_line: string;
  note: string;
  price: number;
  old_price: number | null;
  sort_order: number;
  is_published: boolean;
}

interface ItemDetailsRow {
  id: string;
  price_item_id: string;
  description: string;
  extra_text: string;
  show_more_enabled: boolean;
}

interface ItemImageRow {
  id: string;
  price_item_id: string;
  image_url: string;
  image_type: "before" | "after" | "gallery";
  alt: string;
  sort_order: number;
}

interface TrainingRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  duration: string;
  price: number;
  description: string;
  cover_image_url: string;
  status: "draft" | "published";
  sort_order: number;
}

interface TrainingBlockRow {
  id: string;
  training_id: string;
  title: string;
  body: string;
  sort_order: number;
}

interface TrainingImageRow {
  id: string;
  training_id: string;
  image_url: string;
  alt: string;
  sort_order: number;
}

function mapCity(row: CityRow): CityRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    whatsapp: row.whatsapp,
    whatsappDisplay: row.whatsapp_display,
    instagram: row.instagram,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function mapItemImage(row: ItemImageRow): PriceItemImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    imageType: row.image_type,
    alt: row.alt,
    sortOrder: row.sort_order,
  };
}

function mapTrainingImage(row: TrainingImageRow): TrainingImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    alt: row.alt,
    sortOrder: row.sort_order,
  };
}

function mapTrainingBlock(row: TrainingBlockRow): TrainingBlock {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    sortOrder: row.sort_order,
  };
}

function buildPriceDetails(
  detailRows: ItemDetailsRow[],
  imageRows: ItemImageRow[],
): Map<string, PriceItemDetails> {
  const imagesByItem = new Map<string, PriceItemImage[]>();

  for (const imageRow of imageRows) {
    const existing = imagesByItem.get(imageRow.price_item_id) ?? [];
    existing.push(mapItemImage(imageRow));
    imagesByItem.set(imageRow.price_item_id, existing);
  }

  const detailsByItem = new Map<string, PriceItemDetails>();

  for (const detailRow of detailRows) {
    detailsByItem.set(detailRow.price_item_id, {
      id: detailRow.id,
      description: detailRow.description,
      extraText: detailRow.extra_text,
      showMoreEnabled: detailRow.show_more_enabled,
      images: (imagesByItem.get(detailRow.price_item_id) ?? []).sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    });
  }

  return detailsByItem;
}

function mapItem(row: ItemRow, detailsByItem: Map<string, PriceItemDetails>): PriceItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    secondaryLine: row.secondary_line,
    note: row.note,
    price: row.price,
    oldPrice: row.old_price,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    details: detailsByItem.get(row.id) ?? null,
  };
}

function mapSection(
  row: SectionRow,
  itemsBySection: Map<string, PriceItem[]>,
): PriceSection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    guarantee: row.guarantee,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    items: (itemsBySection.get(row.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

function mapTraining(
  row: TrainingRow,
  blocksByTraining: Map<string, TrainingBlock[]>,
  imagesByTraining: Map<string, TrainingImage[]>,
): TrainingRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    duration: row.duration,
    price: row.price,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    status: row.status,
    sortOrder: row.sort_order,
    blocks: (blocksByTraining.get(row.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
    images: (imagesByTraining.get(row.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

async function getPriceTree(includeUnpublished: boolean) {
  const cities = await sql<CityRow[]>`
    select id, slug, title, whatsapp, whatsapp_display, instagram, sort_order, is_active
    from cities
    order by sort_order, title
  `;

  const sections = includeUnpublished
    ? await sql<SectionRow[]>`
        select id, city_id, slug, title, subtitle, guarantee, sort_order, is_published
        from price_sections
        order by sort_order, title
      `
    : await sql<SectionRow[]>`
        select id, city_id, slug, title, subtitle, guarantee, sort_order, is_published
        from price_sections
        where is_published = true
        order by sort_order, title
      `;

  const sectionIds = sections.map((section) => section.id);
  const items =
    sectionIds.length === 0
      ? []
      : includeUnpublished
        ? await sql<ItemRow[]>`
            select id, section_id, slug, name, secondary_line, note, price, old_price, sort_order, is_published
            from price_items
            where section_id in ${sql(sectionIds)}
            order by sort_order, name
          `
        : await sql<ItemRow[]>`
            select id, section_id, slug, name, secondary_line, note, price, old_price, sort_order, is_published
            from price_items
            where section_id in ${sql(sectionIds)} and is_published = true
            order by sort_order, name
          `;

  const itemIds = items.map((item) => item.id);
  const detailRows =
    itemIds.length === 0
      ? []
      : await sql<ItemDetailsRow[]>`
          select id, price_item_id, description, extra_text, show_more_enabled
          from price_item_details
          where price_item_id in ${sql(itemIds)}
        `;
  const imageRows =
    itemIds.length === 0
      ? []
      : await sql<ItemImageRow[]>`
          select id, price_item_id, image_url, image_type, alt, sort_order
          from price_item_images
          where price_item_id in ${sql(itemIds)}
          order by sort_order, created_at
        `;

  const detailsByItem = buildPriceDetails(detailRows, imageRows);
  const itemsBySection = new Map<string, PriceItem[]>();

  for (const itemRow of items) {
    const existing = itemsBySection.get(itemRow.section_id) ?? [];
    existing.push(mapItem(itemRow, detailsByItem));
    itemsBySection.set(itemRow.section_id, existing);
  }

  const sectionsByCity = new Map<string, PriceSection[]>();

  for (const sectionRow of sections) {
    const existing = sectionsByCity.get(sectionRow.city_id) ?? [];
    existing.push(mapSection(sectionRow, itemsBySection));
    sectionsByCity.set(sectionRow.city_id, existing);
  }

  return cities.map((cityRow) => ({
    ...mapCity(cityRow),
    sections: (sectionsByCity.get(cityRow.id) ?? []).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    ),
  }));
}

async function getTrainingCollection(includeDrafts: boolean) {
  const trainingRows = includeDrafts
    ? await sql<TrainingRow[]>`
        select id, slug, title, subtitle, duration, price, description, cover_image_url, status, sort_order
        from trainings
        order by sort_order, title
      `
    : await sql<TrainingRow[]>`
        select id, slug, title, subtitle, duration, price, description, cover_image_url, status, sort_order
        from trainings
        where status = 'published'
        order by sort_order, title
      `;

  const trainingIds = trainingRows.map((training) => training.id);
  const blockRows =
    trainingIds.length === 0
      ? []
      : await sql<TrainingBlockRow[]>`
          select id, training_id, title, body, sort_order
          from training_blocks
          where training_id in ${sql(trainingIds)}
          order by sort_order, title
        `;
  const imageRows =
    trainingIds.length === 0
      ? []
      : await sql<TrainingImageRow[]>`
          select id, training_id, image_url, alt, sort_order
          from training_images
          where training_id in ${sql(trainingIds)}
          order by sort_order, created_at
        `;

  const blocksByTraining = new Map<string, TrainingBlock[]>();
  for (const blockRow of blockRows) {
    const existing = blocksByTraining.get(blockRow.training_id) ?? [];
    existing.push(mapTrainingBlock(blockRow));
    blocksByTraining.set(blockRow.training_id, existing);
  }

  const imagesByTraining = new Map<string, TrainingImage[]>();
  for (const imageRow of imageRows) {
    const existing = imagesByTraining.get(imageRow.training_id) ?? [];
    existing.push(mapTrainingImage(imageRow));
    imagesByTraining.set(imageRow.training_id, existing);
  }

  return trainingRows.map((row) => mapTraining(row, blocksByTraining, imagesByTraining));
}

export async function getActiveCities() {
  noStore();

  const rows = await sql<CityRow[]>`
    select id, slug, title, whatsapp, whatsapp_display, instagram, sort_order, is_active
    from cities
    where is_active = true
    order by sort_order, title
  `;

  return rows.map(mapCity);
}

export async function getPrimaryContactCity() {
  noStore();

  const [row] = await sql<CityRow[]>`
    select id, slug, title, whatsapp, whatsapp_display, instagram, sort_order, is_active
    from cities
    where is_active = true
    order by sort_order, title
    limit 1
  `;

  return row ? mapCity(row) : null;
}

export async function getPublicPricePage(citySlug: string) {
  noStore();

  const tree = await getPriceTree(false);
  return tree.find((city) => city.slug === citySlug && city.isActive) ?? null;
}

export async function getAdminPricePage(citySlug: string) {
  noStore();

  const tree = await getPriceTree(true);
  return tree.find((city) => city.slug === citySlug) ?? null;
}

export async function getPublishedTrainings() {
  noStore();
  return getTrainingCollection(false);
}

export async function getAdminCitiesWithSections() {
  noStore();
  return getPriceTree(true);
}

export async function getAdminTrainings() {
  noStore();
  return getTrainingCollection(true);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  noStore();

  const [citiesCount] = await sql<{ count: string }[]>`select count(*)::text as count from cities`;
  const [sectionsCount] =
    await sql<{ count: string }[]>`select count(*)::text as count from price_sections`;
  const [itemsCount] =
    await sql<{ count: string }[]>`select count(*)::text as count from price_items`;
  const [trainingsCount] =
    await sql<{ count: string }[]>`select count(*)::text as count from trainings`;

  return {
    cityCount: Number(citiesCount?.count ?? 0),
    sectionCount: Number(sectionsCount?.count ?? 0),
    itemCount: Number(itemsCount?.count ?? 0),
    trainingCount: Number(trainingsCount?.count ?? 0),
  };
}
