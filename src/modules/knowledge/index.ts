/**
 * Knowledge base module — category metadata and helpers for knowledge articles.
 *
 * Articles are stored in the database (prisma KnowledgeArticle model) as
 * Markdown. This module centralizes the category taxonomy, display labels,
 * badge colors, and text helpers shared by the listing and detail pages.
 */

/** Display order for categories on the knowledge base listing page. */
export const CATEGORY_ORDER = [
  "wage_hour",
  "leave",
  "benefits",
  "discrimination",
  "safety",
  "filing",
  "training",
  "recordkeeping",
  "poster",
] as const;

/** Human-readable labels for every category used by articles and rules. */
export const CATEGORY_LABELS: Record<string, string> = {
  wage_hour: "Wage & Hour",
  leave: "Leave",
  benefits: "Benefits & Health Coverage",
  discrimination: "Discrimination & Equal Opportunity",
  safety: "Workplace Safety",
  filing: "Tax Filing & Reporting",
  training: "Training",
  recordkeeping: "Recordkeeping",
  poster: "Posters & Notices",
};

/**
 * Map a category to a Badge variant so each topic gets a stable, distinct
 * color on cards and detail pages.
 */
export function getCategoryBadgeVariant(
  category: string,
): "default" | "primary" | "success" | "warning" | "danger" {
  switch (category) {
    case "wage_hour":
      return "primary";
    case "leave":
      return "success";
    case "benefits":
      return "warning";
    case "discrimination":
      return "danger";
    case "safety":
      return "warning";
    case "filing":
      return "primary";
    default:
      return "default";
  }
}

/**
 * Strip common Markdown syntax from a body of text and return the first
 * `maxLength` characters, for use as a card excerpt.
 */
export function getExcerpt(content: string, maxLength = 150): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/[#>*_`~|-]/g, " ") // headings, emphasis, list markers
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}

/** Format a date for display, e.g. "July 29, 2026". */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Plain data shape passed from server pages to client components. */
export interface KnowledgeArticleListItem {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  updatedAt: string;
}
