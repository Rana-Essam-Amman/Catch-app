export function IconButton({
  children,
  label,
  title,
  type = "button",
}: {
  children: React.ReactNode;
  label: string;
  title?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={title}
      className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      {children}
    </button>
  );
}
