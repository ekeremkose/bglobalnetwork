import Image from "next/image";
import type { Reel } from "@/lib/types/content";
import { checkCover } from "@/lib/utils/validate";

// Placeholder artwork: crops of the B-Global logo, so each cover reads as one
// frame of the same series. Replaced by the reel's real `thumbnail` when set.
const PLACEHOLDER_CROPS = [
  { pos: "50% 0%", scale: 1.4, origin: "50% 0%" },
  { pos: "20% 0%", scale: 1.6, origin: "50% 0%" },
  { pos: "80% 0%", scale: 1.6, origin: "50% 0%" },
  { pos: "50% 0%", scale: 2, origin: "75% 10%" },
];

/**
 * A Reel as it appears on the site: a portrait (9:16) cover plus a short caption.
 * The whole tile opens the Reel on Instagram; there is no inline player.
 *
 * COVERS ARE PLACEHOLDERS until real ones exist. With no `thumbnail`, a
 * logo-based cover with the video title is drawn. To use a real cover,
 * drop the image in `public/reels/` and set the reel's `thumbnail` to
 * "/reels/<name>.jpg" (any host used in `thumbnail` must also be allowed in
 * next.config.js `images.remotePatterns`). The tile then shows the image and
 * moves the title below it.
 */
export function ReelTile({
  reel,
  variant = 0,
  surface = "dark",
  size = "sm",
  sizes = "(max-width: 1024px) 60vw, 25vw",
  showDescription = false,
}: {
  reel: Reel;
  /** Picks which crop of the placeholder artwork is used. */
  variant?: number;
  surface?: "dark" | "light";
  size?: "lead" | "sm";
  sizes?: string;
  showDescription?: boolean;
}) {
  // An unsupported cover (e.g. a host next/image is not configured for) falls back to the placeholder instead of crashing the page.
  const hasCover = !!reel.thumbnail && (checkCover(reel.thumbnail).ok ?? false);
  const light = surface === "light";
  const lead = size === "lead";
  const crop = PLACEHOLDER_CROPS[variant % PLACEHOLDER_CROPS.length];

  return (
    <a
      href={reel.instagramUrl}
      target="_blank"
      rel="noreferrer"
      className="group block"
    >
      <div
        className={`relative aspect-[9/16] w-full overflow-hidden ${hasCover ? "bg-bg-surface" : "bg-[#0e07f5]"}`}
      >
        {hasCover ? (
          <Image
            src={reel.thumbnail!}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <>
            <Image
              src="/logo.png"
              alt=""
              fill
              sizes={sizes}
              className="object-cover"
              style={{
                objectPosition: crop.pos,
                transform: `scale(${crop.scale})`,
                transformOrigin: crop.origin,
              }}
            />
            <div className="absolute inset-x-0 top-0 flex items-baseline justify-between gap-3 p-4 text-[13px] font-medium text-white sm:p-5">
              <span>{reel.tag}</span>
              <span>Reel</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-ink p-4 text-white sm:p-5">
              <h3
                className={[
                  "text-balance underline decoration-white/0 decoration-1 underline-offset-4 transition group-hover:decoration-white/60",
                  lead
                    ? "font-serif text-3xl leading-[1.05] sm:text-[2.2rem]"
                    : "text-base font-semibold leading-[1.15] tracking-[-0.01em] sm:text-[1.15rem]",
                ].join(" ")}
              >
                {reel.title}
              </h3>
            </div>
          </>
        )}
      </div>

      <div className="mt-3">
        {hasCover && (
          <h3
            className={`text-pretty font-semibold leading-snug underline decoration-current/0 underline-offset-4 transition group-hover:decoration-current/40 ${lead ? "text-2xl" : "text-lg"} ${light ? "text-ink" : "text-white"}`}
          >
            {reel.title}
          </h3>
        )}
        {showDescription && (
          <p
            className={`${hasCover ? "mt-1.5" : ""} max-w-xs text-[15px] leading-relaxed ${light ? "text-ink-soft" : "text-white/60"}`}
          >
            {reel.shortDescription}
          </p>
        )}
        <p
          className={`mt-2 text-sm font-medium ${light ? "text-ink" : "text-white/80"}`}
        >
          <span className="underline decoration-current/30 underline-offset-4 group-hover:decoration-current">
            Instagram&apos;da izle
          </span>{" "}
          <span aria-hidden>↗</span>
        </p>
      </div>
    </a>
  );
}
