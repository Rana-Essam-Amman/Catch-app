import Link from "next/link";

export function IconButton({
  children,
  label,
  title,
  type = "button",
  href,
}: {
  children: React.ReactNode;
  label: string;
  title?: string;
  type?: "button" | "submit";
  href?: string;
}) {
  const className =
    "flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-primary)] shadow-[var(--shadow-soft)]";
  if (href) {
    return (
      <Link href={href} aria-label={label} title={title} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} aria-label={label} title={title} className={className}>
      {children}
    </button>
  );
}
