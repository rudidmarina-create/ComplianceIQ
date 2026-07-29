import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your ComplianceIQ account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Sign In
        </h1>
        <p className="mt-2 text-surface-500 dark:text-surface-400">
          Authentication coming soon.
        </p>
      </div>
    </div>
  );
}
