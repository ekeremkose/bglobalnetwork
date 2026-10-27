"use client";

import { useEffect, useState } from "react";
import type { Reel } from "@/lib/types/content";
import { ReelTile } from "@/components/reels/ReelTile";
import { checkCover } from "@/lib/utils/validate";
import { Banner } from "@/components/admin/ui";

type Probe = "idle" | "loading" | "ok" | "broken";

/**
 * Shows the cover the way the site shows a Reel (portrait tile). The image is
 * probed in the browser first so a missing file or dead link is reported here
 * instead of leaving a silently broken tile; until it loads, the site's
 * placeholder cover is drawn.
 */
export function CoverPreview({
  reel,
  cover,
  large = false,
}: {
  reel: Reel;
  cover: string;
  large?: boolean;
}) {
  const check = checkCover(cover);
  const src = check.ok && check.kind !== "none" ? cover.trim() : "";
  const [probe, setProbe] = useState<Probe>("idle");

  useEffect(() => {
    if (!src) {
      setProbe("idle");
      return;
    }
    setProbe("loading");
    let live = true;
    const img = new window.Image();
    img.onload = () => live && setProbe("ok");
    img.onerror = () => live && setProbe("broken");
    img.src = src;
    return () => {
      live = false;
      img.onload = img.onerror = null;
    };
  }, [src]);

  const shown: Reel = { ...reel, thumbnail: probe === "ok" ? src : undefined };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className={`${large ? "w-52" : "w-40"} shrink-0 self-center sm:self-start`} data-testid="cover-preview" data-probe={probe}>
        <div className="pointer-events-none select-none" aria-hidden>
          <ReelTile reel={shown} size={large ? "lead" : "sm"} surface="light" sizes="208px" showDescription={large} />
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2 text-sm">
        {!check.ok ? (
          <Banner tone="error">{check.message}</Banner>
        ) : !src ? (
          <Banner tone="info">
            Kapak yok: sitede yer tutucu kapak (logo çizimi ve başlık) görünür. Gerçek kapak eklenince bu otomatik değişir.
          </Banner>
        ) : probe === "loading" ? (
          <Banner tone="info">Görsel kontrol ediliyor…</Banner>
        ) : probe === "broken" ? (
          <Banner tone="warn">
            Görsel yüklenemedi: dosya bulunamıyor ya da adres hatalı. Sitede yer tutucu kapak görünür.
          </Banner>
        ) : (
          <Banner tone="success">Görsel yüklendi. Sitede bu dikey (9:16) kırpmayla görünür.</Banner>
        )}
        <p className="text-xs leading-relaxed text-slate-500">
          Kapak için bir görsel yükleyin (kalıcı depolamaya kaydedilir) ya da{" "}
          <code className="rounded bg-slate-100 px-1">/reels/ornek.jpg</code> gibi bir yol veya izinli bir sunucudan https
          bağlantısı yazın.
        </p>
      </div>
    </div>
  );
}
