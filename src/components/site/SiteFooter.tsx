import Link from "next/link";
import { getSiteSettings } from "@/lib/repositories/settingsRepository";

const linkClass = "transition hover:text-white";

export async function SiteFooter() {
  const SITE = await getSiteSettings();
  const external = [
    { label: "Instagram", href: SITE.instagramUrl },
    { label: "LinkedIn", href: SITE.linkedinUrl },
  ].filter((l): l is { label: string; href: string } => !!l.href);

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">
              B-Global Network
            </div>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-white/50">
              Türkiye&apos;den öğrenciler için uluslararası programlar, son
              tarihler ve başvuru notları.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[15px] text-white/60">
            <Link href="/opportunities" className={linkClass}>
              Projeler
            </Link>
            <Link href="/reels" className={linkClass}>
              İçerik
            </Link>
            <Link href="/duyurular" className={linkClass}>
              Blog
            </Link>
            <Link href="/contact" className={linkClass}>
              İletişim
            </Link>
            {external.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {(SITE.contactEmail || SITE.location) && (
            <div className="text-[15px] text-white/50">
              {SITE.contactEmail && (
                <div>
                  <a
                    href={`mailto:${SITE.contactEmail}`}
                    className="underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white/60"
                  >
                    {SITE.contactEmail}
                  </a>
                </div>
              )}
              {SITE.location && <div className="mt-1">{SITE.location}</div>}
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-[13px] text-white/40">
          © {new Date().getFullYear()} B-Global Network
        </div>
      </div>
    </footer>
  );
}
