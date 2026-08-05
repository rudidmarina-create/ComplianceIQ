import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProfileSummary from "@/components/company/ProfileSummary";
import ComplianceHealthGauge from "@/components/compliance/ComplianceHealthGauge";
import { runComplianceCheck } from "@/modules/compliance";
import {
  getPriorityColor,
  getHealthLabel,
  formatPriority,
} from "@/lib/dashboard-helpers";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Scale,
  ArrowRight,
  Shield,
  Clock,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your compliance overview.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Get the user's company with profile
  const company = await prisma.company.findFirst({
    where: { ownerId: session.user.id },
    include: { profile: true },
  });

  const hasProfile = !!company?.profile;

  // No profile yet — show prompt
  if (!hasProfile) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Welcome
            {session?.user?.name
              ? `, ${session.user.name.split(" ")[0]}`
              : ""}
          </h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">
            Let&apos;s get your compliance journey started.
          </p>
        </div>

        <Card className="border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-brand-500 dark:text-brand-400" />
            <h2 className="mt-4 text-lg font-semibold text-surface-900 dark:text-surface-100">
              Complete your company profile
            </h2>
            <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
              Tell us about your business to see which employment laws apply to
              you and get your personalized compliance dashboard.
            </p>
            <Link href="/dashboard/profile" className="mt-6 inline-block">
              <Button variant="primary" size="lg">
                Set Up Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Placeholder cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Complete your company profile to see your compliance health
                score.
              </p>
              <p className="mt-2 text-3xl font-bold text-surface-300 dark:text-surface-600">
                —
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Pending compliance tasks that need your attention.
              </p>
              <p className="mt-2 text-3xl font-bold text-surface-300 dark:text-surface-600">
                —
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applicable Laws</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Federal and state laws matching your profile.
              </p>
              <p className="mt-2 text-3xl font-bold text-surface-300 dark:text-surface-600">
                —
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Profile exists — run compliance check and show full dashboard
  let tasks: Awaited<ReturnType<typeof prisma.complianceTask.findMany>> = [];
  let applicableRules: Awaited<
    ReturnType<typeof prisma.complianceRule.findMany>
  > = [];
  let healthScore = 0;
  let engineError: string | null = null;

  try {
    const result = await runComplianceCheck(company.id);
    tasks = result.tasks;
    applicableRules = result.applicableRules;
    healthScore = result.healthScore;
  } catch (error) {
    // Engine threw — likely no rules configured or DB issue
    engineError =
      error instanceof Error ? error.message : "Failed to run compliance check";
    console.error("Compliance check failed:", engineError);
  }

  // Compute stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress"
  ).length;
  const highPriorityTasks = tasks.filter(
    (t) =>
      (t.priority === "high" || t.priority === "critical") &&
      t.status !== "completed"
  );

  const { label: healthLabel } = getHealthLabel(healthScore);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Welcome
          {session?.user?.name
            ? `, ${session.user.name.split(" ")[0]}`
            : ""}
        </h1>
        <p className="mt-1 text-surface-500 dark:text-surface-400">
          Your compliance overview — see what applies to your business and what
          needs attention.
        </p>
      </div>

      {/* Profile summary */}
      <ProfileSummary company={company} />

      {/* Health Score + Stats Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Health Score Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-brand-500" />
              Compliance Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            {engineError ? (
              <div className="text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-yellow-500" />
                <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                  Unable to calculate health score. Try refreshing.
                </p>
              </div>
            ) : (
              <>
                <ComplianceHealthGauge score={healthScore} size="md" />
                <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">
                  {totalTasks === 0
                    ? "No tasks yet — complete your first tasks to build your score."
                    : `${completedTasks} of ${totalTasks} tasks completed`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4 text-brand-500" />
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">
                {totalTasks}
              </p>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Compliance tasks identified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {completedTasks}
              </p>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Tasks completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-yellow-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {pendingTasks}
              </p>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Awaiting action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {highPriorityTasks.length}
              </p>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Need immediate attention
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                High Priority Tasks
              </CardTitle>
              <Link href="/dashboard/tasks">
                <Button variant="ghost" size="sm">
                  View all tasks
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 text-left dark:border-surface-700">
                    <th className="py-2.5 pr-4 font-medium text-surface-500 dark:text-surface-400">
                      Task
                    </th>
                    <th className="py-2.5 pr-4 font-medium text-surface-500 dark:text-surface-400">
                      Category
                    </th>
                    <th className="py-2.5 pr-4 font-medium text-surface-500 dark:text-surface-400">
                      Priority
                    </th>
                    <th className="py-2.5 font-medium text-surface-500 dark:text-surface-400">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {highPriorityTasks.slice(0, 5).map((task) => {
                    const priorityColors = getPriorityColor(task.priority);
                    return (
                      <tr
                        key={task.id}
                        className="border-b border-surface-100 transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/50"
                      >
                        <td className="py-3 pr-4">
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="font-medium text-surface-900 hover:text-brand-600 dark:text-surface-100 dark:hover:text-brand-400"
                          >
                            {task.title}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="default">{task.category}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors.badge}`}
                          >
                            {formatPriority(task.priority)}
                          </span>
                        </td>
                        <td className="py-3 text-surface-500 dark:text-surface-400">
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {highPriorityTasks.length > 5 && (
              <div className="mt-4 text-center">
                <Link href="/dashboard/tasks">
                  <Button variant="outline" size="sm">
                    View all {highPriorityTasks.length} high-priority tasks
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Applicable Laws */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-purple-500" />
            Applicable Laws
          </CardTitle>
        </CardHeader>

        <CardContent>
          {applicableRules.length === 0 ? (
            <div className="py-6 text-center">
              <Scale className="mx-auto h-10 w-10 text-surface-300 dark:text-surface-600" />
              <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                {totalTasks === 0 && !engineError
                  ? "No applicable laws found for your profile. Complete your profile to see matching regulations."
                  : "No applicable laws matched your profile. This may indicate an issue with the rules database."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {applicableRules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-lg border border-surface-200 p-4 dark:border-surface-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                      {rule.name}
                    </h4>
                    <Badge variant="primary" className="shrink-0">
                      {rule.category}
                    </Badge>
                  </div>
                  {rule.description && (
                    <p className="mt-2 text-xs text-surface-500 dark:text-surface-400 line-clamp-2">
                      {rule.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-surface-400 dark:text-surface-500">
                    <span>{rule.jurisdiction}</span>
                    {rule.officialReference && (
                      <>
                        <span>·</span>
                        <a
                          href={rule.officialReference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                        >
                          Official reference →
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
