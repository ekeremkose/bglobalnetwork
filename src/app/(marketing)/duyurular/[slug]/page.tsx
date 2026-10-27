import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnnouncementBySlug } from "@/lib/repositories/announcementRepository";
import { ArticleBody } from "@/components/announcements/ArticleBody";

export const revalidate = 3600;

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getAnnouncementBySlug(slug);
  if (!post) notFound();

  return (
    <article className="pb-24 pt-10 sm:pt-14">
      <Link
        href="/duyurular"
        className="text-[15px] text-white/55 transition hover:text-white"
      >
        ← Blog
      </Link>

      <ArticleBody
        title={post.title}
        publishedAt={post.publishedAt}
        content={post.content}
        link={post.link}
      />
    </article>
  );
}
