"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteSettings } from "@/lib/site";
import type { FieldErrors } from "@/lib/admin/common";
import { saveSettingsAction } from "@/app/internal-admin/(panel)/ayarlar/actions";
import { NETWORK_ERROR } from "@/components/admin/editor";
import { Banner, TextField, buttonClass } from "@/components/admin/ui";

export function SettingsAdminClient({
  initial,
  defaults,
}: {
  initial: SiteSettings;
  defaults: SiteSettings;
}) {
  const [values, setValues] = useState(initial);
  const baseline = useRef(JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const dirty = JSON.stringify(values) !== baseline.current;

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = (key: keyof SiteSettings, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setNotice(null);
    try {
      const r = await saveSettingsAction(values);
      if (r.ok) {
        setValues(r.settings);
        baseline.current = JSON.stringify(r.settings);
        setErrors({});
        setNotice({ tone: "success", text: r.message });
      } else {
        setErrors(r.fieldErrors ?? {});
        setNotice({ tone: "error", text: r.message });
        setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
      }
    } catch {
      setNotice({ tone: "error", text: NETWORK_ERROR });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const isDefault = (key: keyof SiteSettings) => values[key] === defaults[key];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Site ayarları</h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
          Topluluk daveti, sosyal bağlantılar ve iletişim bilgileri. Kaydedince üst menü, topluluk daveti, alt bilgi ve
          İletişim sayfası güncellenir. Boş bırakılamaz: bu öğeler sitede her zaman görünür.
        </p>
      </div>

      <Banner tone="warn">
        Aşağıdaki değerlerin çoğu hâlâ <strong>yer tutucu</strong>. Gerçek adresler girilene kadar sitede yer tutucu bağlantılar çalışır.
        “Varsayılan (yer tutucu)” etiketi, değerin başlangıç değerinde durduğunu gösterir.
      </Banner>

      <form onSubmit={submit} noValidate className="max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <TextField
          label="Topluluğa Katıl formu"
          required
          type="url"
          inputMode="url"
          value={values.communityFormUrl}
          error={errors.communityFormUrl}
          hint={isDefault("communityFormUrl") ? "Varsayılan (yer tutucu) — gerçek form adresiyle değiştirin." : "Üst menüdeki ve topluluk bölümündeki düğmenin adresi."}
          onChange={(e) => set("communityFormUrl", e.target.value)}
        />
        <TextField
          label="Instagram"
          required
          type="url"
          inputMode="url"
          value={values.instagramUrl}
          error={errors.instagramUrl}
          hint={isDefault("instagramUrl") ? "Varsayılan (yer tutucu) — profil adresiyle değiştirin." : undefined}
          onChange={(e) => set("instagramUrl", e.target.value)}
        />
        <TextField
          label="LinkedIn"
          required
          type="url"
          inputMode="url"
          value={values.linkedinUrl}
          error={errors.linkedinUrl}
          hint={isDefault("linkedinUrl") ? "Varsayılan (yer tutucu) — sayfa adresiyle değiştirin." : undefined}
          onChange={(e) => set("linkedinUrl", e.target.value)}
        />
        <TextField
          label="İletişim e-postası"
          required
          type="email"
          inputMode="email"
          value={values.contactEmail}
          error={errors.contactEmail}
          hint={isDefault("contactEmail") ? "Varsayılan (yer tutucu) — gerçek adresle değiştirin." : "Alt bilgide ve İletişim sayfasında bağlantı olarak görünür."}
          onChange={(e) => set("contactEmail", e.target.value)}
        />
        <TextField
          label="Konum"
          required
          maxLength={100}
          value={values.location}
          error={errors.location}
          hint={isDefault("location") ? "Varsayılan (yer tutucu) — doğrulayın." : undefined}
          onChange={(e) => set("location", e.target.value)}
        />

        <div aria-live="polite">
          {notice && (
            <Banner tone={notice.tone} live>
              {notice.text}
            </Banner>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={buttonClass.primary} disabled={saving || !dirty}>
            {saving ? "Kaydediliyor…" : "Ayarları kaydet"}
          </button>
          {dirty && <span className="text-xs font-medium text-amber-700">Kaydedilmemiş değişiklikler var</span>}
        </div>
      </form>
    </div>
  );
}
