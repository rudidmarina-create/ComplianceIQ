import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { runComplianceCheck } from "@/modules/compliance";
import {
  getPriorityColor,
  getStatusColor,
  formatPriority,
  formatStatus,
} from "@/lib/dashboard-helpers";
import {
  ClipboardList,
  Filter,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Your compliance tasks.",
};

interface TasksPageProps {
  searchParams: {
    status?: string;
  };
}

const VALID_STATUSES = ["pending", "in_progress", "completed"] as const;

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const company = await prisma.company.findFirst({
    where: { ownerId: session.user.id },
    include: { profile: true },
  });

  const hasProfile = !!company?.profile;

  if (!hasProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Tasks
          </h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">
            Your compliance tasks will appear here.
          </p>
        </div>
        <Card className="border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950">
          <CardContent className="py-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-brand-500 dark:text-brand-400" />
            <p className="mt-3 text-sm text-surface-600 dark:text-surface-400">
              No compliance tasks yet. Complete your company profile to get
              started.
            </p>
            <Link href="/dashboard/profile" className="mt-4 inline-block">
              <Button variant="primary" size="sm">
                Set Up Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Run compliance check to get/refresh tasks
  let tasks: Awaited<ReturnType<typeof prisma.complianceTask.findMany>> = [];
  let engineError: string | null = null;

  try {
    const result = await runComplianceCheck(company.id);
    tasks = result.tasks;
  } catch (error) {
    engineError =
      error instanceof Error ? error.message : "Failed to load tasks";
    console.error("Compliance check failed:", engineError);
  }

  // Apply status filter from URL
  const statusFilter = searchParams.status;
  let filteredTasks = tasks;

  if (statusFilter && VALID_STATUSES.includes(statusFilter as (typeof VALID_STATUSES)[number])) {
    filteredTasks = tasks.filter((t) => t.status === statusFilter);
  }

  // Sort by priority (critical → low) then by due date
  const priorityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  filteredTasks.sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 99;
    const pb = priorityOrder[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;

    // Sort by due date (earliest first, null dates at end)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  // Filter tabs config
  const filterTabs = [
    { label: "All", value: "", count: tasks.length },
    {
      label: "Pending",
      value: "pending",
      count: tasks.filter((t) => t.status === "pending").length,
    },
    {
      label: "In Progress",
      value: "in_progress",
      count: tasks.filter((t) => t.status === "in_progress").length,
    },
    {
      label: "Completed",
      value: "completed",
      count: tasks.filter((t) => t.status === "completed").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Tasks
        </h1>
        <p className="mt-1 text-surface-500 dark:text-surface-400">
          {filteredTasks.length}{" "}
          {statusFilter
            ? `${formatStatus(statusFilter).toLowerCase()} `
            : ""}
          compliance task
          {filteredTasks.length !== 1 ? "s" : ""}
        </p>
      </div>

      {engineError && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Could not refresh tasks: {engineError}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isActive =
            (!statusFilter && tab.value === "") ||
            statusFilter === tab.value;
          const href = tab.value
            ? `/dashboard/tasks?status=${tab.value}`
            : "/dashboard/tasks";

          return (
            <Link key={tab.value} href={href}>
              <Button
                variant={isActive ? "primary" : "secondary"}
                size="sm"
              >
                <Filter className="h-3.5 w-3.5" />
                {tab.label}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300"
                  }`}
                >
                  {tab.count}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Tasks table */}
      {filteredTasks.length === 0 ? (
        <Card padding="none">
          <CardContent className="py-12 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-surface-300 dark:text-surface-600" />
            <h3 className="mt-3 text-sm font-semibold text-surface-900 dark:text-surface-100">
              {statusFilter
                ? `No ${formatStatus(statusFilter).toLowerCase()} tasks`
                : "No tasks yet"}
            </h3>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              {tasks.length === 0
                ? "Complete your company profile to see applicable compliance tasks."
                : "All caught up! No tasks match the current filter."}
            </p>
            {statusFilter && (
              <Link href="/dashboard/tasks" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Show all tasks
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card padding="none">
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 text-left dark:border-surface-700">
                    <th className="px-6 py-3 font-medium text-surface-500 dark:text-surface-400">
                      Task
                    </th>
                    <th className="px-6 py-3 font-medium text-surface-500 dark:text-surface-400">
                      Category
                    </th>
                    <th className="px-6 py-3 font-medium text-surface-500 dark:text-surface-400">
                      Priority
                    </th>
                    <th className="px-6 py-3 font-medium text-surface-500 dark:text-surface-400">
                      Status
                    </th>
                    <th className="px-6 py-3 font-medium text-surface-500 dark:text-surface-400">
                      Due Date
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const priorityColors = getPriorityColor(task.priority);
                    const statusColors = getStatusColor(task.status);
                    return (
                      <tr
                        key={task.id}
                        className="border-b border-surface-100 transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/50"
                      >
                        <td className="px-6 py-3.5">
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="font-medium text-surface-900 hover:text-brand-600 dark:text-surface-100 dark:hover:text-brand-400"
                          >
                            {task.title}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge variant="default">{task.category}</Badge>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors.badge}`}
                          >
                            {formatPriority(task.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors.badge}`}
                          >
                            {formatStatus(task.status)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-surface-500 dark:text-surface-400">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link href={`/dashboard/tasks/${task.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
