create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  whatsapp text not null default '',
  whatsapp_display text not null default '',
  instagram text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists price_sections (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  slug text not null,
  title text not null,
  subtitle text not null default '',
  guarantee text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, slug)
);

create table if not exists price_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references price_sections(id) on delete cascade,
  slug text not null,
  name text not null,
  secondary_line text not null default '',
  note text not null default '',
  price integer not null default 0,
  old_price integer,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, slug)
);

create table if not exists price_item_details (
  id uuid primary key default gen_random_uuid(),
  price_item_id uuid not null unique references price_items(id) on delete cascade,
  description text not null default '',
  extra_text text not null default '',
  show_more_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists price_item_images (
  id uuid primary key default gen_random_uuid(),
  price_item_id uuid not null references price_items(id) on delete cascade,
  image_url text not null,
  image_type text not null check (image_type in ('before', 'after', 'gallery')),
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trainings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  duration text not null default '',
  price integer not null default 0,
  description text not null default '',
  cover_image_url text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists training_blocks (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  title text not null,
  body text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists training_images (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  image_url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists cities_set_updated_at on cities;
create trigger cities_set_updated_at before update on cities
for each row execute function set_updated_at();

drop trigger if exists price_sections_set_updated_at on price_sections;
create trigger price_sections_set_updated_at before update on price_sections
for each row execute function set_updated_at();

drop trigger if exists price_items_set_updated_at on price_items;
create trigger price_items_set_updated_at before update on price_items
for each row execute function set_updated_at();

drop trigger if exists price_item_details_set_updated_at on price_item_details;
create trigger price_item_details_set_updated_at before update on price_item_details
for each row execute function set_updated_at();

drop trigger if exists price_item_images_set_updated_at on price_item_images;
create trigger price_item_images_set_updated_at before update on price_item_images
for each row execute function set_updated_at();

drop trigger if exists trainings_set_updated_at on trainings;
create trigger trainings_set_updated_at before update on trainings
for each row execute function set_updated_at();

drop trigger if exists training_blocks_set_updated_at on training_blocks;
create trigger training_blocks_set_updated_at before update on training_blocks
for each row execute function set_updated_at();

drop trigger if exists training_images_set_updated_at on training_images;
create trigger training_images_set_updated_at before update on training_images
for each row execute function set_updated_at();

create index if not exists price_sections_city_id_idx on price_sections(city_id);
create index if not exists price_items_section_id_idx on price_items(section_id);
create index if not exists price_item_images_item_id_idx on price_item_images(price_item_id);
create index if not exists training_blocks_training_id_idx on training_blocks(training_id);
create index if not exists training_images_training_id_idx on training_images(training_id);
