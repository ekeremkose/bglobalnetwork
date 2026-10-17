import Link from "next/link";

export function PrimaryCTA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="max-w-lg text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
          Bir fırsat seç,<br />
          başvuru planını<br />
          bugün oluştur.
        </h2>

        <div className="flex flex-col gap-4 lg:items-end">
          <Link
            href="/opportunities"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-white transition"
          >
            Fırsatları aç
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/reels"
            className="text-sm text-white/35 transition hover:text-white/65"
          >
            Reels & Duyurular
          </Link>
        </div>
      </div>
    </section>
  );
}
