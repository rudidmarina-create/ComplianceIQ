export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {children}
    </div>
  );
}
