import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your ComplianceIQ account.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Create Account
        </h1>
        <p className="mt-2 text-surface-500 dark:text-surface-400">
          Registration coming soon.
        </p>
      </div>
    </div>
  );
}
