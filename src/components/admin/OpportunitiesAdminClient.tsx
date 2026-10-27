"use client";

import { useMemo } from "react";
import type { Opportunity, Reel } from "@/lib/types/content";
import {
  deleteOpportunityAction,
  setOpportunityStatusAction,
} from "@/app/internal-admin/(panel)/opportunities/actions";
import { OpportunityEditor } from "@/components/admin/OpportunityEditor";
import {
  DeleteConfirm,
  ListShell,
  RowActions,
  RowShell,
  useAdminList,
  useListFilter,
} from "@/components/admin/list";
import { Pill } from "@/components/admin/ui";
import { getCategoryBySlug } from "@/lib/repositories/categoryRepository";
import { getCountryByCode } from "@/lib/repositories/countryRepository";
import { formatDateShortTr, getDeadlineStatus } from "@/lib/utils/date";

const api = {
  setStatus: setOpportunityStatusAction,
  remove: deleteOpportunityAction,
};

const stamp = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(iso))
    : null;

function DeadlinePill({ deadline }: { deadline: string }) {
  if (!deadline) return <Pill tone="slate">Son tarih yok</Pill>;
  const s = getDeadlineStatus(deadline);
  if (s === "closed") return <Pill tone="red">Süresi doldu</Pill>;
  if (s === "soon") return <Pill tone="amber">Son günler</Pill>;
  return <Pill tone="brand">Başvuruya açık</Pill>;
}

export function OpportunitiesAdminClient({
  initialItems,
  reels,
}: {
  initialItems: Opportunity[];
  reels: Reel[];
}) {
  const list = useAdminList(initialItems, api);
  const filter = useListFilter(list.items, (o) =>
    [o.title, o.slug, getCountryByCode(o.country)?.name, getCategoryBySlug(o.category)?.title].join(" ")
  );
  const reelOptions = useMemo(() => reels.map((r) => ({ id: r.id, title: r.title, status: r.status })), [reels]);

  return (
    <>
      <ListShell
        title="Projeler"
        description="Sitedeki fırsatlar. Yeni kayıtlar taslak başlar; yalnızca “Yayında” olanlar sitede, sayımlarda ve takvimde görünür. “Süresi doldu” başvuru durumudur, yayın durumu değildir."
        items={list.items}
        visible={filter.visible}
        filtered={filter.filtered}
        search={filter.search}
        setSearch={filter.setSearch}
        status={filter.status}
        setStatus={filter.setStatus}
        newLabel="Yeni proje"
        onNew={() => list.setEditing("new")}
        notice={list.notice}
        dismissNotice={() => list.setNotice(null)}
        emptyText="Henüz proje yok."
        renderRow={(o) => (
          <RowShell
            title={o.title}
            status={o.status}
            badges={<DeadlinePill deadline={o.deadline} />}
            meta={
              <>
                {[getCountryByCode(o.country)?.name, getCategoryBySlug(o.category)?.title].filter(Boolean).join(" · ") || "Ülke/kategori seçilmedi"}
                {" · "}
                {o.deadline ? `Son tarih ${formatDateShortTr(o.deadline)}` : "Son tarih girilmedi"}
                {stamp(o.updatedAt) && ` · Güncellendi ${stamp(o.updatedAt)}`}
                <span className="block font-mono text-[11px] text-slate-400">/opportunities/{o.slug || "—"}</span>
              </>
            }
            actions={
              <RowActions
                item={o}
                viewHref={`/opportunities/${o.slug}`}
                busy={list.busyId === o.id}
                onEdit={() => list.setEditing(o)}
                onStatus={(s) => list.changeStatus(o, s)}
                onDelete={() => list.setDeleting(o)}
              />
            }
          />
        )}
      />

      {list.editing && (
        <OpportunityEditor
          key={list.editing === "new" ? "new" : list.editing.id}
          item={list.editing === "new" ? null : list.editing}
          reels={reelOptions}
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
          noun="Proje"
          busy={list.deleteBusy}
          error={list.deleteError}
          onConfirm={list.confirmDelete}
          onCancel={() => list.setDeleting(null)}
        />
      )}
    </>
  );
}
