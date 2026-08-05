import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, CalendarDays, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CATEGORY_LABELS,
  getCategoryBadgeVariant,
  formatDate,
} from "@/modules/knowledge";

export const dynamic = "force-dynamic";

interface KnowledgeArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: KnowledgeArticlePageProps): Promise<Metadata> {
  const article = await prisma.knowledgeArticle.findUnique({
    where: { slug: params.slug },
    select: { title: true, isPublished: true },
  });
  return {
    title: article?.isPublished ? article.title : "Knowledge Base",
    description: "Employment law explainer from the ComplianceIQ knowledge base.",
  };
}

/**
 * Knowledge article detail — renders a single published article as Markdown,
 * with its category, last-updated date, and related articles in the same
 * category.
 */
export default async function KnowledgeArticlePage({
  params,
}: KnowledgeArticlePageProps) {
  const article = await prisma.knowledgeArticle.findUnique({
    where: { slug: params.slug },
  });

  if (!article || !article.isPublished) {
    notFound();
  }

  const related = await prisma.knowledgeArticle.findMany({
    where: {
      category: article.category,
      isPublished: true,
      slug: { not: article.slug },
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
    select: { slug: true, title: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard/knowledge"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 transition-colors hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Knowledge Base
      </Link>

      {/* Article header */}
      <article>
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={getCategoryBadgeVariant(article.category)}>
              {CATEGORY_LABELS[article.category] ?? article.category}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400">
              <CalendarDays className="h-3.5 w-3.5" />
              Last updated {formatDate(article.updatedAt)}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100 sm:text-4xl">
            {article.title}
          </h1>
        </header>

        {/* Markdown body */}
        <div className="kb-prose mt-2">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Open external (.gov reference) links in a new tab
              a: (props) => {
                const { node: _node, ...anchorProps } = props;
                return (
                  <a {...anchorProps} target="_blank" rel="noopener noreferrer" />
                );
              },
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section aria-label="Related articles" className="pt-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-surface-100">
            <BookOpen className="h-5 w-5 text-brand-500" />
            Related Articles
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/dashboard/knowledge/${item.slug}`}
                className="group"
              >
                <Card hover className="h-full transition-colors group-hover:border-brand-200 dark:group-hover:border-brand-800">
                  <CardHeader>
                    <CardTitle className="text-sm leading-snug">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
