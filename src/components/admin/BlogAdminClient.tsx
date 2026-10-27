"use client";

import type { Announcement } from "@/lib/types/content";
import { deletePostAction, setPostStatusAction } from "@/app/internal-admin/(panel)/duyurular/actions";
import { BlogEditor } from "@/components/admin/BlogEditor";
import {
  DeleteConfirm,
  ListShell,
  RowActions,
  RowShell,
  useAdminList,
  useListFilter,
} from "@/components/admin/list";
import { formatDateShortTr } from "@/lib/utils/date";

const api = { setStatus: setPostStatusAction, remove: deletePostAction };

const stamp = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(iso))
    : null;

export function BlogAdminClient({ initialItems }: { initialItems: Announcement[] }) {
  const list = useAdminList(initialItems, api);
  const filter = useListFilter(list.items, (p) => [p.title, p.slug, p.content].join(" "));

  return (
    <>
      <ListShell
        title="Blog"
        description="Sitedeki Blog yazıları. Yalnızca “Yayında” olanlar Blog sayfasında, anasayfada ve kendi adreslerinde görünür; taslakların adresi açılmaz."
        items={list.items}
        visible={filter.visible}
        filtered={filter.filtered}
        search={filter.search}
        setSearch={filter.setSearch}
        status={filter.status}
        setStatus={filter.setStatus}
        newLabel="Yeni yazı"
        onNew={() => list.setEditing("new")}
        notice={list.notice}
        dismissNotice={() => list.setNotice(null)}
        emptyText="Henüz yazı yok."
        renderRow={(p) => (
          <RowShell
            title={p.title}
            status={p.status}
            meta={
              <>
                Yayın tarihi {p.publishedAt ? formatDateShortTr(p.publishedAt) : "—"}
                {stamp(p.updatedAt) && ` · Güncellendi ${stamp(p.updatedAt)}`}
                <span className="block font-mono text-[11px] text-slate-400">/duyurular/{p.slug || "—"}</span>
              </>
            }
            actions={
              <RowActions
                item={p}
                viewHref={`/duyurular/${p.slug}`}
                busy={list.busyId === p.id}
                onEdit={() => list.setEditing(p)}
                onStatus={(s) => list.changeStatus(p, s)}
                onDelete={() => list.setDeleting(p)}
              />
            }
          />
        )}
      />

      {list.editing && (
        <BlogEditor
          key={list.editing === "new" ? "new" : list.editing.id}
          item={list.editing === "new" ? null : list.editing}
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
          noun="Yazı"
          busy={list.deleteBusy}
          error={list.deleteError}
          onConfirm={list.confirmDelete}
          onCancel={() => list.setDeleting(null)}
        />
      )}
    </>
  );
}
