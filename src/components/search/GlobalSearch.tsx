"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  ClipboardList,
  Scale,
  BookOpen,
  FileSearch,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getCategoryBadgeVariant, CATEGORY_LABELS } from "@/modules/knowledge";

export type SearchResultType = "task" | "rule" | "article";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  category?: string;
}

const TYPE_META: Record<
  SearchResultType,
  { icon: LucideIcon; label: string }
> = {
  task: { icon: ClipboardList, label: "Task" },
  rule: { icon: Scale, label: "Law" },
  article: { icon: BookOpen, label: "Article" },
};

/**
 * Global search — unified search across compliance tasks, applicable laws,
 * and knowledge base articles. Debounces input (300ms), fetches
 * /api/search?q=..., and shows a dropdown with icon per result type,
 * category badge, and a short excerpt. Closes on Escape or click outside.
 */
export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestSeq = useRef(0);

  // Debounced fetch to /api/search
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(false);

    const timer = setTimeout(async () => {
      const seq = ++requestSeq.current;
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = (await response.json()) as { results?: SearchResult[] };
        if (seq !== requestSeq.current) {
          return; // stale response — a newer query is in flight
        }
        setResults(Array.isArray(data.results) ? data.results : []);
        setHasSearched(true);
      } catch (error) {
        if (seq !== requestSeq.current) {
          return;
        }
        console.error("Global search failed:", error);
        setResults([]);
        setHasSearched(true);
      } finally {
        if (seq === requestSeq.current) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close when clicking outside the search container
  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
        <Input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Search tasks, laws, articles…"
          aria-label="Global search"
          autoComplete="off"
          className="pl-9"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-lg dark:border-surface-800 dark:bg-surface-900">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-surface-500 dark:text-surface-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FileSearch className="mx-auto h-8 w-8 text-surface-300 dark:text-surface-600" />
              <p className="mt-2 text-sm font-medium text-surface-900 dark:text-surface-100">
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Try searching for a task, law, or article topic.
              </p>
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-2">
              {results.map((result) => {
                const meta = TYPE_META[result.type];
                const Icon = meta.icon;
                return (
                  <li key={`${result.type}-${result.id}`}>
                    <Link
                      href={result.url}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-surface-400 dark:text-surface-500" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                            {result.title}
                          </span>
                          {result.category && (
                            <Badge
                              variant={getCategoryBadgeVariant(result.category)}
                              className="shrink-0"
                            >
                              {CATEGORY_LABELS[result.category] ??
                                result.category}
                            </Badge>
                          )}
                        </div>
                        {result.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-surface-500 dark:text-surface-400">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-surface-400 dark:text-surface-500">
                        {meta.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
