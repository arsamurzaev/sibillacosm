import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const SOURCE_CITY_SLUG = "grozny";
const TARGET_CITY_SLUG = "moscow";

function loadLocalEnv() {
  const envPaths = [".env.local", ".env"];

  for (const envPath of envPaths) {
    const absolutePath = path.join(process.cwd(), envPath);

    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const content = fs.readFileSync(absolutePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (!match || process.env[match[1]]) {
        continue;
      }

      process.env[match[1]] = match[2];
    }
  }
}

async function main() {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const sql = postgres(databaseUrl, {
    prepare: false,
    connect_timeout: 15,
  });

  try {
    const result = await sql.begin(async (tx) => {
      const [sourceCity] = await tx`
        select id, title
        from cities
        where slug = ${SOURCE_CITY_SLUG}
        limit 1
      `;
      const [targetCity] = await tx`
        select id, title
        from cities
        where slug = ${TARGET_CITY_SLUG}
        limit 1
      `;

      if (!sourceCity) {
        throw new Error(`Source city "${SOURCE_CITY_SLUG}" was not found.`);
      }

      if (!targetCity) {
        throw new Error(`Target city "${TARGET_CITY_SLUG}" was not found.`);
      }

      const [sourceCounts] = await tx`
        select
          count(distinct ps.id)::int as sections,
          count(distinct pi.id)::int as items,
          count(distinct pid.id)::int as details,
          count(distinct pii.id)::int as images
        from price_sections ps
        left join price_items pi on pi.section_id = ps.id
        left join price_item_details pid on pid.price_item_id = pi.id
        left join price_item_images pii on pii.price_item_id = pi.id
        where ps.city_id = ${sourceCity.id}
      `;

      if (!sourceCounts || sourceCounts.sections === 0) {
        throw new Error(`Source city "${SOURCE_CITY_SLUG}" has no pricing data to copy.`);
      }

      await tx`
        delete from price_sections
        where city_id = ${targetCity.id}
      `;

      await tx`
        insert into price_sections (
          city_id,
          slug,
          title,
          subtitle,
          guarantee,
          sort_order,
          is_published
        )
        select
          ${targetCity.id},
          slug,
          title,
          subtitle,
          guarantee,
          sort_order,
          is_published
        from price_sections
        where city_id = ${sourceCity.id}
        order by sort_order, title
      `;

      await tx`
        insert into price_items (
          section_id,
          slug,
          name,
          secondary_line,
          note,
          price,
          old_price,
          sort_order,
          is_published
        )
        select
          target_sections.id,
          source_items.slug,
          source_items.name,
          source_items.secondary_line,
          source_items.note,
          source_items.price,
          source_items.old_price,
          source_items.sort_order,
          source_items.is_published
        from price_items source_items
        join price_sections source_sections on source_sections.id = source_items.section_id
        join price_sections target_sections
          on target_sections.city_id = ${targetCity.id}
         and target_sections.slug = source_sections.slug
        where source_sections.city_id = ${sourceCity.id}
        order by source_items.sort_order, source_items.name
      `;

      await tx`
        insert into price_item_details (
          price_item_id,
          description,
          extra_text,
          show_more_enabled
        )
        select
          target_items.id,
          source_details.description,
          source_details.extra_text,
          source_details.show_more_enabled
        from price_item_details source_details
        join price_items source_items on source_items.id = source_details.price_item_id
        join price_sections source_sections on source_sections.id = source_items.section_id
        join price_sections target_sections
          on target_sections.city_id = ${targetCity.id}
         and target_sections.slug = source_sections.slug
        join price_items target_items
          on target_items.section_id = target_sections.id
         and target_items.slug = source_items.slug
        where source_sections.city_id = ${sourceCity.id}
      `;

      await tx`
        insert into price_item_images (
          price_item_id,
          image_url,
          image_type,
          alt,
          sort_order
        )
        select
          target_items.id,
          source_images.image_url,
          source_images.image_type,
          source_images.alt,
          source_images.sort_order
        from price_item_images source_images
        join price_items source_items on source_items.id = source_images.price_item_id
        join price_sections source_sections on source_sections.id = source_items.section_id
        join price_sections target_sections
          on target_sections.city_id = ${targetCity.id}
         and target_sections.slug = source_sections.slug
        join price_items target_items
          on target_items.section_id = target_sections.id
         and target_items.slug = source_items.slug
        where source_sections.city_id = ${sourceCity.id}
        order by source_images.sort_order, source_images.created_at
      `;

      const [targetCounts] = await tx`
        select
          count(distinct ps.id)::int as sections,
          count(distinct pi.id)::int as items,
          count(distinct pid.id)::int as details,
          count(distinct pii.id)::int as images
        from price_sections ps
        left join price_items pi on pi.section_id = ps.id
        left join price_item_details pid on pid.price_item_id = pi.id
        left join price_item_images pii on pii.price_item_id = pi.id
        where ps.city_id = ${targetCity.id}
      `;

      return {
        sourceTitle: sourceCity.title,
        targetTitle: targetCity.title,
        sourceCounts,
        targetCounts,
      };
    });

    console.log(
      `Copied pricing from ${result.sourceTitle} to ${result.targetTitle}.`,
    );
    console.log(JSON.stringify(result.targetCounts, null, 2));
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
