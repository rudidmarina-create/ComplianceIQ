import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { US_STATES } from "@/modules/company/schemas";
import { Building2, MapPin, Users, Pencil } from "lucide-react";
import type { Company, CompanyProfile } from "@prisma/client";

interface ProfileSummaryProps {
  company: Company & { profile: CompanyProfile | null };
}

export default function ProfileSummary({ company }: ProfileSummaryProps) {
  const profile = company.profile;

  if (!profile) return null;

  const stateName = US_STATES.find((s) => s.code === profile.state)?.name || profile.state;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{company.name}</CardTitle>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Compliance profile
            </p>
          </div>
          <Link href="/dashboard/profile?edit=true">
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
            <div>
              <dt className="text-xs text-surface-500 dark:text-surface-400">Industry</dt>
              <dd className="text-sm font-medium text-surface-900 dark:text-surface-100">
                {profile.industry}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
            <div>
              <dt className="text-xs text-surface-500 dark:text-surface-400">Location</dt>
              <dd className="text-sm font-medium text-surface-900 dark:text-surface-100">
                {profile.city ? `${profile.city}, ${stateName}` : stateName}
              </dd>
              {profile.locationCount > 1 && (
                <dd className="text-xs text-surface-500 dark:text-surface-400">
                  {profile.locationCount} locations
                </dd>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
            <div>
              <dt className="text-xs text-surface-500 dark:text-surface-400">Employees</dt>
              <dd className="text-sm font-medium text-surface-900 dark:text-surface-100">
                {profile.employeeCount}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          {profile.hasRemoteWorkers && (
            <Badge variant="primary">Remote workforce</Badge>
          )}
          {profile.hasUnionEmployees && (
            <Badge variant="warning">Union employees</Badge>
          )}
          {profile.isFederalContractor && (
            <Badge variant="primary">Federal contractor</Badge>
          )}
          {profile.isNonprofit && (
            <Badge variant="success">Nonprofit</Badge>
          )}
          {!profile.hasRemoteWorkers &&
            !profile.hasUnionEmployees &&
            !profile.isFederalContractor &&
            !profile.isNonprofit && (
              <span className="text-xs text-surface-400">No special categories</span>
            )}
        </div>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-surface-400">
          Edit your profile at any time to update your compliance obligations.
        </p>
      </CardFooter>
    </Card>
  );
}
