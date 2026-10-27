export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 pt-16" aria-hidden>
      <div className="h-10 w-1/2 rounded bg-white/10" />
      <div className="h-4 w-2/5 rounded bg-white/10" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded bg-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}
