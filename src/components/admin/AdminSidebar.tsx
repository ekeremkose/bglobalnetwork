"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { path: "/opportunities", label: "Projeler" },
  { path: "/reels", label: "İçerik (Reels)" },
  { path: "/duyurular", label: "Blog" },
  { path: "/ayarlar", label: "Site ayarları" },
];

/** Left column from md up; a horizontally scrollable bar at the top on phones. */
export function AdminSidebar({
  base,
  email,
  signOut,
}: {
  base: string;
  email: string;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="shrink-0 border-b border-slate-200 bg-white md:w-56 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:border-b md:border-slate-200 md:px-5 md:py-4">
        <span className="text-sm font-bold tracking-tight text-slate-900">B-Global Admin</span>
        <Link
          href="/"
          target="_blank"
          className="text-xs font-semibold text-brand-700 underline underline-offset-2 md:mt-1 md:block"
        >
          Siteyi aç ↗
        </Link>
      </div>
      <nav aria-label="Yönetim" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:p-3">
        {links.map((item) => {
          const link = { ...item, href: base + item.path };
          const active = pathname === link.href || (pathname?.startsWith(link.href + "/") ?? false);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-2 md:block md:p-3">
        <p className="truncate px-1 text-xs text-slate-500" title={email}>
          {email}
        </p>
        <button type="submit" className="mt-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
          Çıkış yap
        </button>
      </form>
    </aside>
  );
}
