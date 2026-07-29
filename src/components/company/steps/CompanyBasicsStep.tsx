"use client";

import { Input } from "@/components/ui/input";
import { INDUSTRIES } from "@/modules/company/schemas";
import { useProfileWizard } from "@/components/company/ProfileWizardContext";

interface Props {
  errors: Record<string, string>;
}

export default function CompanyBasicsStep({ errors }: Props) {
  const { state, updateData } = useProfileWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
          Company Basics
        </h2>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Tell us about your business so we can determine which regulations apply.
        </p>
      </div>

      <Input
        label="Company name"
        name="companyName"
        type="text"
        placeholder="Acme Inc."
        value={state.data.companyName || ""}
        onChange={(e) => updateData({ companyName: e.target.value })}
        error={errors.companyName}
        required
      />

      <div className="w-full">
        <label
          htmlFor="industry"
          className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300"
        >
          Industry
        </label>
        <select
          id="industry"
          name="industry"
          value={state.data.industry || ""}
          onChange={(e) => updateData({ industry: e.target.value })}
          className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
          required
        >
          <option value="" disabled>
            Select an industry…
          </option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        {errors.industry && (
          <p className="mt-1 text-xs text-red-500">{errors.industry}</p>
        )}
      </div>

      <Input
        label="Number of employees"
        name="employeeCount"
        type="number"
        placeholder="e.g., 25"
        min={1}
        value={
          state.data.employeeCount !== undefined
            ? String(state.data.employeeCount)
            : ""
        }
        onChange={(e) =>
          updateData({
            employeeCount:
              e.target.value === "" ? (undefined as unknown as number) : parseInt(e.target.value, 10),
          })
        }
        error={errors.employeeCount}
        required
      />
    </div>
  );
}
