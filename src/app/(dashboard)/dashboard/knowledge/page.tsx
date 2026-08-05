import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import KnowledgeSearch from "@/components/knowledge/KnowledgeSearch";
import { getExcerpt } from "@/modules/knowledge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description:
    "Plain-English guides to the employment laws that affect your business.",
};

/**
 * Knowledge base listing — fetches all published articles from the database
 * and hands them to the client-side search component, which filters and
 * groups them by category.
 */
export default async function KnowledgePage() {
  const articles = await prisma.knowledgeArticle.findMany({
    where: { isPublished: true },
    orderBy: [{ title: "asc" }],
    select: {
      slug: true,
      title: true,
      category: true,
      content: true,
      updatedAt: true,
    },
  });

  const items = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    category: article.category,
    excerpt: getExcerpt(article.content),
    content: article.content,
    updatedAt: article.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 sm:text-3xl">
          Knowledge Base
        </h1>
        <p className="max-w-2xl text-surface-500 dark:text-surface-400">
          Plain-English guides to the employment laws that affect small
          businesses — who each law applies to, what it requires, and what
          happens if you don&apos;t comply.
        </p>
      </div>

      <KnowledgeSearch articles={items} />
    </div>
  );
}
