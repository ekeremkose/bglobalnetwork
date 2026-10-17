"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ContactPageClient() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="İletişim"
        title="Birlikte çalışalım"
        description="Partnerlik, duyuru paylaşımı veya soru/öneri için bize yaz."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-7">
          <div className="text-sm font-semibold text-ink">İletişim Formu</div>
          <p className="mt-2 text-sm text-slate-600">
            Bu form şu an UI amaçlıdır (mock). Gönderim işlemi yapılmaz.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStatus("sent");
              setTimeout(() => setStatus("idle"), 2500);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Ad Soyad</label>
                <input
                  required
                  placeholder="Örn: Ece Yılmaz"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">E-posta</label>
                <input
                  required
                  type="email"
                  placeholder="ornek@mail.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Konu</label>
              <input
                required
                placeholder="Örn: Partnerlik / Duyuru paylaşımı"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Mesaj</label>
              <textarea
                required
                rows={6}
                placeholder="Kısaca detay ver..."
                className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Mesajı gönder (mock)
              </button>
              <div className="text-sm text-slate-600">
                {status === "sent" ? (
                  <span className="font-semibold text-emerald-700">
                    Mesaj alındı (mock).
                  </span>
                ) : (
                  <span>Genellikle 24–48 saat içinde dönüş yapılır.</span>
                )}
              </div>
            </div>
          </form>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold text-ink">Sosyal Medya</div>
            <p className="mt-2 text-sm text-slate-600">
              Duyuruları kaçırmamak için bizi takip et.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-ink transition hover:bg-slate-100"
              >
                Instagram (placeholder)
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-ink transition hover:bg-slate-100"
              >
                LinkedIn (placeholder)
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold text-ink">İletişim Bilgileri</div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>
                <div className="text-xs font-semibold text-slate-500">E-posta</div>
                <div className="font-semibold text-ink">info@bglobal.network</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Konum</div>
                <div className="font-semibold text-ink">İstanbul, Türkiye</div>
              </div>
              <div className="text-xs text-slate-500">
                (Bilgiler placeholder’dır.)
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

