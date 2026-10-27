"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Reel } from "@/lib/types/content";
import { saveReelAction } from "@/app/internal-admin/(panel)/reels/actions";
import type { ReelFields } from "@/lib/admin/reelService";
import { CoverPreview } from "@/components/admin/CoverPreview";
import { EditorShell, useEditorForm } from "@/components/admin/editor";
import { TextAreaField, TextField, buttonClass } from "@/components/admin/ui";
import { slugify } from "@/lib/utils/slug";
import { validateInstagramUrl } from "@/lib/utils/validate";
import { pickLeadReel } from "@/lib/utils/reels";

export const LEAD_RULE =
  "Anasayfadaki büyük kapak şöyle seçilir: yayındaki Reels arasından önce “öne çıkar” işaretliler, kendi içinde en yeni yayın tarihlisi; hiçbiri işaretli değilse en yeni Reel. /İçerik sayfası da aynı sıralamayı kullanır.";

function initialValues(item: Reel | null): ReelFields {
  return {
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    shortDescription: item?.shortDescription ?? "",
    instagramUrl: item?.instagramUrl ?? "",
    tag: item?.tag ?? "",
    publishedAt: item?.publishedAt ?? new Date().toISOString().slice(0, 10),
    thumbnail: item?.thumbnail ?? "",
    featured: !!item?.featured,
  };
}

export function ReelEditor({
  item,
  all,
  onClose,
  onSaved,
  onItems,
}: {
  item: Reel | null;
  all: Reel[];
  onClose: () => void;
  onSaved: (items: Reel[], message: string) => void;
  onItems: (items: Reel[]) => void;
}) {
  const newId = useRef(`reel-${crypto.randomUUID()}`);
  const id = item?.id ?? newId.current;
  const mode: "create" | "update" = item ? "update" : "create";
  const slugTouched = useRef(!!item);
  const published = item?.status === "published";
  const tags = useMemo(() => Array.from(new Set(all.map((r) => r.tag).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr")), [all]);

  const form = useEditorForm<ReelFields, Reel>({
    initial: initialValues(item),
    save: (intent, fields) => saveReelAction({ id, mode, intent, fields }),
    onSaved: (r) => onSaved(r.items, r.message),
    onItems,
  });
  const { values: v, set, fieldErrors: err } = form;

  // The admin lives under one concealed path segment; the upload endpoint sits next to the pages.
  const pathname = usePathname() ?? "";
  const uploadUrl = `/${pathname.split("/")[1] ?? ""}/yukle`;
  const [upload, setUpload] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null });
  const fileInput = useRef<HTMLInputElement>(null);

  const uploadCover = async (file: File) => {
    setUpload({ busy: true, error: null });
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch(uploadUrl, { method: "POST", body });
      const data = (await res.json().catch(() => null)) as { url?: string; message?: string } | null;
      if (!res.ok || !data?.url) {
        setUpload({ busy: false, error: data?.message ?? "Görsel yüklenemedi. Tekrar deneyin." });
        return;
      }
      set("thumbnail", data.url);
      setUpload({ busy: false, error: null });
    } catch {
      setUpload({ busy: false, error: "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin." });
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const safeUrl = v.instagramUrl && !validateInstagramUrl(v.instagramUrl) ? v.instagramUrl : "#";
  const draftReel: Reel = {
    id,
    status: "draft",
    slug: v.slug,
    title: v.title || "(Başlık girilmedi)",
    shortDescription: v.shortDescription,
    instagramUrl: safeUrl,
    tag: v.tag || "Etiket",
    featured: v.featured,
    publishedAt: v.publishedAt,
  };

  // Which Reel would lead the homepage if this one were published with the current form values.
  const lead = useMemo(() => {
    const others = all.filter((r) => r.id !== id && r.status === "published");
    return pickLeadReel([...others, { ...draftReel, status: "published" as const }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, id, v.featured, v.publishedAt]);
  const leadOther = lead && lead.id !== id ? all.find((r) => r.id === lead.id) : undefined;

  return (
    <EditorShell
      heading={item ? "İçeriği (Reel) düzenle" : "Yeni içerik (Reel)"}
      status={item ? item.status : null}
      viewHref="/reels"
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
            label="Adres (slug)"
            value={v.slug}
            error={err.slug}
            disabled={published}
            className="font-mono"
            hint={
              published
                ? "Yayındaki kaydın adresi sabittir. Değiştirmek için önce yayından kaldırın."
                : "Reels için ayrı sayfa yoktur; adres yalnızca kaydı tanımlar. Boş bırakırsanız başlıktan üretilir."
            }
            onChange={(e) => {
              slugTouched.current = true;
              set("slug", e.target.value);
            }}
          />
          <TextAreaField
            label="Açıklama"
            required
            rows={3}
            value={v.shortDescription}
            error={err.shortDescription}
            maxLength={400}
            hint="Kapağın altında görünen kısa metin."
            onChange={(e) => set("shortDescription", e.target.value)}
          />
          <TextField
            label="Instagram Reel bağlantısı"
            required
            type="url"
            inputMode="url"
            placeholder="https://www.instagram.com/reel/…"
            value={v.instagramUrl}
            error={err.instagramUrl}
            hint="Kapağa tıklayan ziyaretçi bu adreste Instagram’a gider. Site içinde oynatıcı yoktur."
            onChange={(e) => set("instagramUrl", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <TextField
                label="Etiket"
                required
                list="reel-tags"
                maxLength={40}
                placeholder="Erasmus+, Staj, Burs…"
                value={v.tag}
                error={err.tag}
                onChange={(e) => set("tag", e.target.value)}
              />
              <datalist id="reel-tags">
                {tags.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <TextField
              label="Yayın tarihi"
              required
              type="date"
              value={v.publishedAt}
              error={err.publishedAt}
              hint="Sıralama için kullanılır (yenisi önce). Zamanlanmış yayın değildir: Yayımla’ya basınca kayıt tarihten bağımsız hemen görünür."
              onChange={(e) => set("publishedAt", e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start gap-3">
              <input
                id="reel-featured"
                type="checkbox"
                checked={v.featured}
                className="mt-1 h-4 w-4 accent-brand-700"
                aria-describedby="reel-featured-hint"
                onChange={(e) => set("featured", e.target.checked)}
              />
              <div>
                <label htmlFor="reel-featured" className="text-sm font-semibold text-slate-800">
                  Anasayfada ana kapak olarak öne çıkar
                </label>
                <p id="reel-featured-hint" className="mt-1 text-xs leading-relaxed text-slate-500">
                  {LEAD_RULE}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-700" data-testid="lead-note">
              {leadOther
                ? `Şu an (bu kayıt yayımlanırsa) anasayfanın ana kapağı: “${leadOther.title}”.`
                : "Bu kayıt yayımlanırsa anasayfanın ana kapağı bu Reel olur."}
            </p>
          </div>

          <div>
            <TextField
              label="Kapak görseli"
              placeholder="/reels/ornek.jpg"
              value={v.thumbnail}
              error={err.thumbnail}
              autoCapitalize="none"
              spellCheck={false}
              hint="İsteğe bağlı. Boşsa sitedeki yer tutucu kapak görünür. Aşağıdan görsel yükleyebilir ya da bir yol / https bağlantısı yazabilirsiniz."
              onChange={(e) => set("thumbnail", e.target.value)}
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                ref={fileInput}
                id="reel-cover-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="sr-only"
                disabled={upload.busy || form.saving}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadCover(file);
                }}
              />
              <label
                htmlFor="reel-cover-file"
                className={`${buttonClass.secondary} cursor-pointer ${upload.busy || form.saving ? "pointer-events-none opacity-50" : ""}`}
              >
                {upload.busy ? "Yükleniyor…" : "Görsel yükle"}
              </label>
              <span className="text-xs text-slate-500">JPG, PNG, WebP, AVIF veya GIF · en fazla 5 MB · dikey (9:16) görseller en iyi sonucu verir</span>
            </div>
            {upload.error && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {upload.error}
              </p>
            )}
            <div className="mt-3">
              <CoverPreview reel={draftReel} cover={v.thumbnail} />
            </div>
          </div>
        </>
      }
      previewNote="Önizleme: Reel, sitedeki dikey kapak görünümüyle gösterilir. Henüz yayımlanmadı."
      preview={
        <div className="rounded-xl p-5 sm:p-8" style={{ background: "#ecedf4" }}>
          <CoverPreview reel={draftReel} cover={v.thumbnail} large />
        </div>
      }
    />
  );
}

