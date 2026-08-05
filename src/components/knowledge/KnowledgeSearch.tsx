"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getCategoryBadgeVariant,
  type KnowledgeArticleListItem,
} from "@/modules/knowledge";

interface KnowledgeSearchProps {
  articles: KnowledgeArticleListItem[];
}

/**
 * Client-side search + grouped listing for the knowledge base.
 * Filters articles by title or body content using simple case-insensitive
 * substring matching, then groups results by category.
 */
export default function KnowledgeSearch({ articles }: KnowledgeSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return articles;
    }
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q),
    );
  }, [articles, query]);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, KnowledgeArticleListItem[]>();
    for (const article of filtered) {
      const list = byCategory.get(article.category) ?? [];
      list.push(article);
      byCategory.set(article.category, list);
    }
    return [...byCategory.entries()].sort(([a], [b]) => {
      const aIndex = CATEGORY_ORDER.indexOf(a as (typeof CATEGORY_ORDER)[number]);
      const bIndex = CATEGORY_ORDER.indexOf(b as (typeof CATEGORY_ORDER)[number]);
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  }, [filtered]);

  const totalMatches = filtered.length;

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles by title or topic…"
          aria-label="Search knowledge base articles"
          className="pl-10"
        />
      </div>

      {/* Results */}
      {totalMatches === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-surface-300 dark:text-surface-600" />
            <p className="mt-3 text-sm font-medium text-surface-900 dark:text-surface-100">
              No articles match &ldquo;{query.trim()}&rdquo;
            </p>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Try a different search term, such as &ldquo;overtime&rdquo; or
              &ldquo;family leave&rdquo;.
            </p>
          </CardContent>
        </Card>
      ) : (
        grouped.map(([category, items]) => (
          <section key={category} aria-label={CATEGORY_LABELS[category] ?? category}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                {items.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((article) => (
                <Link
                  key={article.slug}
                  href={`/dashboard/knowledge/${article.slug}`}
                  className="group"
                >
                  <Card hover className="flex h-full flex-col transition-colors group-hover:border-brand-200 dark:group-hover:border-brand-800">
                    <CardContent className="flex flex-1 flex-col">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <Badge variant={getCategoryBadgeVariant(article.category)}>
                          {CATEGORY_LABELS[article.category] ?? article.category}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-surface-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500 dark:text-surface-600" />
                      </div>
                      <h3 className="text-base font-semibold leading-snug text-surface-900 dark:text-surface-100">
                        {article.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
