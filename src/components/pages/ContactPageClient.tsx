"use client";

import { useState } from "react";
import { PageIntro, fieldClass, labelClass } from "@/components/ui/PageIntro";
import type { SiteSettings } from "@/lib/site";

export function ContactPageClient({ site: SITE }: { site: SiteSettings }) {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const channels = [
    { label: "Instagram", href: SITE.instagramUrl },
    { label: "LinkedIn", href: SITE.linkedinUrl },
  ].filter((c): c is { label: string; href: string } => !!c.href);

  return (
    <div className="pb-24">
      <PageIntro
        title="İletişim"
        description="Partnerlik, duyuru paylaşımı veya soru ve öneriler için yaz."
      />

      <div className="grid gap-12 border-t border-white/10 pt-10 lg:grid-cols-12">
        <form
          className="space-y-5 lg:col-span-7"
          onSubmit={(e) => {
            e.preventDefault();
            setStatus("sent");
            setTimeout(() => setStatus("idle"), 2500);
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-name" className={labelClass}>
                Ad Soyad
              </label>
              <input id="c-name" required className={fieldClass} />
            </div>
            <div>
              <label htmlFor="c-mail" className={labelClass}>
                E-posta
              </label>
              <input id="c-mail" required type="email" className={fieldClass} />
            </div>
          </div>
          <div>
            <label htmlFor="c-sub" className={labelClass}>
              Konu
            </label>
            <input id="c-sub" required className={fieldClass} />
          </div>
          <div>
            <label htmlFor="c-msg" className={labelClass}>
              Mesaj
            </label>
            <textarea
              id="c-msg"
              required
              rows={6}
              className={`${fieldClass} resize-none`}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
            >
              Gönder
            </button>
            <p className="text-[13px] text-white/45">
              {status === "sent"
                ? "Mesaj alındı (demo)."
                : "Bu form henüz mesaj iletmiyor; bağlantısı yapılacak."}
            </p>
          </div>
        </form>

        {(channels.length > 0 || SITE.contactEmail || SITE.location) && (
          <aside className="space-y-6 lg:col-span-4 lg:col-start-9">
            {SITE.contactEmail && (
              <div>
                <div className="text-[13px] text-white/45">E-posta</div>
                <a
                  href={`mailto:${SITE.contactEmail}`}
                  className="mt-1 block text-lg text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                >
                  {SITE.contactEmail}
                </a>
              </div>
            )}
            {SITE.location && (
              <div>
                <div className="text-[13px] text-white/45">Konum</div>
                <div className="mt-1 text-lg text-white">{SITE.location}</div>
              </div>
            )}
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="block text-lg text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                {c.label} ↗
              </a>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
