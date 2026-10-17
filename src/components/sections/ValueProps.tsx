import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ValueProps() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
      <SectionHeading
        eyebrow="Neden takip etmeli?"
        title="Fırsatları kaçırma, daha stratejik ilerle"
        description="B-Global Network, öğrenci odaklı bir akış sunar: doğru filtreler, net özetler ve resmi linkler."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="text-sm font-semibold text-ink">Zaman kazandırır</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Aynı anda birçok kaynağı taramak yerine tek merkezden fırsatları
            incele, hızlı karar ver.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="text-sm font-semibold text-ink">Daha temiz filtre</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Kategori, ülke ve son tarihe göre daralt; “uygun mu?” sorusunu hızlı
            yanıtla.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="text-sm font-semibold text-ink">Topluluk etkisi</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Deneyim paylaşımları ve kısa duyurularla motivasyonunu canlı tut.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          Partner olmak veya ilan paylaşmak ister misin?
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          İletişime geç
        </Link>
      </div>
    </section>
  );
}

