import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Your compliance tasks.",
};

export default function TasksPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
        Tasks
      </h1>
      <p className="mt-2 text-surface-500 dark:text-surface-400">
        Your compliance tasks will appear here.
      </p>
    </div>
  );
}
