export function PageIntro({
  title,
  description,
}: {
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <header className="pb-8 pt-12 sm:pb-10 sm:pt-16">
      <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#f4f5fa] sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/60">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export const fieldClass =
  "w-full rounded-md border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-brand-300 [color-scheme:dark]";
export const labelClass = "mb-1.5 block text-[13px] text-white/55";
