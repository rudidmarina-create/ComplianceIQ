"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { signupSchema } from "@/modules/auth/schemas";
import { signUpAction } from "@/modules/auth/actions";
import type { ZodError } from "zod";

type FormErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
  _form?: string[];
};

export default function SignupPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    // Client-side validation
    const parsed = signupSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).filter(([, v]) => v !== undefined),
        ) as FormErrors,
      );
      setLoading(false);
      return;
    }

    // Server action
    const result = await signUpAction(parsed.data);

    if (!result.success) {
      setErrors(result.errors as FormErrors);
      setLoading(false);
      return;
    }

    // Sign in the user after successful signup
    try {
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({ _form: ["Account created but sign in failed. Please try logging in."] });
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({ _form: ["Account created but sign in failed. Please try logging in."] });
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {APP_NAME}
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-surface-900 dark:text-surface-100">
            Create your account
          </h1>
          <p className="mt-2 text-surface-500 dark:text-surface-400">
            Start your compliance journey today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors._form && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors._form[0]}
              </p>
            </div>
          )}

          <Input
            label="Full name"
            name="name"
            type="text"
            placeholder="Jane Smith"
            autoComplete="name"
            error={errors.name?.[0]}
            required
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="jane@company.com"
            autoComplete="email"
            error={errors.email?.[0]}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            hint="Must be at least 8 characters"
            error={errors.password?.[0]}
            required
          />

          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.[0]}
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-surface-500 dark:text-surface-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
