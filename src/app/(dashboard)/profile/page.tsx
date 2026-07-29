import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileWizard from "@/components/company/ProfileWizard";
import ProfileSummary from "@/components/company/ProfileSummary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Company Profile",
  description: "Manage your company compliance profile.",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Get the user's first company with its profile
  const company = await prisma.company.findFirst({
    where: { ownerId: session.user.id },
    include: { profile: true },
  });

  if (!company) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <Card>
          <CardContent className="py-12">
            <Building2 className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" />
            <h2 className="mt-4 text-lg font-semibold text-surface-900 dark:text-surface-100">
              No company found
            </h2>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              Something went wrong — your company account couldn&apos;t be found. Please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasProfile = !!company.profile;
  const isEditing = searchParams.edit === "true";

  // Show wizard if no profile or explicitly editing
  if (!hasProfile || isEditing) {
    // Build edit data from existing profile if editing
    const editData = company.profile
      ? {
          companyName: company.name,
          industry: company.profile.industry,
          employeeCount: company.profile.employeeCount,
          state: company.profile.state,
          city: company.profile.city ?? undefined,
          locationCount: company.profile.locationCount,
          hasRemoteWorkers: company.profile.hasRemoteWorkers,
          hasUnionEmployees: company.profile.hasUnionEmployees,
          isFederalContractor: company.profile.isFederalContractor,
          isNonprofit: company.profile.isNonprofit,
        }
      : undefined;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {isEditing ? "Edit Company Profile" : "Complete Your Profile"}
          </h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">
            {isEditing
              ? "Update your company details to keep your compliance recommendations accurate."
              : "Fill in your company details to get your personalized compliance dashboard."}
          </p>
        </div>

        <ProfileWizard
          companyId={company.id}
          editData={editData}
        />
      </div>
    );
  }

  // Show profile summary
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Company Profile
        </h1>
        <p className="mt-1 text-surface-500 dark:text-surface-400">
          Review and manage your company&apos;s compliance profile.
        </p>
      </div>

      <ProfileSummary company={company} />
    </div>
  );
}
