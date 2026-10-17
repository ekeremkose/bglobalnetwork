export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="animate-pulse space-y-4">
        <div className="h-9 w-2/3 rounded-xl bg-slate-200" />
        <div className="h-4 w-1/2 rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

