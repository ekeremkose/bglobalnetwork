import { getSiteSettings } from "@/lib/repositories/settingsRepository";

export async function HomeCommunity() {
  const SITE = await getSiteSettings();
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-brand-900">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:items-end lg:px-8">
        <div className="lg:col-span-7">
          <p className="text-sm text-white/65">B-Global Community</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl">
            Topluluğa katıl.
          </h2>
          <ul className="mt-6 space-y-1 text-lg text-white/80">
            <li>Fırsatları takip et.</li>
            <li>İnsanlarla tanış.</li>
            <li>Deneyimini paylaş.</li>
          </ul>
        </div>
        <div className="lg:col-span-5 lg:pb-1">
          <a
            href={SITE.communityFormUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
          >
            Topluluğa katıl <span aria-hidden>↗</span>
          </a>
          <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px] text-white/75">
            <span>Bizi takip et</span>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              Instagram
            </a>
            <a
              href={SITE.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
