import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your compliance overview.",
};

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileSummary from "@/components/company/ProfileSummary";
import { AlertTriangle, CheckCircle2, ClipboardList, Scale } from "lucide-react";

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
            Welcome{ session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : "" }
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
              Tell us about your business to see which employment laws apply to you and get your personalized compliance dashboard.
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
                Complete your company profile to see your compliance health score.
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

  // Profile exists — show full dashboard
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Welcome{ session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : "" }
        </h1>
        <p className="mt-1 text-surface-500 dark:text-surface-400">
          Your compliance overview — see what applies to your business and what needs attention.
        </p>
      </div>

      {/* Profile summary */}
      <ProfileSummary company={company} />

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Compliance Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Profile complete. Compliance analysis will appear here once rules are processed.
            </p>
            <p className="mt-2 text-3xl font-bold text-surface-300 dark:text-surface-600">
              —
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-brand-500" />
              Open Tasks
            </CardTitle>
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4 text-purple-500" />
              Applicable Laws
            </CardTitle>
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
