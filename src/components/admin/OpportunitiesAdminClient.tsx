"use client";

import { useMemo, useState } from "react";
import type { Opportunity } from "@/lib/types/content";
import { createOpportunity, saveOpportunity, deleteOpportunity } from "@/app/admin/opportunities/actions";
import { OpportunityFormModal } from "@/components/admin/OpportunityFormModal";
import { getCategories } from "@/lib/repositories/categoryRepository";
import { getCountries } from "@/lib/repositories/countryRepository";

type Props = {
  initialItems: Opportunity[];
};

export function OpportunitiesAdminClient({ initialItems }: Props) {
  const [items, setItems] = useState<Opportunity[]>(initialItems);
  const [editingItem, setEditingItem] = useState<Opportunity | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => getCategories().map((c) => ({ value: c.slug, label: c.title })),
    []
  );
  const countryOptions = useMemo(
    () => getCountries().map((c) => ({ value: c.code, label: c.name })),
    []
  );

  async function handleSave(data: Opportunity) {
    if (editingItem) {
      await saveOpportunity(data);
      setItems((prev) => prev.map((o) => (o.id === data.id ? data : o)));
    } else {
      await createOpportunity(data);
      setItems((prev) => [data, ...prev]);
    }
    setEditingItem(null);
    setIsCreating(false);
  }

  async function handleDelete(id: string) {
    await deleteOpportunity(id);
    setItems((prev) => prev.filter((o) => o.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Projeler
          </h1>
          <p className="mt-1 text-sm text-slate-600">{items.length} fırsat</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + Yeni Fırsat
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold text-slate-600">Başlık</th>
              <th className="hidden px-4 py-3 font-semibold text-slate-600 sm:table-cell">Ülke</th>
              <th className="hidden px-4 py-3 font-semibold text-slate-600 md:table-cell">Son tarih</th>
              <th className="hidden px-4 py-3 font-semibold text-slate-600 lg:table-cell">Öne çıkan</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900 line-clamp-1">{item.title}</span>
                  <span className="block text-xs text-slate-400">{item.category}</span>
                </td>
                <td className="hidden px-4 py-3 text-slate-700 sm:table-cell">{item.country}</td>
                <td className="hidden px-4 py-3 text-slate-700 md:table-cell">{item.deadline}</td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  {item.featured ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      Evet
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Düzenle
                    </button>
                    {deletingId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Evet, sil
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(item.id)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-500">Henüz fırsat yok.</p>
        )}
      </div>

      <OpportunityFormModal
        item={editingItem}
        open={isCreating || editingItem !== null}
        onClose={() => { setIsCreating(false); setEditingItem(null); }}
        onSave={handleSave}
        categoryOptions={categoryOptions}
        countryOptions={countryOptions}
      />
    </div>
  );
}
