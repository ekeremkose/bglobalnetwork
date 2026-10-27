import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <p className="text-sm text-white/45">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#f4f5fa] sm:text-5xl">
        Aradığın sayfayı bulamadık.
      </h1>
      <p className="mt-4 max-w-md text-lg text-white/60">
        Link hatalı olabilir veya içerik taşınmış olabilir.
      </p>
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
        <Link
          href="/"
          className="font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
        >
          Ana sayfa
        </Link>
        <Link
          href="/opportunities"
          className="font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
        >
          Açık programlar
        </Link>
      </div>
    </div>
  );
}
