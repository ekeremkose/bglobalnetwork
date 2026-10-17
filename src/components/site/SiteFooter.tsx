import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <div className="text-sm font-semibold text-white">B-Global Network</div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/35">
            Uluslararası fırsatları öğrencilerle buluşturur.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Sayfalar
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-white/45">
              <li>
                <Link href="/opportunities" className="transition hover:text-white">
                  Projeler
                </Link>
              </li>
              <li>
                <Link href="/reels" className="transition hover:text-white">
                  İçerik
                </Link>
              </li>
              <li>
                <Link href="/duyurular" className="transition hover:text-white">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Topluluk
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-white/45">
              <li>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              İletişim
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-white/45">
              <li>info@bglobal.network</li>
              <li>İstanbul</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 lg:col-span-12">
          <div className="text-xs text-white/20">
            © {new Date().getFullYear()} B-Global Network
          </div>
        </div>
      </div>
    </footer>
  );
}
