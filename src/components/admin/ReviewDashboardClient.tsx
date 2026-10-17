"use client";

import { useMemo, useState } from "react";
import type { FoundOpportunityCandidate, PublishDraft } from "@/lib/types/foundOpportunity";
import type { Opportunity } from "@/lib/types/content";
import { publishOpportunity, updateCandidateStatus } from "@/app/admin/review/actions";
import {
  countByStatus,
  createOpportunityFromCandidate,
  filterFoundOpportunities,
  type ReviewFilters
} from "@/lib/utils/foundOpportunityReview";
import { FilterBar } from "@/components/admin/FilterBar";
import { ReviewCard } from "@/components/admin/ReviewCard";
import { ReviewSummaryStats } from "@/components/admin/ReviewSummaryStats";
import { EditReviewModal } from "@/components/admin/EditReviewModal";
import { PublishModal } from "@/components/admin/PublishModal";
import { getCategories } from "@/lib/repositories/categoryRepository";
import { getCountries } from "@/lib/repositories/countryRepository";

type Props = {
  initialItems: FoundOpportunityCandidate[];
};

export function ReviewDashboardClient({ initialItems }: Props) {
  const [items, setItems] = useState<FoundOpportunityCandidate[]>(initialItems);
  const [filters, setFilters] = useState<ReviewFilters>({
    search: "",
    status: "all",
    category: "",
    country: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishedOpportunities, setPublishedOpportunities] = useState<Opportunity[]>([]);

  const categoryOptions = useMemo(
    () =>
      getCategories().map((c) => ({
        value: c.slug,
        label: c.title
      })),
    []
  );

  const countryOptions = useMemo(
    () =>
      getCountries().map((c) => ({
        value: c.code,
        label: c.name
      })),
    []
  );

  const filtered = useMemo(
    () => filterFoundOpportunities(items, filters),
    [items, filters]
  );

  const counts = useMemo(() => countByStatus(items), [items]);

  const editingItem = useMemo(
    () => items.find((i) => i.id === editingId) ?? null,
    [items, editingId]
  );

  const publishingItem = useMemo(
    () => items.find((i) => i.id === publishingId) ?? null,
    [items, publishingId]
  );

  async function setStatus(id: string, status: FoundOpportunityCandidate["status"]) {
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status } : row))
    );
    await updateCandidateStatus(id, status);
  }

  function saveEdit(updated: FoundOpportunityCandidate) {
    setItems((prev) =>
      prev.map((row) => (row.id === updated.id ? updated : row))
    );
    setEditingId(null);
  }

  async function handlePublish(candidate: FoundOpportunityCandidate, draft: PublishDraft) {
    const opportunity = createOpportunityFromCandidate(candidate, draft);
    await publishOpportunity(opportunity, candidate.id);
    setPublishedOpportunities((prev) => [...prev, opportunity]);
    setItems((prev) =>
      prev.map((row) => (row.id === candidate.id ? { ...row, status: "approved" } : row))
    );
    setPublishingId(null);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Review Opportunities
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          AI tarafından bulunan fırsatları incele ve yayınlamadan önce onayla
        </p>
      </header>

      <ReviewSummaryStats
        pending={counts.pending}
        approved={counts.approved}
        rejected={counts.rejected}
      />

      <FilterBar
        search={filters.search}
        onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
        status={filters.status}
        onStatusChange={(status) => setFilters((f) => ({ ...f, status }))}
        category={filters.category}
        onCategoryChange={(category) => setFilters((f) => ({ ...f, category }))}
        country={filters.country}
        onCountryChange={(country) => setFilters((f) => ({ ...f, country }))}
        categoryOptions={categoryOptions}
        countryOptions={countryOptions}
      />

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-700">İnceleme listesi</h2>
          <span className="text-sm text-slate-500">
            {filtered.length} kayıt
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => (
            <ReviewCard
              key={item.id}
              item={item}
              onEdit={() => setEditingId(item.id)}
              onOpenPublish={() => setPublishingId(item.id)}
              onSetStatus={setStatus}
            />
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
            Filtrelere uygun kayıt yok.
          </p>
        ) : null}
      </div>

      <EditReviewModal
        item={editingItem}
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        onSave={saveEdit}
        categoryOptions={categoryOptions}
        countryOptions={countryOptions}
      />

      <PublishModal
        item={publishingItem}
        open={publishingId !== null}
        onClose={() => setPublishingId(null)}
        onPublish={handlePublish}
      />
    </div>
  );
}
