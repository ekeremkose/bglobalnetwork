import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategories } from "@/lib/repositories/categoryRepository";

const iconMap: Record<string, string> = {
  globe: "🌍",
  graduation: "🎓",
  briefcase: "💼",
  heart: "🤝",
  sparkles: "✨"
};

export function OpportunityCategories() {
  const categories = getCategories();
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Kategoriler"
        title="Ne arıyorsun?"
        description="İlgi alanına göre filtrele ve uygun fırsatları hızlıca bul."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/opportunities?category=${c.slug}`}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:shadow-card"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-xl">
                <span aria-hidden>{c.icon ? iconMap[c.icon] : "📌"}</span>
              </div>
              <div>
                <div className="text-base font-semibold text-ink">{c.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {c.description}
                </p>
                <div className="mt-3 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                  Fırsatları gör →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

