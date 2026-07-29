import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <nav className="flex gap-6 text-sm text-surface-500 dark:text-surface-400">
            <Link
              href="/privacy"
              className="transition-colors hover:text-surface-700 dark:hover:text-surface-300"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-surface-700 dark:hover:text-surface-300"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
