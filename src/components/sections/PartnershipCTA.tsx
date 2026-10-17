const items = [
  {
    title: "Duyuru paylaşımı",
    desc: "Programınızı kısa özet + resmi link ile yayınlayabiliriz.",
  },
  {
    title: "Ortak içerik",
    desc: "Reels, canlı yayın veya webinar formatlarında içerik üretebiliriz.",
  },
  {
    title: "Kampüs ağı",
    desc: "Öğrenci elçileriyle hedef kitleye daha doğrudan ulaşabiliriz.",
  },
];

export function PartnershipCTA() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-10 flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
          İş birliği
        </span>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Kurumlar ve<br />
            topluluklar<br />
            için
          </h2>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <p className="text-base leading-relaxed text-white/50">
            Uluslararası fırsat duyurularını öğrencilere daha hızlı
            ulaştırmak için birlikte çalışabiliriz.
          </p>

          <div className="mt-10 space-y-0">
            {items.map((item) => (
              <div
                key={item.title}
                className="flex gap-5 border-t border-white/[0.06] py-5"
              >
                <div>
                  <div className="text-sm font-semibold text-white">
                    {item.title}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-white/45">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
