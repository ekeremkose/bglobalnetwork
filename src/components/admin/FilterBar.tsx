"use client";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: "all" | "pending" | "approved" | "rejected";
  onStatusChange: (v: Props["status"]) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  country: string;
  onCountryChange: (v: string) => void;
  categoryOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
};

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-200";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-200";

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  country,
  onCountryChange,
  categoryOptions,
  countryOptions
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-xs font-semibold text-slate-600">Ara</label>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Başlık veya kaynak..."
            className={`${inputClass} mt-1`}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Durum</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as Props["status"])}
            className={`${selectClass} mt-1`}
          >
            <option value="all">Tümü</option>
            <option value="pending">Beklemede</option>
            <option value="approved">Onaylandı</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Kategori</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`${selectClass} mt-1`}
          >
            <option value="">Tümü</option>
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Ülke</label>
          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className={`${selectClass} mt-1`}
          >
            <option value="">Tümü</option>
            {countryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
