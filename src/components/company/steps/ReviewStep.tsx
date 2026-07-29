"use client";

import { useProfileWizard } from "@/components/company/ProfileWizardContext";
import { US_STATES } from "@/modules/company/schemas";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | undefined;
}) {
  let display: React.ReactNode = "—";

  if (typeof value === "boolean") {
    display = (
      <Badge variant={value ? "primary" : "default"}>
        {value ? "Yes" : "No"}
      </Badge>
    );
  } else if (value !== undefined && value !== "") {
    // Format state code to full name
    if (label === "State" && typeof value === "string" && value.length === 2) {
      const state = US_STATES.find((s) => s.code === value);
      display = state ? state.name : value;
    } else {
      display = String(value);
    }
  }

  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-sm text-surface-500 dark:text-surface-400">{label}</dt>
      <dd className="text-sm font-medium text-surface-900 dark:text-surface-100">
        {display}
      </dd>
    </div>
  );
}

export default function ReviewStep() {
  const { state } = useProfileWizard();
  const { data } = state;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
          Review &amp; Submit
        </h2>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Review your company profile details before submitting. You can go back to edit any step.
        </p>
      </div>

      <Card padding="sm">
        <h3 className="mb-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
          Company Basics
        </h3>
        <dl className="divide-y divide-surface-200 dark:divide-surface-800">
          <DataRow label="Company name" value={data.companyName} />
          <DataRow label="Industry" value={data.industry} />
          <DataRow label="Employees" value={data.employeeCount} />
        </dl>
      </Card>

      <Card padding="sm">
        <h3 className="mb-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
          Location
        </h3>
        <dl className="divide-y divide-surface-200 dark:divide-surface-800">
          <DataRow label="State" value={data.state} />
          <DataRow label="City" value={data.city} />
          <DataRow label="Physical locations" value={data.locationCount} />
        </dl>
      </Card>

      <Card padding="sm">
        <h3 className="mb-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
          Workplace Details
        </h3>
        <dl className="divide-y divide-surface-200 dark:divide-surface-800">
          <DataRow label="Remote workforce" value={data.hasRemoteWorkers} />
          <DataRow label="Union employees" value={data.hasUnionEmployees} />
          <DataRow label="Federal contractor" value={data.isFederalContractor} />
          <DataRow label="Nonprofit" value={data.isNonprofit} />
        </dl>
      </Card>
    </div>
  );
}
