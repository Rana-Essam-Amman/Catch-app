export function AppShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto min-h-screen w-full max-w-[430px] bg-[var(--color-background)] text-[var(--color-primary)] ${className}`}
    >
      {children}
    </div>
  );
}
