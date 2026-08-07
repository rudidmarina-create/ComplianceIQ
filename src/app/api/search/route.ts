import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getExcerpt } from "@/modules/knowledge";

export const dynamic = "force-dynamic";

export type SearchResultType = "task" | "rule" | "article";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  category?: string;
}

/** Cap a plain-text description at `maxLength` characters for excerpts. */
function toExcerpt(text: string, maxLength = 100): string {
  const plain = text.replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}

/**
 * GET /api/search?q=<query>
 *
 * Global search across compliance tasks (company-scoped), compliance rules,
 * and published knowledge base articles. Blended results are capped at 20.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Tasks are scoped to the signed-in user's company
    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    const where = { contains: query, mode: "insensitive" as const };

    const [tasks, rules, articles] = await Promise.all([
      company
        ? prisma.complianceTask.findMany({
            where: {
              companyId: company.id,
              OR: [{ title: where }, { description: where }],
            },
            take: 8,
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
            },
          })
        : Promise.resolve([]),
      prisma.complianceRule.findMany({
        where: {
          OR: [{ name: where }, { description: where }],
        },
        take: 6,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
        },
      }),
      prisma.knowledgeArticle.findMany({
        where: {
          isPublished: true,
          OR: [{ title: where }, { content: where }],
        },
        take: 6,
        select: {
          slug: true,
          title: true,
          content: true,
          category: true,
        },
      }),
    ]);

    const results: SearchResult[] = [
      ...tasks.map((task) => ({
        id: task.id,
        type: "task" as const,
        title: task.title,
        description: toExcerpt(task.description),
        url: `/dashboard/tasks/${task.id}`,
        category: task.category,
      })),
      ...rules.map((rule) => ({
        id: rule.id,
        type: "rule" as const,
        title: rule.name,
        description: toExcerpt(rule.description),
        url: "/dashboard",
        category: rule.category,
      })),
      ...articles.map((article) => ({
        id: article.slug,
        type: "article" as const,
        title: article.title,
        description: getExcerpt(article.content, 100),
        url: `/dashboard/knowledge/${article.slug}`,
        category: article.category,
      })),
    ].slice(0, 20);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error running global search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
