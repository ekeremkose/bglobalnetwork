import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
      <div className="text-sm font-semibold text-brand-700">404</div>
      <h1 className="mt-2 text-2xl font-semibold text-ink">
        Aradığın sayfayı bulamadık
      </h1>
      <p className="mt-3 text-slate-600">
        Link hatalı olabilir veya içerik taşınmış olabilir.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
        >
          Ana sayfaya dön
        </Link>
        <Link
          href="/opportunities"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
        >
          Projelere git
        </Link>
      </div>
    </div>
  );
}

