const pillars = [
  {
    n: "01",
    title: "Net özetler",
    desc: "Uzun duyuruları \"kimler başvurabilir, ne gerekir, son tarih\" gibi pratik başlıklara indirgeriz.",
  },
  {
    n: "02",
    title: "Kategoriler",
    desc: "Erasmus+, staj, gönüllülük, burs ve yaz okulu gibi temalarla hızlı keşif sunarız.",
  },
  {
    n: "03",
    title: "Güven & şeffaflık",
    desc: "Her fırsatta resmi başvuru linkine yönlendirir, kullanıcıyı doğrulama konusunda bilgilendiririz.",
  },
];

export function AboutSection() {
  return (
    <section id="hakkimizda" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mb-10 flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
          Hakkımızda
        </span>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            B-Global<br />
            Network<br />
            nedir?
          </h2>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <p className="text-base leading-relaxed text-white/50">
            Öğrencilerin yurtdışı fırsatlarına daha hızlı ve doğru şekilde
            ulaşabilmesi için içerikleri derleyen, özetleyen ve paylaşan bir
            topluluk/proje.
          </p>

          <div className="mt-12 space-y-8">
            {pillars.map((item) => (
              <div key={item.n} className="flex gap-5 border-t border-white/[0.06] pt-6">
                <span className="mt-0.5 shrink-0 text-xs font-medium text-white/20">
                  {item.n}
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/45">
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
