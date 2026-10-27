"use client";

import { useMemo, useRef, useState } from "react";
import type { Opportunity, PublishStatus } from "@/lib/types/content";
import { saveOpportunityAction } from "@/app/internal-admin/(panel)/opportunities/actions";
import type { OpportunityFields } from "@/lib/admin/opportunityService";
import { OpportunityDetail } from "@/components/opportunities/OpportunityDetail";
import { EditorShell, useEditorForm } from "@/components/admin/editor";
import { SelectField, TextAreaField, TextField } from "@/components/admin/ui";
import { getCategories } from "@/lib/repositories/categoryRepository";
import { getCountries } from "@/lib/repositories/countryRepository";
import { slugify } from "@/lib/utils/slug";
import { validateHttpUrl } from "@/lib/utils/validate";

export type ReelOption = { id: string; title: string; status: PublishStatus };

export const FORMAT_HELP =
  "Biçimlendirme: her satır ayrı bir paragraf olur; “- ” ile başlayan satırlar madde işaretli liste olur. Başka biçimlendirme (kalın, başlık, bağlantı) desteklenmez ve metin olarak görünür.";

function initialValues(item: Opportunity | null): OpportunityFields {
  return {
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    shortDescription: item?.shortDescription ?? "",
    fullDescription: item?.fullDescription ?? "",
    country: item?.country ?? "",
    category: item?.category ?? "",
    deadline: item?.deadline ?? "",
    externalLink: item?.externalLink ?? "",
    relatedReelIds: item?.relatedReelIds ?? [],
  };
}

export function OpportunityEditor({
  item,
  reels,
  onClose,
  onSaved,
  onItems,
}: {
  item: Opportunity | null;
  reels: ReelOption[];
  onClose: () => void;
  onSaved: (items: Opportunity[], message: string) => void;
  onItems: (items: Opportunity[]) => void;
}) {
  // One id per editor session: a double submit of a new record updates it instead of creating a twin.
  const newId = useRef(`opp-${crypto.randomUUID()}`);
  const id = item?.id ?? newId.current;
  const slugTouched = useRef(!!item);
  const categories = useMemo(() => getCategories(), []);
  const countries = useMemo(() => getCountries(), []);
  const [mode] = useState<"create" | "update">(item ? "update" : "create");
  const published = item?.status === "published";

  const form = useEditorForm<OpportunityFields, Opportunity>({
    initial: initialValues(item),
    save: (intent, fields) => saveOpportunityAction({ id, mode, intent, fields }),
    onSaved: (r) => onSaved(r.items, r.message),
    onItems,
  });
  const { values: v, set, fieldErrors: err } = form;

  const preview: Opportunity = {
    id,
    status: "draft",
    slug: v.slug,
    title: v.title || "(Başlık girilmedi)",
    shortDescription: v.shortDescription,
    fullDescription: v.fullDescription,
    country: v.country,
    category: v.category,
    deadline: v.deadline,
    externalLink: v.externalLink && !validateHttpUrl(v.externalLink) ? v.externalLink : "#",
  };
  const relatedPreview = reels.filter((r) => v.relatedReelIds.includes(r.id));

  return (
    <EditorShell
      heading={item ? "Projeyi düzenle" : "Yeni proje"}
      status={item ? item.status : null}
      viewHref={item ? `/opportunities/${item.slug}` : undefined}
      dirty={form.dirty}
      saving={form.saving}
      formError={form.formError}
      fieldErrors={err}
      onSubmit={form.submit}
      onClose={onClose}
      form={
        <>
          <TextField
            label="Başlık"
            required
            value={v.title}
            error={err.title}
            maxLength={160}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched.current) set("slug", slugify(e.target.value));
            }}
          />
          <TextField
            label="Sayfa adresi (slug)"
            value={v.slug}
            error={err.slug}
            disabled={published}
            className="font-mono"
            hint={
              published
                ? `Yayındaki sayfanın adresi sabittir: /opportunities/${v.slug}. Değiştirmek için önce yayından kaldırın.`
                : `Sitede /opportunities/${v.slug || "adres"} olarak açılır. Boş bırakırsanız başlıktan üretilir. Yayımlandıktan sonra değişmez.`
            }
            onChange={(e) => {
              slugTouched.current = true;
              set("slug", e.target.value);
            }}
          />
          <TextAreaField
            label="Kısa açıklama"
            required
            rows={2}
            value={v.shortDescription}
            error={err.shortDescription}
            maxLength={400}
            hint="Başlığın altında ve listelerde görünür."
            onChange={(e) => set("shortDescription", e.target.value)}
          />
          <TextAreaField
            label="Tam açıklama"
            required
            rows={8}
            value={v.fullDescription}
            error={err.fullDescription}
            hint={FORMAT_HELP}
            onChange={(e) => set("fullDescription", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Ülke"
              required
              value={v.country}
              error={err.country}
              onChange={(e) => set("country", e.target.value)}
            >
              <option value="">Seçin…</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Kategori"
              required
              value={v.category}
              error={err.category}
              onChange={(e) => set("category", e.target.value)}
            >
              <option value="">Seçin…</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </SelectField>
          </div>
          <TextField
            label="Son başvuru tarihi"
            required
            type="date"
            value={v.deadline}
            error={err.deadline}
            hint="Sitedeki “N gün kaldı” / “Süresi doldu” durumu ve anasayfa takvimi bu tarihten otomatik hesaplanır. Yayın durumundan bağımsızdır: süresi dolan bir program yine de yayında kalabilir. Zamanlanmış yayın yoktur; Yayımla’ya basınca kayıt hemen görünür."
            onChange={(e) => set("deadline", e.target.value)}
          />
          <TextField
            label="Başvuru bağlantısı"
            required
            type="url"
            inputMode="url"
            placeholder="https://"
            value={v.externalLink}
            error={err.externalLink}
            hint="“Başvuru sayfasına git” düğmesinin gideceği resmi adres (http/https)."
            onChange={(e) => set("externalLink", e.target.value)}
          />

          <fieldset aria-describedby="related-reels-hint" className="rounded-lg border border-slate-200 p-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">İlgili içerik (Reels)</legend>
            <p id="related-reels-hint" className="text-xs leading-relaxed text-slate-500">
              Seçilenler proje sayfasında “İlgili içerik” bölümünde görünür. Taslak Reels yayına alınana kadar gösterilmez.
            </p>
            {err.relatedReelIds && <p className="mt-1 text-xs font-medium text-red-700">{err.relatedReelIds}</p>}
            {reels.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Henüz Reels yok.</p>
            ) : (
              <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto">
                {reels.map((r) => {
                  const checked = v.relatedReelIds.includes(r.id);
                  return (
                    <li key={r.id}>
                      <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1.5 text-sm text-slate-800 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          className="mt-0.5 h-4 w-4 accent-brand-700"
                          onChange={() =>
                            set(
                              "relatedReelIds",
                              checked ? v.relatedReelIds.filter((x) => x !== r.id) : [...v.relatedReelIds, r.id]
                            )
                          }
                        />
                        <span>
                          {r.title}
                          {r.status === "draft" && <span className="ml-1 text-xs text-slate-500">(Taslak)</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </fieldset>
        </>
      }
      preview={
        <div className="overflow-hidden rounded-xl p-5 text-[#f4f5fa] sm:p-8" style={{ background: "#080e1e" }}>
          <OpportunityDetail opportunity={preview} />
          {relatedPreview.length > 0 && (
            <div className="mt-12 border-t border-white/10 pt-8">
              <h3 className="text-xl font-semibold text-white">İlgili içerik</h3>
              <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
                {relatedPreview.map((r) => (
                  <li key={r.id} className="py-3 text-white">
                    {r.title}
                    {r.status === "draft" && <span className="ml-2 text-sm text-amber-300">Taslak — sitede görünmez</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
    />
  );
}

