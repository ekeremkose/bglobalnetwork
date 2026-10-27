"use client";

import type { Reel } from "@/lib/types/content";
import { deleteReelAction, setReelStatusAction } from "@/app/internal-admin/(panel)/reels/actions";
import { ReelEditor } from "@/components/admin/ReelEditor";
import {
  DeleteConfirm,
  ListShell,
  RowActions,
  RowShell,
  useAdminList,
  useListFilter,
} from "@/components/admin/list";
import { Pill } from "@/components/admin/ui";
import { formatDateShortTr } from "@/lib/utils/date";
import { pickLeadReel } from "@/lib/utils/reels";

const api = { setStatus: setReelStatusAction, remove: deleteReelAction };

const stamp = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(iso))
    : null;

export function ReelsAdminClient({ initialItems }: { initialItems: Reel[] }) {
  const list = useAdminList(initialItems, api);
  const filter = useListFilter(list.items, (r) => [r.title, r.slug, r.tag].join(" "));
  const leadId = pickLeadReel(list.items.filter((r) => r.status === "published"))?.id;

  return (
    <>
      <ListShell
        title="İçerik (Reels)"
        description="Instagram’da yayınladığımız Reels’in sitedeki vitrini. Yalnızca “Yayında” olanlar anasayfada ve İçerik sayfasında görünür. Kapaklar elle girilir; boşsa yer tutucu görünür."
        items={list.items}
        visible={filter.visible}
        filtered={filter.filtered}
        search={filter.search}
        setSearch={filter.setSearch}
        status={filter.status}
        setStatus={filter.setStatus}
        newLabel="Yeni içerik"
        onNew={() => list.setEditing("new")}
        notice={list.notice}
        dismissNotice={() => list.setNotice(null)}
        emptyText="Henüz içerik yok."
        renderRow={(r) => (
          <RowShell
            title={r.title}
            status={r.status}
            badges={
              <>
                {r.id === leadId && <Pill tone="brand">Anasayfa ana kapağı</Pill>}
                {r.featured && <Pill tone="amber">Öne çıkarıldı</Pill>}
                {!r.thumbnail && <Pill tone="slate">Yer tutucu kapak</Pill>}
              </>
            }
            meta={
              <>
                {r.tag || "Etiket yok"} · Yayın tarihi {r.publishedAt ? formatDateShortTr(r.publishedAt) : "—"}
                {stamp(r.updatedAt) && ` · Güncellendi ${stamp(r.updatedAt)}`}
              </>
            }
            actions={
              <RowActions
                item={r}
                viewHref="/reels"
                busy={list.busyId === r.id}
                onEdit={() => list.setEditing(r)}
                onStatus={(s) => list.changeStatus(r, s)}
                onDelete={() => list.setDeleting(r)}
              />
            }
          />
        )}
      />

      {list.editing && (
        <ReelEditor
          key={list.editing === "new" ? "new" : list.editing.id}
          item={list.editing === "new" ? null : list.editing}
          all={list.items}
          onClose={() => list.setEditing(null)}
          onItems={list.setItems}
          onSaved={(items, message) => {
            list.setItems(items);
            list.setNotice({ tone: "success", text: message });
            list.setEditing(null);
          }}
        />
      )}
      {list.deleting && (
        <DeleteConfirm
          item={list.deleting}
          noun="İçerik"
          busy={list.deleteBusy}
          error={list.deleteError}
          onConfirm={list.confirmDelete}
          onCancel={() => list.setDeleting(null)}
        />
      )}
    </>
  );
}
