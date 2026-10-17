"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/review", label: "Projeleri İncele" },
  { href: "/admin/opportunities", label: "Projeler" },
  { href: "/admin/reels", label: "İçerik" },
  { href: "/admin/duyurular", label: "Blog" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <span className="text-sm font-bold tracking-tight text-slate-900">
          B-Global Admin
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href || (pathname?.startsWith(link.href + "/") ?? false);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
