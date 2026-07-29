"use client";

import { useProfileWizard } from "@/components/company/ProfileWizardContext";

interface ToggleProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function Toggle({ label, description, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
          value
            ? "bg-brand-600"
            : "bg-surface-300 dark:bg-surface-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function WorkplaceDetailsStep() {
  const { state, updateData } = useProfileWizard();

  const toggles = [
    {
      key: "hasRemoteWorkers" as const,
      label: "Remote workforce?",
      description: "Do you have employees working remotely or from home?",
    },
    {
      key: "hasUnionEmployees" as const,
      label: "Union employees?",
      description: "Are any of your employees represented by a labor union?",
    },
    {
      key: "isFederalContractor" as const,
      label: "Federal contractor?",
      description: "Does your company hold contracts with the US federal government?",
    },
    {
      key: "isNonprofit" as const,
      label: "Nonprofit?",
      description: "Is your organization a registered nonprofit?",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
          Workplace Details
        </h2>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          These details help us identify additional compliance obligations.
        </p>
      </div>

      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        {toggles.map(({ key, label, description }) => (
          <Toggle
            key={key}
            label={label}
            description={description}
            value={state.data[key] ?? false}
            onChange={(val) => updateData({ [key]: val })}
          />
        ))}
      </div>
    </div>
  );
}
