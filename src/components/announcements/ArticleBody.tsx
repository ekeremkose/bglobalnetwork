import { RichText } from "@/components/ui/RichText";
import { formatDateShortTr } from "@/lib/utils/date";

/** The blog article as readers see it. Shared by the public page and the admin preview so both render identically. */
export function ArticleBody({
  title,
  publishedAt,
  content,
  link,
}: {
  title: string;
  publishedAt: string;
  content: string;
  link?: string;
}) {
  return (
    <>
      <header className="mt-8 max-w-2xl">
        <time dateTime={publishedAt} className="text-sm tabular-nums text-white/45">
          {formatDateShortTr(publishedAt)}
        </time>
        <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-[#f4f5fa] sm:text-5xl">
          {title}
        </h1>
      </header>

      <RichText
        text={content}
        className="mt-10 max-w-2xl space-y-5 text-lg leading-relaxed text-white/75"
      />

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-block text-[15px] font-medium text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
        >
          Kaynağa git ↗
        </a>
      )}
    </>
  );
}
