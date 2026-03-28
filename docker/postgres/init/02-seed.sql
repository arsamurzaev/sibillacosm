insert into cities (slug, title, whatsapp, whatsapp_display, instagram, sort_order, is_active)
values
  ('grozny', 'Грозный', '79389121101', '+7 938 912-11-01', 'sibillacosm', 1, true),
  ('moscow', 'Москва', '79882251505', '+7 988 225-15-05', 'sibillacosm', 2, true)
on conflict (slug) do update set
  title = excluded.title,
  whatsapp = excluded.whatsapp,
  whatsapp_display = excluded.whatsapp_display,
  instagram = excluded.instagram,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into price_sections (city_id, slug, title, subtitle, guarantee, sort_order, is_published)
select c.id, s.slug, s.title, s.subtitle, s.guarantee, s.sort_order, true
from cities c
cross join (
  values
    ('lips', 'Увеличение губ', '', 'Постоянная связь с косметологом на протяжении всего периода заживления. В случае неровностей или асимметрии коррекция бесплатна в течение недели.', 1),
    ('nose', 'Коррекция носа', '', 'При выборе полной коррекции носа бесплатная коррекция после заживления при необходимости.', 2),
    ('face', 'Контурная пластика лица', 'Углы нижней челюсти / скулы / подбородок', '', 3),
    ('venus-rings', 'Заполнение колец Венеры', '', '', 4),
    ('complex', 'Комплексные процедуры', 'Лицо под ключ', '', 5),
    ('botox', 'Ботулинотерапия', '', '', 6),
    ('tear-trough', 'Носослезная борозда', '', '', 7),
    ('lipo', 'Липолитики', '', '', 8),
    ('removal', 'Выведение филлера', '', '', 9),
    ('biorevit', 'Биоревитализация / коллагенотерапия', '', '', 10),
    ('eyes', 'Вокруг глаз', '', '', 11)
) as s(slug, title, subtitle, guarantee, sort_order)
where c.slug = 'grozny'
on conflict (city_id, slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  guarantee = excluded.guarantee,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

insert into price_items (section_id, slug, name, secondary_line, note, price, old_price, sort_order, is_published)
select ps.id, i.slug, i.name, i.secondary_line, i.note, i.price, i.old_price, i.sort_order, true
from price_sections ps
join cities c on c.id = ps.city_id and c.slug = 'grozny'
join (
  values
    ('lips', 'dermalax-deep-05', 'Dermalax Deep', '0,5 мл', 'Корея', 9000, null, 1),
    ('lips', 'dermalax-deep-1', 'Dermalax Deep', '1 мл', 'Корея', 14500, null, 2),
    ('lips', 'stylage-m-05', 'Stylage M', '0,5 мл', 'Франция', 11000, null, 3),
    ('lips', 'stylage-m-1', 'Stylage M', '1 мл', 'Франция', 21000, null, 4),
    ('lips', 'juvederm-smile', 'Juvederm Smile', '0,6 мл', 'США', 17000, null, 5),
    ('lips', 'belotero-lips', 'Belotero Lips', '0,6 мл', 'Увлажнение / питание губ', 13500, null, 6),
    ('nose', 'dermalax-full', 'Dermalax Implant', 'Полная коррекция', 'Устранение горбинки, выравнивание спинки, поднятие кончика носа', 15000, null, 1),
    ('nose', 'dermalax-05', 'Dermalax Implant', '0,5 мл', 'Одна зона коррекции', 9000, null, 2),
    ('nose', 'stylage-xl-full', 'Stylage XL', 'Полная коррекция носа', '', 20000, null, 3),
    ('nose', 'nose-tip-drainage', 'Сужение кончика носа', 'Дренажная коррекция', '', 9500, null, 4),
    ('face', 'face-dermalax-05', 'Dermalax Implant', '0,5 мл', '', 8500, null, 1),
    ('face', 'face-dermalax-1', 'Dermalax Implant', '1 мл', '', 14000, null, 2),
    ('face', 'face-stylage-05', 'Stylage XL', '0,5 мл', '', 11000, null, 3),
    ('face', 'face-stylage-1', 'Stylage XL', '1 мл', '', 21000, null, 4),
    ('venus-rings', 'belotero-soft-1', 'Belotero Soft', '1 мл', '', 16000, null, 1),
    ('complex', 'complex-3', 'Dermalax Implant', '3 мл', '', 42000, 45000, 1),
    ('complex', 'complex-4', 'Dermalax Implant', '4 мл', '', 56000, 60000, 2),
    ('botox', 'hyperhidrosis', 'Лечение гипергидроза', '', '', 17000, null, 1),
    ('botox', 'masseter', 'Жевательные мышцы', '', '', 13500, null, 2),
    ('botox', 'lip-flip', 'Выворот губ', '', '', 6000, null, 3),
    ('botox', 'nostrils', 'Сужение ноздрей', '', '', 8500, null, 4),
    ('botox', 'gummy-smile', 'Десневая улыбка', '', '', 6000, null, 5),
    ('botox', 'fox-eyes', 'Лисьи глаза', '', '', 8500, null, 6),
    ('botox', 'forehead-frown', 'Лоб + межбровье', '', '', 10000, null, 7),
    ('botox', 'eyes', 'Глаза', '', '', 5500, null, 8),
    ('botox', 'chin', 'Подбородок', '', '', 6500, null, 9),
    ('botox', 'fox-look-combo', 'Лоб + межбровье + вокруг глаз', 'С эффектом лисьего взгляда', '', 15500, null, 10),
    ('botox', 'full-face', 'Фул фейс', 'От 26 000 ₽', '', 26000, null, 11),
    ('tear-trough', 'teosyal-redensity', 'Teosyal Redensity II', '', '', 21000, null, 1),
    ('lipo', 'lipolong', 'Липолонг', '8 мл', '', 19500, null, 1),
    ('lipo', 'stroinost', 'Стройность', '2 мл', '', 15000, null, 2),
    ('removal', 'full-removal', 'Полное удаление', '', '', 7000, null, 1),
    ('removal', 'partial-removal', 'Частичное удаление', '', '', 4000, null, 2),
    ('biorevit', 'plinest', 'Plinest / Plinest Fast', '', '', 16000, null, 1),
    ('biorevit', 'nithya-stimulate', 'Nithya Stimulate', '', '', 11000, null, 2),
    ('biorevit', 'micro-collost', 'Micro Collost', '', '', 18000, null, 3),
    ('biorevit', 'collost-7', 'Коллост 7%', '1,5 мл', '', 12000, null, 4),
    ('biorevit', 'collost-15', 'Коллост 15%', '1,5 мл', '', 17500, null, 5),
    ('biorevit', 'filorga-135', 'Filorga 135 HA', '', '', 11500, null, 6),
    ('biorevit', 'revi-strong', 'Revi Strong', '2 мл', '', 16000, null, 7),
    ('biorevit', 'revi-silk', 'Revi Silk', '2 мл', '', 13500, null, 8),
    ('biorevit', 'novacutan', 'Novacutan', '', '', 13000, null, 9),
    ('biorevit', 'meso-wharton', 'Meso-Wharton', '', '', 13500, null, 10),
    ('biorevit', 'meso-xanthin', 'Meso-Xanthin', '', '', 13500, null, 11),
    ('biorevit', 'biogel-monaco', 'Biogel Monaco', '', '', 13500, null, 12),
    ('eyes', 'revi-eyes', 'Revi Eyes', '', '', 12000, null, 1),
    ('eyes', 'twac-eyes', 'Twac Eyes', '', '', 17500, null, 2),
    ('eyes', 'mesoeye-c71', 'MesoEye C71', '', '', 14000, null, 3),
    ('eyes', 'biogel-white', 'BioGEL White', '', '', 9500, null, 4),
    ('eyes', 'plinest-fast', 'Plinest Fast', '', '', 15500, null, 5)
) as i(section_slug, slug, name, secondary_line, note, price, old_price, sort_order)
on ps.slug = i.section_slug
on conflict (section_id, slug) do update set
  name = excluded.name,
  secondary_line = excluded.secondary_line,
  note = excluded.note,
  price = excluded.price,
  old_price = excluded.old_price,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

insert into trainings (slug, title, subtitle, duration, price, description, cover_image_url, status, sort_order)
values
  (
    'aesthetic-cosmetology-intensive',
    'Авторское обучение по контурной пластике',
    'Индивидуальный интенсив',
    '3–5 дней',
    300000,
    'Индивидуальное обучение с теорией, постановкой руки и практикой на моделях. Подходит для специалистов, которые хотят системно освоить контурную пластику, работу с губами, лицом и ботулинотерапией.',
    '',
    'published',
    1
  ),
  (
    'lips-course',
    'Обучение по губам',
    'Скоро',
    '',
    0,
    'Текст программы будет добавлен позже.',
    '',
    'draft',
    2
  )
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  duration = excluded.duration,
  price = excluded.price,
  description = excluded.description,
  cover_image_url = excluded.cover_image_url,
  status = excluded.status,
  sort_order = excluded.sort_order;

insert into training_blocks (training_id, title, body, sort_order)
select t.id, b.title, b.body, b.sort_order
from trainings t
join (
  values
    (
      'aesthetic-cosmetology-intensive',
      'Коррекция формы губ',
      $$- техники плоский бант / тп / парижская
- безоперационная ринопластика$$,
      1
    ),
    (
      'aesthetic-cosmetology-intensive',
      'Контурирование лица',
      $$- скулы
- яблочки молодости
- углы челюсти
- подбородок
- носогубные складки$$,
      2
    ),
    (
      'aesthetic-cosmetology-intensive',
      'Ботулинотерапия',
      $$- межбровья, глаза, лоб, поднятие бровей,
кроличьи морщины, расслабление подбородка$$,
      3
    ),
    (
      'aesthetic-cosmetology-intensive',
      'Дополнительно',
      $$- первая медицинская помощь
- анатомия
- осложнения и их лечение
- противопоказания
- предоставление моделей
с полной постановкой руки
- теория
- видеоматериал +
возможность съемки во время работы
- контакты поставщиков$$,
      4
    ),
    (
      'aesthetic-cosmetology-intensive',
      'Сертификат',
      $$- по окончанию курса
выдается сертификат Московского образца$$,
      5
    )
) as b(training_slug, title, body, sort_order)
on t.slug = b.training_slug
on conflict do nothing;

insert into site_settings (key, value)
values
  ('landing_intro', '{"title":"Выберите направление","description":"Прайс по городам и отдельный раздел обучения с онлайн-редактированием через админку."}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();
