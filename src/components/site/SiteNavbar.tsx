"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const COMMUNITY_FORMS_URL = "https://forms.gle/PLACEHOLDER";

const navItems = [
  { href: "/opportunities", label: "Projeler" },
  { href: "/reels", label: "İçerik" },
  { href: "/duyurular", label: "Blog" },
];

export function SiteNavbar() {
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111132]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          {!logoError ? (
            <Image
              src="/logo.png"
              alt="B-Global Network"
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-soft">
              <span className="text-sm font-bold">B</span>
            </div>
          )}
          <span className="whitespace-nowrap text-lg font-bold text-white">B-Global Network</span>
        </Link>

        <nav className="flex items-center gap-3 overflow-x-auto md:flex">
          {navItems.map((item) => {
            const isActive = item.href !== null && activeHref === item.href;
            if (item.href === null) {
              return (
                <span
                  key={item.label}
                  className="relative px-3 py-2 text-sm font-medium text-white/60 select-none cursor-default"
                >
                  {item.label}
                </span>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative px-3 py-2 text-sm transition",
                  isActive
                    ? "font-semibold text-white"
                    : "rounded-xl font-medium text-white/60 hover:bg-white/5 hover:text-white"
                ].join(" ")}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -bottom-[1px] left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-brand-400"
                  />
                )}
              </Link>
            );
          })}
          <a
            href={COMMUNITY_FORMS_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-2 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white/90"
            aria-label="Topluluğa Katıl (Google Forms)"
          >
            Topluluğa Katıl
          </a>
        </nav>
      </div>
    </header>
  );
}
