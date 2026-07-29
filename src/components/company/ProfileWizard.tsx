"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useProfileWizard,
  ProfileWizardProvider,
} from "@/components/company/ProfileWizardContext";
import CompanyBasicsStep from "@/components/company/steps/CompanyBasicsStep";
import LocationStep from "@/components/company/steps/LocationStep";
import WorkplaceDetailsStep from "@/components/company/steps/WorkplaceDetailsStep";
import ReviewStep from "@/components/company/steps/ReviewStep";
import {
  companyBasicsSchema,
  locationSchema,
  workplaceDetailsSchema,
  wizardDataSchema,
} from "@/modules/company/schemas";
import { saveProfileWizard } from "@/modules/company/actions";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { WizardData } from "@/modules/company/schemas";

// ── Step config ────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Location" },
  { id: 3, label: "Details" },
  { id: 4, label: "Review" },
];

// ── Validator per step ─────────────────────────────────────────────

function validateStep(step: number, data: Partial<WizardData>): Record<string, string> {
  try {
    switch (step) {
      case 1:
        companyBasicsSchema.parse(data);
        break;
      case 2:
        locationSchema.parse(data);
        break;
      case 3:
        workplaceDetailsSchema.parse(data);
        break;
      case 4:
        wizardDataSchema.parse(data);
        break;
    }
    return {};
  } catch (err: unknown) {
    const zodErr = err as { flatten?: () => { fieldErrors: Record<string, string[]> } };
    if (zodErr?.flatten) {
      const fieldErrors: Record<string, string> = {};
      const flat = zodErr.flatten().fieldErrors;
      for (const [key, msgs] of Object.entries(flat)) {
        if (msgs && msgs.length > 0) fieldErrors[key] = msgs[0];
      }
      return fieldErrors;
    }
    return {};
  }
}

// ── Inner Wizard (uses context) ────────────────────────────────────

interface InnerWizardProps {
  companyId: string;
  onSuccess: () => void;
}

function InnerWizard({ companyId, onSuccess }: InnerWizardProps) {
  const router = useRouter();
  const { state, nextStep, prevStep, goToStep } = useProfileWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(state.step, state.data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    nextStep();
  }, [state.step, state.data, nextStep]);

  const handleBack = useCallback(() => {
    setErrors({});
    prevStep();
  }, [prevStep]);

  const handleSubmit = useCallback(async () => {
    // Full validation
    const stepErrors = validateStep(4, state.data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await saveProfileWizard(companyId, state.data as WizardData);
      onSuccess();
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
      setSubmitting(false);
    }
  }, [state.data, companyId, onSuccess, router]);

  // ── Render step content ──────────────────────────────────────────

  function renderStep() {
    switch (state.step) {
      case 1:
        return <CompanyBasicsStep errors={errors} />;
      case 2:
        return <LocationStep errors={errors} />;
      case 3:
        return <WorkplaceDetailsStep />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  }

  const isLastStep = state.step === 4;
  const isFirstStep = state.step === 1;

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress indicator */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center">
          {STEPS.map((step, idx) => {
            const isCurrent = step.id === state.step;
            const isComplete = step.id < state.step;

            return (
              <li
                key={step.id}
                className={`flex items-center ${
                  idx < STEPS.length - 1 ? "flex-1" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      isComplete
                        ? "bg-brand-600 text-white"
                        : isCurrent
                          ? "border-2 border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"
                          : "border-2 border-surface-300 bg-white text-surface-400 dark:border-surface-700 dark:bg-surface-900"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <span
                    className={`hidden text-sm font-medium sm:inline ${
                      isCurrent
                        ? "text-surface-900 dark:text-surface-100"
                        : "text-surface-500 dark:text-surface-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      step.id < state.step
                        ? "bg-brand-600"
                        : "bg-surface-300 dark:bg-surface-700"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <Card padding="lg">
        {renderStep()}

        {/* Submit error */}
        {submitError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {!isFirstStep && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={submitting}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <span className="text-xs text-surface-400">
                Step {state.step} of 4
              </span>
            )}
            {isLastStep ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
              >
                {submitting ? "Saving…" : "Complete Profile"}
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Exported Wizard (with provider) ────────────────────────────────

interface ProfileWizardProps {
  companyId: string;
  editData?: Partial<WizardData>;
  onSuccess?: () => void;
}

export default function ProfileWizard({
  companyId,
  editData,
  onSuccess = () => {},
}: ProfileWizardProps) {
  return (
    <ProfileWizardProvider editData={editData}>
      <InnerWizard companyId={companyId} onSuccess={onSuccess} />
    </ProfileWizardProvider>
  );
}
