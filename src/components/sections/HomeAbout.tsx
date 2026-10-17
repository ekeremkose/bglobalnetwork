export function HomeAbout() {
  return (
    <section id="hakkimizda" className="py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
            B-Global nedir?
          </h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="text-base leading-relaxed text-white/55">
            B-Global, öğrencilerin yurtdışı eğitim, staj, burs ve gönüllülük
            fırsatlarına daha kolay ulaşmasını amaçlayan bir öğrenci
            topluluğudur. Fırsatları, faydalı içerikleri ve deneyimleri tek
            bir yerde bir araya getirir.
          </p>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center text-sm font-semibold text-brand-300 transition hover:text-brand-200"
          >
            Bizi daha yakından tanıyın →
          </a>
        </div>
      </div>
    </section>
  );
}
