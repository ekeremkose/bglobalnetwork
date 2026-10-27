"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const navItems = [
  { href: "/opportunities", label: "Projeler" },
  { href: "/reels", label: "İçerik" },
  { href: "/duyurular", label: "Blog" },
];

export function SiteNavbar({ communityFormUrl }: { communityFormUrl: string }) {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  const activeHref = useMemo(() => {
    if (!pathname) return "/";
    if (pathname.startsWith("/opportunities")) return "/opportunities";
    if (pathname.startsWith("/reels")) return "/reels";
    if (pathname.startsWith("/duyurular")) return "/duyurular";
    return "/";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-bg-nav/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-3.5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {!logoError ? (
            <Image
              src="/logo.png"
              alt="B-Global Network"
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 rounded-lg object-contain sm:h-10 sm:w-10"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg sm:h-10 sm:w-10 bg-brand-700 text-white">
              <span className="text-xs font-bold">B</span>
            </div>
          )}
          <span className="hidden whitespace-nowrap text-lg sm:inline font-semibold tracking-tight text-white">
            B-Global Network
          </span>
        </Link>

        <nav className="flex min-w-0 items-center gap-3 min-[400px]:gap-4 sm:gap-8">
          {navItems.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative py-1 text-[13px] transition min-[400px]:text-sm sm:text-base",
                  isActive
                    ? "font-semibold text-white"
                    : "font-medium text-white/55 hover:text-white"
                ].join(" ")}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 left-0 h-px w-full bg-brand-300"
                  />
                )}
              </Link>
            );
          })}
            <a
              href={communityFormUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-white px-2.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-white/90 sm:px-4 sm:py-2 sm:text-sm"
              aria-label="Topluluğa Katıl (Google Forms)"
            >
              <span className="min-[360px]:hidden" aria-hidden>
                Katıl
              </span>
              <span className="hidden min-[360px]:inline">Topluluğa Katıl</span>
            </a>
        </nav>
      </div>
    </header>
  );
}
