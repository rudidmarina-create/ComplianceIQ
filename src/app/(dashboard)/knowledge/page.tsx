import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description: "Learn about employment laws.",
};

export default function KnowledgePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
        Knowledge Base
      </h1>
      <p className="mt-2 text-surface-500 dark:text-surface-400">
        Employment law articles will appear here.
      </p>
    </div>
  );
}
