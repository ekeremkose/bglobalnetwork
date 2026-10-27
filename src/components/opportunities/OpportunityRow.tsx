import Link from "next/link";
import type { Opportunity } from "@/lib/types/content";
import {
  deadlineLabel,
  formatDayMonth,
  getDeadlineStatus,
} from "@/lib/utils/date";
import { getCategoryBySlug } from "@/lib/repositories/categoryRepository";
import { getCountryByCode } from "@/lib/repositories/countryRepository";

/**
 * Compact layout (country · category under the title) stays until the row is
 * wide enough for four columns. The table variant has the full content width,
 * so it switches at lg; the calendar variant sits beside the month column and
 * only has that room from xl.
 */
const GRID = {
  table:
    "grid grid-cols-[5rem_1fr] gap-x-5 lg:grid-cols-[8.5rem_1fr_7.5rem_9.5rem] lg:gap-x-8",
  calendar:
    "grid grid-cols-[5rem_1fr] gap-x-5 xl:grid-cols-[5rem_1fr_7rem_9rem] xl:gap-x-8",
};

export function OpportunityTableHead() {
  return (
    <div
      className={`${GRID.table} hidden border-b border-white/10 pb-3 text-[13px] text-white/45 lg:grid`}
      aria-hidden
    >
      <span>Son tarih</span>
      <span>Program</span>
      <span>Ülke</span>
      <span>Kategori</span>
    </div>
  );
}

export function OpportunityRow({
  opportunity: o,
  now,
  variant = "table",
}: {
  opportunity: Opportunity;
  now?: Date;
  /** "calendar" is used inside a month group: serif day numeral, no own rule. */
  variant?: "table" | "calendar";
}) {
  const calendar = variant === "calendar";
  const wide = calendar ? "xl:block" : "lg:block";
  const country = getCountryByCode(o.country);
  const category = getCategoryBySlug(o.category);
  const status = getDeadlineStatus(o.deadline, now);
  const closed = status === "closed";
  const soon = status === "soon";

  return (
    <Link
      href={`/opportunities/${o.slug}`}
      className={`${GRID[variant]} group items-baseline py-5 ${calendar ? "" : "border-b border-white/10"}`}
    >
      <span className="block">
        <span
          className={[
            calendar
              ? "block font-serif text-5xl leading-[0.9]"
              : "block text-lg font-semibold tabular-nums leading-tight",
            closed ? "text-white/45" : soon ? "text-amber-400" : "text-white",
          ].join(" ")}
        >
          {calendar
            ? new Date(o.deadline).getUTCDate()
            : formatDayMonth(o.deadline)}
        </span>
        <span
          className={[
            calendar ? "mt-2 block text-[13px] leading-tight" : "mt-1 block text-[13px] leading-tight",
            closed
              ? "text-white/40"
              : soon
                ? "text-amber-400/90"
                : "text-white/55",
          ].join(" ")}
        >
          {deadlineLabel(o.deadline, now)}
        </span>
      </span>

      <span className="min-w-0">
        <span
          className={[
            "block text-pretty text-lg font-medium leading-snug underline decoration-white/0 decoration-1 underline-offset-4 transition group-hover:decoration-white/40 sm:text-xl",
            closed ? "text-white/60" : "text-white",
          ].join(" ")}
        >
          {o.title}
        </span>
        <span
          className={`mt-1.5 block text-sm text-white/50 ${calendar ? "xl:hidden" : "lg:hidden"}`}
        >
          {[country?.name, category?.title].filter(Boolean).join(" · ")}
        </span>
      </span>

      <span className={`hidden text-[15px] text-white/60 ${wide}`}>
        {country?.name}
      </span>
      <span className={`hidden text-[15px] text-white/60 ${wide}`}>
        {category?.title}
      </span>
    </Link>
  );
}
