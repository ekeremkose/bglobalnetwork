type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark"
}: Props) {
  const center = align === "center";
  const isLight = tone === "light";
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow ? (
        <div
          className={[
            "text-xs font-semibold uppercase tracking-wider",
            isLight ? "text-brand-100" : "text-brand-700"
          ].join(" ")}
        >
          {eyebrow}
        </div>
      ) : null}
      <h2
        className={[
          "mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl",
          isLight ? "text-white" : "text-ink"
        ].join(" ")}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={[
            "mt-3 text-pretty text-sm leading-relaxed sm:text-base",
            isLight ? "text-white/80" : "text-slate-600",
            center ? "mx-auto max-w-2xl" : "max-w-2xl"
          ].join(" ")}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

