import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Company, CompanyProfile } from "@prisma/client";

/**
 * Get the current user and their first company with profile.
 * Returns null if no session, no company, or no profile.
 */
export async function getUserCompany(): Promise<{
  userId: string;
  company: Company & { profile: CompanyProfile };
} | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const company = await prisma.company.findFirst({
    where: { ownerId: session.user.id },
    include: { profile: true },
  });

  if (!company || !company.profile) {
    return null;
  }

  return { userId: session.user.id, company: company as Company & { profile: CompanyProfile } };
}

/**
 * Return Tailwind color classes for a given task priority.
 */
export function getPriorityColor(
  priority: string
): { badge: string; text: string; bg: string } {
  switch (priority) {
    case "critical":
      return {
        badge:
          "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950",
      };
    case "high":
      return {
        badge:
          "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800",
        text: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-950",
      };
    case "medium":
      return {
        badge:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-950",
      };
    case "low":
      return {
        badge:
          "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950",
      };
    default:
      return {
        badge:
          "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300",
        text: "text-surface-600 dark:text-surface-400",
        bg: "bg-surface-50 dark:bg-surface-950",
      };
  }
}

/**
 * Return Tailwind color classes for a given task status.
 */
export function getStatusColor(
  status: string
): { badge: string; text: string } {
  switch (status) {
    case "completed":
      return {
        badge:
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        text: "text-green-600 dark:text-green-400",
      };
    case "in_progress":
      return {
        badge:
          "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        text: "text-blue-600 dark:text-blue-400",
      };
    case "pending":
      return {
        badge:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        text: "text-yellow-600 dark:text-yellow-400",
      };
    case "not_applicable":
      return {
        badge:
          "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400",
        text: "text-surface-500 dark:text-surface-400",
      };
    default:
      return {
        badge:
          "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300",
        text: "text-surface-600 dark:text-surface-400",
      };
  }
}

/**
 * Return a human-readable label and color for a compliance health score.
 */
export function getHealthLabel(score: number): {
  label: string;
  color: string;
  ringColor: string;
  bgColor: string;
} {
  if (score >= 80) {
    return {
      label: "Good",
      color: "text-green-600 dark:text-green-400",
      ringColor: "stroke-green-500",
      bgColor: "stroke-green-100 dark:stroke-green-900",
    };
  }
  if (score >= 50) {
    return {
      label: "Needs Attention",
      color: "text-yellow-600 dark:text-yellow-400",
      ringColor: "stroke-yellow-500",
      bgColor: "stroke-yellow-100 dark:stroke-yellow-900",
    };
  }
  return {
    label: "At Risk",
    color: "text-red-600 dark:text-red-400",
    ringColor: "stroke-red-500",
    bgColor: "stroke-red-100 dark:stroke-red-900",
  };
}

/**
 * Format a status string for display (e.g., "in_progress" → "In Progress").
 */
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format a priority string for display (e.g., "high" → "High").
 */
export function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
