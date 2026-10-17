import Link from "next/link";

export function HomeHero() {
  return (
    <section className="pb-12 pt-12 sm:pb-16 sm:pt-14">
      <h1 className="max-w-xl text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
        Yurtdışına çıkmak istiyorsan, nereden başlayacağını burada bul.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
        Erasmus+, staj, burs ve gönüllülük programlarını keşfet; faydalı
        içerikleri takip et ve yurtdışı yolculuğuna B-Global ile başla.
      </p>
      <div className="mt-7">
        <Link
          href="/opportunities"
          className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-white/90"
        >
          Projeleri Keşfet
        </Link>
      </div>
    </section>
  );
}
