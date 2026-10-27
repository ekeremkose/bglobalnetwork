"use client";

import { useRef } from "react";
import type { Announcement } from "@/lib/types/content";
import { savePostAction } from "@/app/internal-admin/(panel)/duyurular/actions";
import type { BlogFields } from "@/lib/admin/blogService";
import { ArticleBody } from "@/components/announcements/ArticleBody";
import { EditorShell, useEditorForm } from "@/components/admin/editor";
import { TextAreaField, TextField } from "@/components/admin/ui";
import { slugify } from "@/lib/utils/slug";
import { isIsoDate, validateHttpUrl } from "@/lib/utils/validate";

export const BODY_HELP =
  "Düz metin: her satır ayrı bir paragraf olur; “- ” ile başlayan satırlar madde işaretli liste olur. Kalın, başlık veya satır içi bağlantı desteklenmez; yazdığınız işaretler olduğu gibi görünür. Önizleme sekmesi sitedeki görünümü gösterir.";

function initialValues(item: Announcement | null): BlogFields {
  return {
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    content: item?.content ?? "",
    publishedAt: item?.publishedAt ?? new Date().toISOString().slice(0, 10),
    link: item?.link ?? "",
  };
}

export function BlogEditor({
  item,
  onClose,
  onSaved,
  onItems,
}: {
  item: Announcement | null;
  onClose: () => void;
  onSaved: (items: Announcement[], message: string) => void;
  onItems: (items: Announcement[]) => void;
}) {
  const newId = useRef(`ann-${crypto.randomUUID()}`);
  const id = item?.id ?? newId.current;
  const mode: "create" | "update" = item ? "update" : "create";
  const slugTouched = useRef(!!item);
  const published = item?.status === "published";

  const form = useEditorForm<BlogFields, Announcement>({
    initial: initialValues(item),
    save: (intent, fields) => savePostAction({ id, mode, intent, fields }),
    onSaved: (r) => onSaved(r.items, r.message),
    onItems,
  });
  const { values: v, set, fieldErrors: err } = form;

  return (
    <EditorShell
      heading={item ? "Yazıyı düzenle" : "Yeni yazı"}
      status={item ? item.status : null}
      viewHref={item ? `/duyurular/${item.slug}` : undefined}
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
                ? `Yayındaki yazının adresi sabittir: /duyurular/${v.slug}. Değiştirmek için önce yayından kaldırın.`
                : `Sitede /duyurular/${v.slug || "adres"} olarak açılır. Boş bırakırsanız başlıktan üretilir. Yayımlandıktan sonra değişmez.`
            }
            onChange={(e) => {
              slugTouched.current = true;
              set("slug", e.target.value);
            }}
          />
          <TextAreaField
            label="Yazı metni"
            required
            rows={14}
            value={v.content}
            error={err.content}
            hint={BODY_HELP}
            onChange={(e) => set("content", e.target.value)}
          />
          <TextField
            label="Yayın tarihi"
            required
            type="date"
            value={v.publishedAt}
            error={err.publishedAt}
            hint="Yazının altında görünen tarih ve Blog listesindeki sıra (yenisi önce). Zamanlanmış yayın değildir: Yayımla’ya basınca yazı hemen görünür."
            onChange={(e) => set("publishedAt", e.target.value)}
          />
          <TextField
            label="Kaynak bağlantısı"
            type="url"
            inputMode="url"
            placeholder="https://"
            value={v.link}
            error={err.link}
            hint="İsteğe bağlı. Doluysa yazının sonunda “Kaynağa git ↗” bağlantısı çıkar."
            onChange={(e) => set("link", e.target.value)}
          />
        </>
      }
      preview={
        <div className="overflow-hidden rounded-xl px-5 pb-10 pt-2 text-[#f4f5fa] sm:px-8" style={{ background: "#080e1e" }}>
          <ArticleBody
            title={v.title || "(Başlık girilmedi)"}
            publishedAt={isIsoDate(v.publishedAt) ? v.publishedAt : ""}
            content={v.content}
            link={v.link && !validateHttpUrl(v.link) ? v.link : undefined}
          />
        </div>
      }
    />
  );
}
