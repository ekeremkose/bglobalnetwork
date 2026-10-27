"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { FieldErrors, SaveIntent, SaveResult } from "@/lib/admin/common";
import { Banner, ConfirmDialog, Dialog, StatusPill, buttonClass } from "@/components/admin/ui";

export const NETWORK_ERROR =
  "Sunucuya ulaşılamadı ya da istek tamamlanamadı. Girdileriniz korundu; bağlantınızı kontrol edip tekrar deneyin.";

/**
 * Form state shared by the three content editors: tracks unsaved changes and
 * runs saves so that a double click can never send two requests, a failure
 * keeps every typed value, and the editor only closes after the server said ok.
 */
export function useEditorForm<V, T>({
  initial,
  save,
  onSaved,
  onItems,
}: {
  initial: V;
  save: (intent: SaveIntent, values: V) => Promise<SaveResult<T>>;
  onSaved: (result: Extract<SaveResult<T>, { ok: true }>, intent: SaveIntent) => void;
  /** Called with a refreshed list when the server returns one on failure (e.g. record was deleted elsewhere). */
  onItems?: (items: T[]) => void;
}) {
  const [values, setValues] = useState<V>(initial);
  const baseline = useRef(JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  // True while formError is the "N alan düzeltilmeli" validation summary; network and
  // server failures are never cleared by typing.
  const summaryIsValidation = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const dirty = JSON.stringify(values) !== baseline.current;

  const set = useCallback(<K extends keyof V>(key: K, value: V[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (summaryIsValidation.current) {
      summaryIsValidation.current = false;
      setFormError(null);
    }
    setFieldErrors((e) => {
      if (!(key as string in e)) return e;
      const rest = { ...e };
      delete rest[key as string];
      return rest;
    });
  }, []);

  const submit = useCallback(
    async (intent: SaveIntent) => {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      summaryIsValidation.current = false;
      setFormError(null);
      try {
        const result = await save(intent, values);
        if (result.ok) {
          baseline.current = JSON.stringify(values);
          onSaved(result, intent);
        } else {
          setFormError(result.message);
          summaryIsValidation.current = Object.keys(result.fieldErrors ?? {}).length > 0;
          setFieldErrors(result.fieldErrors ?? {});
          if (result.items) onItems?.(result.items);
        }
      } catch {
        setFormError(NETWORK_ERROR);
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    [save, values, onSaved, onItems]
  );

  return { values, set, setValues, dirty, saving, formError, setFormError, fieldErrors, submit };
}

type Props = {
  heading: string;
  /** null while the record has never been saved. */
  status: "draft" | "published" | null;
  viewHref?: string;
  dirty: boolean;
  saving: boolean;
  formError: string | null;
  fieldErrors: FieldErrors;
  onSubmit: (intent: SaveIntent) => void;
  onClose: () => void;
  form: ReactNode;
  preview: ReactNode;
  previewNote?: string;
};

/** The editor dialog: header with tabs, scrolling body, and an always-visible action bar. */
export function EditorShell({
  heading,
  status,
  viewHref,
  dirty,
  saving,
  formError,
  fieldErrors,
  onSubmit,
  onClose,
  form,
  preview,
  previewNote = "Önizleme: kaydedilmemiş içeriğiniz sitedeki görünümüyle gösterilir. Henüz yayımlanmadı.",
}: Props) {
  const titleId = useId();
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [confirm, setConfirm] = useState<null | "discard" | "unpublish">(null);
  const published = status === "published";
  const bodyRef = useRef<HTMLDivElement>(null);
  // Bumped by each failed submission; the focus effect runs once per bump.
  const [focusRequest, setFocusRequest] = useState(0);
  const lastFocused = useRef(0);

  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirm("discard");
    else onClose();
  };

  // Browser-level navigation (reload, closing the tab, Back) while there are unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // After a failed save, show the form tab, then bring the first invalid control into view and focus it.
  // Only a finished submission that returned a fresh error set does this; clearing an error while
  // typing, or a network failure that returns no field errors, must not move focus.
  const errorsAtSubmit = useRef<FieldErrors | null>(null);
  const errorKeys = Object.keys(fieldErrors).join("|");
  useEffect(() => {
    if (saving) {
      errorsAtSubmit.current = fieldErrors;
      return;
    }
    if (!errorsAtSubmit.current) return;
    const changed = errorsAtSubmit.current !== fieldErrors;
    errorsAtSubmit.current = null;
    if (changed && errorKeys) {
      setFocusRequest((n) => n + 1);
      setTab("edit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving]);

  // Runs once the form pane is visible (a failure raised from the preview tab switches tabs first).
  useEffect(() => {
    if (tab !== "edit" || focusRequest === lastFocused.current) return;
    const t = setTimeout(() => {
      lastFocused.current = focusRequest;
      const el = bodyRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      el?.scrollIntoView({ block: "center" });
      el?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [tab, focusRequest]);

  // A user-initiated tab change starts at the top of the shared scrolling body.
  const selectTab = (next: "edit" | "preview") => {
    if (next !== tab && bodyRef.current) bodyRef.current.scrollTop = 0;
    setTab(next);
  };

  return (
    <>
      <Dialog labelledBy={titleId} onRequestClose={requestClose}>
        <form
          noValidate
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            // Enter never publishes: it saves in the record's current state.
            onSubmit(published ? "save" : "draft");
          }}
        >
          <div className="shrink-0 border-b border-slate-200 px-4 pt-4 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id={titleId} className="truncate text-lg font-semibold text-slate-900">
                  {heading}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {status ? <StatusPill status={status} /> : <span className="text-xs text-slate-500">Yeni kayıt · henüz kaydedilmedi</span>}
                  {published && viewHref && (
                    <a
                      href={viewHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-brand-700 underline underline-offset-2"
                    >
                      Sitede görüntüle ↗
                    </a>
                  )}
                  {dirty && <span className="text-xs font-medium text-amber-700">Kaydedilmemiş değişiklikler var</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={requestClose}
                disabled={saving}
                aria-label="Kapat"
                className="-mr-1 shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              >
                <span aria-hidden className="text-xl leading-none">×</span>
              </button>
            </div>
            <div role="tablist" aria-label="Düzenleyici bölümleri" className="mt-3 flex gap-1">
              {(
                [
                  ["edit", "Düzenle"],
                  ["preview", "Önizleme"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => selectTab(key)}
                  className={`-mb-px rounded-t-lg border border-b-0 px-4 py-2 text-sm font-semibold ${
                    tab === key
                      ? "border-slate-200 bg-white text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div hidden={tab !== "edit"} className="space-y-5">
              {form}
            </div>
            {tab === "preview" && (
              <div className="space-y-3">
                <Banner tone="info">{previewNote}</Banner>
                {preview}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
            {formError && (
              <div className="mb-3">
                <Banner tone="error" live>
                  {formError}
                </Banner>
              </div>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" className={buttonClass.secondary} onClick={requestClose} disabled={saving}>
                İptal
              </button>
              {published ? (
                <>
                  <button
                    type="button"
                    className={buttonClass.secondary}
                    onClick={() => setConfirm("unpublish")}
                    disabled={saving}
                  >
                    Yayından kaldır
                  </button>
                  <button
                    type="button"
                    className={buttonClass.primary}
                    onClick={() => onSubmit("save")}
                    disabled={saving}
                  >
                    {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={buttonClass.secondary}
                    onClick={() => onSubmit("draft")}
                    disabled={saving}
                  >
                    {saving ? "Kaydediliyor…" : "Taslağı kaydet"}
                  </button>
                  <button
                    type="button"
                    className={buttonClass.primary}
                    onClick={() => onSubmit("publish")}
                    disabled={saving}
                  >
                    Yayımla
                  </button>
                </>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-right">
              {published
                ? "Değişiklikleri kaydet: yayındaki sayfa hemen güncellenir. Yayından kaldır: kayıt silinmez, taslağa döner."
                : "Taslağı kaydet: sitede görünmez. Yayımla: tüm zorunlu alanlar doluysa kayıt hemen sitede görünür."}
            </p>
          </div>
        </form>
      </Dialog>

      {confirm === "discard" && (
        <ConfirmDialog
          title="Kaydedilmemiş değişiklikler"
          confirmLabel="Değişiklikleri at ve kapat"
          cancelLabel="Düzenlemeye devam et"
          onConfirm={onClose}
          onCancel={() => setConfirm(null)}
        >
          Kapatırsanız bu düzenlemedeki değişiklikler kaybolur.
        </ConfirmDialog>
      )}
      {confirm === "unpublish" && (
        <ConfirmDialog
          title="Yayından kaldırılsın mı?"
          confirmLabel="Yayından kaldır"
          cancelLabel="Vazgeç"
          tone="primary"
          busy={saving}
          onConfirm={() => {
            setConfirm(null);
            onSubmit("unpublish");
          }}
          onCancel={() => setConfirm(null)}
        >
          Kayıt sitede görünmez olur; silinmez ve daha sonra yeniden yayımlanabilir. Formdaki değişiklikler taslak olarak kaydedilir.
        </ConfirmDialog>
      )}
    </>
  );
}
