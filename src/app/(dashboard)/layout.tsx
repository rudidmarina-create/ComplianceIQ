import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import GlobalSearch from "@/components/search/GlobalSearch";
import { LogOut, LayoutDashboard, ClipboardList, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-lg font-bold text-brand-600 dark:text-brand-400"
            >
              {APP_NAME}
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/tasks"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
              >
                <ClipboardList className="h-4 w-4" />
                Tasks
              </Link>
              <Link
                href="/dashboard/knowledge"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
              >
                <BookOpen className="h-4 w-4" />
                Knowledge
              </Link>
            </nav>
          </div>

          {/* Global search */}
          <div className="flex flex-1 items-center justify-center px-3 sm:px-6">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-600 dark:text-surface-400">
              {session?.user?.name || session?.user?.email || "User"}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
