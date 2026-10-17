type Props = {
  children: React.ReactNode;
  tone?: "brand" | "slate" | "success" | "warning";
};

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  brand: "border-brand-200 bg-brand-50 text-brand-800",
  slate: "border-slate-200 bg-white text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900"
};

export function Badge({ children, tone = "slate" }: Props) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneMap[tone]
      ].join(" ")}
    >
      {children}
    </span>
  );
}

