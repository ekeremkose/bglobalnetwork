const COMMUNITY_FORMS_URL = "https://forms.gle/PLACEHOLDER";

export function HomeCommunity() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-sm">
        <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
          Yolculuğa birlikte başlayalım.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/45">
          Topluluğumuza katıl, fırsatları takip et ve deneyimlerini paylaş.
        </p>
        <a
          href={COMMUNITY_FORMS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-white/90"
        >
          Topluluğa Katıl
        </a>
      </div>
    </section>
  );
}
