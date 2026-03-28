"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { CityWithSections } from "@/lib/types";
import { addSectionAction, updateCityAction } from "../actions";
import {
  AdminCheckbox,
  AdminField,
  AdminFormActions,
  AdminPanel,
  AdminStat,
  AdminStatusPill,
  adminInputClassName,
  adminPrimaryButtonClassName,
  adminTextareaClassName,
} from "./admin-ui";
import { AdminAdvancedAccordion } from "./admin-advanced-accordion";
import { PriceEditorSection } from "./price-editor-section";

interface PriceEditorCityProps {
  city: CityWithSections;
  focusedSectionId?: string;
  focusedItemId?: string;
}

export function PriceEditorCity({
  city,
  focusedSectionId,
  focusedItemId,
}: PriceEditorCityProps) {
  return (
    <section id={`city-${city.slug}`} className="space-y-4 scroll-mt-6">
      <AdminPanel
        title={`Город: ${city.title}`}
        description="Здесь удобно править контакты и быстро перейти к публичной версии страницы, чтобы проверить результат глазами клиента."
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,430px)]">
          <div className="rounded-[28px] border border-border bg-[radial-gradient(circle_at_top_left,rgba(201,168,124,0.18),transparent_45%),linear-gradient(180deg,#fffdf9,#faf8f5)] p-5 shadow-[0_14px_34px_rgba(26,22,20,0.04)]">
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusPill tone={city.isActive ? "success" : "draft"}>
                {city.isActive ? "Активный город" : "Скрыт"}
              </AdminStatusPill>
              <AdminStatusPill>{city.sections.length} разделов</AdminStatusPill>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Город на сайте
                </p>
                <h2 className="mt-2 font-serif text-4xl leading-none tracking-tight text-primary">
                  {city.title}
                </h2>
              </div>

              <Link
                href={`/prices/${city.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/75 transition-colors duration-300 hover:border-primary/25 hover:text-primary"
              >
                Открыть страницу
                <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/75">
                {city.whatsappDisplay || "WhatsApp не указан"}
              </span>
              <span className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/75">
                @{city.instagram || "instagram"}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <AdminStat label="Разделы" value={String(city.sections.length)} />
              <AdminStat
                label="Услуги"
                value={String(city.sections.reduce((total, section) => total + section.items.length, 0))}
              />
              <AdminStat label="Порядок" value={String(city.sortOrder)} />
            </div>
          </div>

          <form action={updateCityAction} className="grid gap-4 rounded-[28px] border border-border bg-background/65 p-5">
            <input type="hidden" name="id" value={city.id} />

            <AdminField label="Название города">
              <input className={adminInputClassName} type="text" name="title" defaultValue={city.title} />
            </AdminField>

            <AdminField
              label="Телефон для WhatsApp"
              hint="Номер без лишних символов. Он используется для кнопки записи."
            >
              <input
                className={adminInputClassName}
                type="text"
                name="whatsapp"
                defaultValue={city.whatsapp}
              />
            </AdminField>

            <AdminField
              label="Подпись WhatsApp"
              hint="То, что клиент увидит на кнопке или рядом с контактами."
            >
              <input
                className={adminInputClassName}
                type="text"
                name="whatsappDisplay"
                defaultValue={city.whatsappDisplay}
              />
            </AdminField>

            <AdminField label="Instagram">
              <input
                className={adminInputClassName}
                type="text"
                name="instagram"
                defaultValue={city.instagram}
              />
            </AdminField>

            <AdminField
              label="Порядок вывода"
              hint="Чем меньше число, тем выше город будет показан на первом экране."
            >
              <input
                className={adminInputClassName}
                type="number"
                name="sortOrder"
                defaultValue={city.sortOrder}
              />
            </AdminField>

            <AdminCheckbox
              name="isActive"
              label="Показывать город на сайте"
              defaultChecked={city.isActive}
              hint="Если выключить, город не будет виден клиентам."
            />

            <AdminFormActions>
              <button className={adminPrimaryButtonClassName} type="submit">
                Сохранить контакты
              </button>
            </AdminFormActions>
          </form>
        </div>
      </AdminPanel>

      <AdminPanel
        title={`Добавить новый раздел в ${city.title}`}
        description="Используйте этот блок, когда нужно создать новую категорию услуг. Если slug не нужен вручную, просто оставьте его пустым."
      >
        <form action={addSectionAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input type="hidden" name="cityId" value={city.id} />

          <AdminField label="Название раздела">
            <input className={adminInputClassName} type="text" name="title" required />
          </AdminField>

          <AdminField
            label="Подзаголовок"
            hint="Короткое пояснение, если оно должно быть видно перед списком услуг."
          >
            <input className={adminInputClassName} type="text" name="subtitle" />
          </AdminField>

          <AdminField
            label="Порядок вывода"
            hint="Разделы сортируются по возрастанию."
          >
            <input className={adminInputClassName} type="number" name="sortOrder" defaultValue={0} />
          </AdminField>

          <AdminCheckbox
            name="isPublished"
            label="Опубликовать раздел сразу"
            defaultChecked
            hint="Если снять галочку, раздел сохранится как скрытый."
          />

          <AdminField
            label="Гарантия или пояснение"
            className="md:col-span-2 xl:col-span-3"
            hint="Подходит для гарантий, условий коррекции и важных замечаний."
          >
            <textarea className={adminTextareaClassName} name="guarantee" />
          </AdminField>

          <AdminAdvancedAccordion
            className="rounded-[20px] border border-dashed border-border bg-background/50"
            value={`city-new-section-slug-${city.id}`}
          >
            <AdminField
              label="Slug"
              hint="Если оставить пустым, система создаст адрес автоматически."
            >
              <input className={adminInputClassName} type="text" name="slug" />
            </AdminField>
          </AdminAdvancedAccordion>

          <div className="md:col-span-2 xl:col-span-4">
            <button className={adminPrimaryButtonClassName} type="submit">
              Добавить раздел
            </button>
          </div>
        </form>
      </AdminPanel>

      <div className="space-y-4">
        {city.sections.map((section) => (
          <PriceEditorSection
            key={section.id}
            section={section}
            expanded={
              section.id === focusedSectionId ||
              section.items.some((item) => item.id === focusedItemId)
            }
            focusedItemId={focusedItemId}
          />
        ))}

        {city.sections.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-card px-5 py-6 text-sm leading-7 text-muted-foreground">
            Для этого города пока нет разделов. Используйте блок выше, чтобы создать первый раздел прайса.
          </div>
        ) : null}
      </div>
    </section>
  );
}
