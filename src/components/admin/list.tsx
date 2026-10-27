"use client";

import { useCallback, useId, useMemo, useState, type ReactNode } from "react";
import type { MutationResult, SaveResult } from "@/lib/admin/common";
import type { PublishStatus } from "@/lib/types/content";
import { Banner, ConfirmDialog, StatusPill, buttonClass, inputClass } from "@/components/admin/ui";
import { NETWORK_ERROR } from "@/components/admin/editor";

type Row = { id: string; title: string; status: PublishStatus };
type Notice = { tone: "success" | "error"; text: string } | null;

/**
 * State for a content list: the items shown (always replaced by the server's
 * list after a mutation), the open editor, status changes and deletion.
 * A failed mutation never touches the list.
 */
export function useAdminList<T extends Row>(
  initialItems: T[],
  api: {
    setStatus: (id: string, status: PublishStatus) => Promise<SaveResult<T>>;
    remove: (id: string) => Promise<MutationResult<T>>;
  }
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fail = (text: string, fresh?: T[]) => {
    if (fresh) setItems(fresh);
    setNotice({ tone: "error", text });
  };

  const changeStatus = useCallback(
    async (item: T, status: PublishStatus) => {
      if (busyId) return;
      setBusyId(item.id);
      setNotice(null);
      try {
        const r = await api.setStatus(item.id, status);
        if (r.ok) {
          setItems(r.items);
          setNotice({ tone: "success", text: r.message });
        } else fail(r.message, r.items);
      } catch {
        fail(NETWORK_ERROR);
      } finally {
        setBusyId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, busyId]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      const r = await api.remove(deleting.id);
      if (r.ok) {
        setItems(r.items);
        setNotice({ tone: "success", text: r.message });
        setDeleting(null);
      } else {
        // The item stays in the list (unless the server says it is already gone).
        if (r.items) setItems(r.items);
        setDeleteError(r.message);
      }
    } catch {
      setDeleteError(`${NETWORK_ERROR.split(" Girdileriniz")[0]} Kayıt silinmedi.`);
    } finally {
      setDeleteBusy(false);
    }
  }, [api, deleting, deleteBusy]);

  return {
    items,
    setItems,
    editing,
    setEditing,
    notice,
    setNotice,
    busyId,
    deleting,
    setDeleting: (item: T | null) => {
      setDeleteError(null);
      setDeleting(item);
    },
    deleteBusy,
    deleteError,
    changeStatus,
    confirmDelete,
  };
}

export type StatusFilter = "all" | PublishStatus;

export function useListFilter<T extends Row>(items: T[], haystack: (item: T) => string) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    return items.filter(
      (i) =>
        (status === "all" || i.status === status) &&
        (!q || haystack(i).toLocaleLowerCase("tr-TR").includes(q))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, status]);
  return { search, setSearch, status, setStatus, visible, filtered: !!search.trim() || status !== "all" };
}

export function ListShell<T extends Row>({
  title,
  description,
  items,
  visible,
  filtered,
  search,
  setSearch,
  status,
  setStatus,
  newLabel,
  onNew,
  notice,
  dismissNotice,
  renderRow,
  emptyText,
  extraToolbar,
}: {
  title: string;
  description: ReactNode;
  items: T[];
  visible: T[];
  filtered: boolean;
  search: string;
  setSearch: (v: string) => void;
  status: StatusFilter;
  setStatus: (v: StatusFilter) => void;
  newLabel: string;
  onNew: () => void;
  notice: Notice;
  dismissNotice: () => void;
  renderRow: (item: T) => ReactNode;
  emptyText: string;
  extraToolbar?: ReactNode;
}) {
  const searchId = useId();
  const statusId = useId();
  const published = items.filter((i) => i.status === "published").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {items.length} kayıt · {published} yayında · {items.length - published} taslak
          </p>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
        <button type="button" onClick={onNew} className={buttonClass.primary}>
          + {newLabel}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_11rem] lg:grid-cols-[1fr_11rem_auto]" role="search">
        <div>
          <label htmlFor={searchId} className="block text-xs font-semibold text-slate-600">
            Ara
          </label>
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Başlık, adres veya etiket"
            className={`${inputClass} mt-1`}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor={statusId} className="block text-xs font-semibold text-slate-600">
            Yayın durumu
          </label>
          <select
            id={statusId}
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className={`${inputClass} mt-1`}
          >
            <option value="all">Tümü</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
          </select>
        </div>
        {extraToolbar}
      </div>

      <div aria-live="polite">
        {notice && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Banner tone={notice.tone === "success" ? "success" : "error"} live>
                {notice.text}
              </Banner>
            </div>
            <button type="button" onClick={dismissNotice} className={buttonClass.small}>
              Kapat
            </button>
          </div>
        )}
      </div>

      {filtered && (
        <p className="text-xs text-slate-500">
          {visible.length} / {items.length} kayıt gösteriliyor
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {filtered ? "Bu aramaya uyan kayıt yok." : emptyText}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {visible.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-5">
              {renderRow(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RowShell({
  title,
  status,
  badges,
  meta,
  actions,
  lead,
}: {
  title: string;
  status: PublishStatus;
  badges?: ReactNode;
  meta: ReactNode;
  actions: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-1 gap-3">
        {lead}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="break-words text-sm font-semibold text-slate-900">{title || "(Başlıksız)"}</span>
            <StatusPill status={status} />
            {badges}
          </div>
          <div className="mt-1 text-xs leading-relaxed text-slate-500">{meta}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">{actions}</div>
    </div>
  );
}

export function RowActions<T extends Row>({
  item,
  viewHref,
  busy,
  onEdit,
  onStatus,
  onDelete,
}: {
  item: T;
  viewHref?: string;
  busy: boolean;
  onEdit: () => void;
  onStatus: (status: PublishStatus) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <button type="button" className={buttonClass.small} onClick={onEdit} disabled={busy} aria-label={`${item.title} düzenle`}>
        Düzenle
      </button>
      {item.status === "published" ? (
        <>
          {viewHref && (
            <a href={viewHref} target="_blank" rel="noreferrer" className={buttonClass.small} aria-label={`${item.title} sitede görüntüle`}>
              Sitede görüntüle ↗
            </a>
          )}
          <button type="button" className={buttonClass.small} onClick={() => onStatus("draft")} disabled={busy} aria-label={`${item.title} yayından kaldır`}>
            {busy ? "…" : "Yayından kaldır"}
          </button>
        </>
      ) : (
        <button type="button" className={buttonClass.small} onClick={() => onStatus("published")} disabled={busy} aria-label={`${item.title} yayımla`}>
          {busy ? "…" : "Yayımla"}
        </button>
      )}
      <button type="button" className={buttonClass.smallDanger} onClick={onDelete} disabled={busy} aria-label={`${item.title} sil`}>
        Sil
      </button>
    </>
  );
}

export function DeleteConfirm({
  item,
  noun,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  item: Row;
  noun: string;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmDialog
      title={`${noun} silinsin mi?`}
      confirmLabel="Evet, sil"
      busy={busy}
      error={error}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p>
        <strong className="text-slate-900">“{item.title || "Başlıksız"}”</strong> kalıcı olarak silinecek.
        {item.status === "published" && " Bu kayıt şu anda sitede yayında; silinince siteden de kalkar."}
      </p>
      <p className="mt-2">Silmek yerine siteden kaldırmak için “Yayından kaldır”ı kullanın.</p>
    </ConfirmDialog>
  );
}
