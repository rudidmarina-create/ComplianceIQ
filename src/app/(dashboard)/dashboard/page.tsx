import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your compliance overview.",
};

import { auth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
