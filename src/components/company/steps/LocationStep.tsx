"use client";

import { Input } from "@/components/ui/input";
import { US_STATES } from "@/modules/company/schemas";
import { useProfileWizard } from "@/components/company/ProfileWizardContext";

interface Props {
  errors: Record<string, string>;
}

export default function LocationStep({ errors }: Props) {
  const { state, updateData } = useProfileWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
          Location
        </h2>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Where is your business primarily located? State determines many employment laws.
        </p>
      </div>

      <div className="w-full">
        <label
          htmlFor="state"
          className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300"
        >
          Primary state
        </label>
        <select
          id="state"
          name="state"
          value={state.data.state || ""}
          onChange={(e) => updateData({ state: e.target.value })}
          className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
          required
        >
          <option value="" disabled>
            Select a state…
          </option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.state && (
          <p className="mt-1 text-xs text-red-500">{errors.state}</p>
        )}
      </div>

      <Input
        label="Primary city"
        name="city"
        type="text"
        placeholder="e.g., San Francisco"
        value={state.data.city || ""}
        onChange={(e) => updateData({ city: e.target.value })}
        hint="Optional — helps refine local requirements"
      />

      <Input
        label="Number of physical locations"
        name="locationCount"
        type="number"
        placeholder="1"
        min={1}
        value={
          state.data.locationCount !== undefined
            ? String(state.data.locationCount)
            : "1"
        }
        onChange={(e) =>
          updateData({
            locationCount:
              e.target.value === ""
                ? (undefined as unknown as number)
                : parseInt(e.target.value, 10),
          })
        }
        hint="Include offices, retail spaces, warehouses, etc."
        error={errors.locationCount}
        required
      />
    </div>
  );
}
