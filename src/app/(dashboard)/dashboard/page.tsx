import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your compliance overview.",
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
        Dashboard
      </h1>
      <p className="mt-2 text-surface-500 dark:text-surface-400">
        Your compliance overview will appear here.
      </p>
    </div>
  );
}
