import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TaskStatusActions from "@/components/compliance/TaskStatusActions";
import {
  getPriorityColor,
  getStatusColor,
  formatPriority,
  formatStatus,
} from "@/lib/dashboard-helpers";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  FileText,
  BookOpen,
} from "lucide-react";
import type { RuleTaskDef } from "@/modules/compliance";

export const dynamic = "force-dynamic";

interface TaskDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: TaskDetailPageProps): Promise<Metadata> {
  const task = await prisma.complianceTask.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  return {
    title: task?.title ?? "Task",
    description: task ? `Details for "${task.title}"` : "Task not found.",
  };
}

export default async function TaskDetailPage({
  params,
}: TaskDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Fetch task with related rule data
  const task = await prisma.complianceTask.findUnique({
    where: { id: params.id },
    include: {
      rule: true,
      company: {
        select: { ownerId: true },
      },
    },
  });

  if (!task) {
    notFound();
  }

  // Authorization check: only the task owner can view
  if (task.company.ownerId !== session.user.id) {
    notFound();
  }

  const priorityColors = getPriorityColor(task.priority);
  const statusColors = getStatusColor(task.status);

  // Parse checklist from JSON
  const checklistItems = (task.checklist as string[]) ?? [];

  // Parse references from rule
  const ruleTaskDefs = (task.rule.tasks as unknown as RuleTaskDef[]) ?? [];
  const matchingTaskDef = ruleTaskDefs.find(
    (def) => def.title === task.title
  );

  const references = matchingTaskDef?.references ?? [];

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/dashboard/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </Link>

      {/* Task header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {task.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{task.category}</Badge>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors.badge}`}
            >
              {formatPriority(task.priority)} priority
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors.badge}`}
            >
              {formatStatus(task.status)}
            </span>
          </div>
        </div>

        {/* Status actions (client component) */}
        <TaskStatusActions taskId={task.id} currentStatus={task.status} />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-700 dark:text-surface-300 whitespace-pre-line">
                {task.description}
              </p>
            </CardContent>
          </Card>

          {/* Why this applies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-brand-500" />
                Why This Applies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-surface-50 p-4 dark:bg-surface-800">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                  {task.rule.name}
                </p>
                <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
                  {task.rule.description}
                </p>
                {task.rule.jurisdiction && (
                  <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
                    Jurisdiction: {task.rule.jurisdiction}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          {checklistItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {checklistItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-surface-300 text-xs text-surface-400 dark:border-surface-600 dark:text-surface-500">
                        {index + 1}
                      </span>
                      <span className="text-sm text-surface-700 dark:text-surface-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Consequences */}
          {task.rule.consequences && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Consequences of Noncompliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-surface-700 dark:text-surface-300">
                  {task.rule.consequences}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: metadata */}
        <div className="space-y-6">
          {/* Key details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <dt className="text-xs text-surface-500 dark:text-surface-400">
                  Status
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors.badge}`}
                  >
                    {formatStatus(task.status)}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-surface-500 dark:text-surface-400">
                  Priority
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors.badge}`}
                  >
                    {formatPriority(task.priority)}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-surface-500 dark:text-surface-400">
                  Category
                </dt>
                <dd className="mt-1">
                  <Badge variant="default">{task.category}</Badge>
                </dd>
              </div>

              {task.dueDate && (
                <div>
                  <dt className="text-xs text-surface-500 dark:text-surface-400">
                    Due Date
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-sm text-surface-700 dark:text-surface-300">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              )}

              {task.completedAt && (
                <div>
                  <dt className="text-xs text-surface-500 dark:text-surface-400">
                    Completed
                  </dt>
                  <dd className="mt-1 text-sm text-surface-700 dark:text-surface-300">
                    {new Date(task.completedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-xs text-surface-500 dark:text-surface-400">
                  Created
                </dt>
                <dd className="mt-1 text-sm text-surface-700 dark:text-surface-300">
                  {new Date(task.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </CardContent>
          </Card>

          {/* Official references */}
          {references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-brand-500" />
                  Official References
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {references.map((ref, index) => (
                  <a
                    key={index}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{ref.label}</span>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Governing rule link */}
          {task.rule.officialReference && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Source</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={task.rule.officialReference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View official regulation →
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
