import Link from "next/link";

export function BottomNav({
  active,
}: {
  active?: "explore" | "categories" | "post" | "my-ads";
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-background)_95%,white)] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(35,31,32,0.04)]">
      <div className="relative grid grid-cols-5 items-end px-2 pb-2 pt-2">
        <Tab href="/" icon="🧭" label="Explore" active={active === "explore"} />
        <Tab href="/listings" icon="▦" label="Categories" active={active === "categories"} />
        <div className="flex flex-col items-center">
          <Link href="/post" aria-label="Post Ad" className="-mt-7 flex h-11 w-11 items-center justify-center rounded-full border-4 border-[var(--color-background)] bg-[var(--color-primary)] text-xl font-light text-white shadow-[0_6px_16px_rgba(35,31,32,0.2)]">+</Link>
          <span className="mt-1 text-[10px] font-semibold text-[var(--color-primary)]">Post Ad</span>
        </div>
        <Tab icon="💬" label="Messages" comingSoon />
        <Tab href="/my-ads" icon="🏪" label="My Ads" active={active === "my-ads"} />
      </div>
    </nav>
  );
}

function Tab({
  icon,
  label,
  active,
  href,
  comingSoon,
}: {
  icon: string;
  label: string;
  active?: boolean;
  href?: string;
  comingSoon?: boolean;
}) {
  const className = `flex flex-col items-center gap-0.5 pb-1 ${active ? "text-[var(--color-primary)]" : "text-[var(--color-muted-secondary)]"}`;
  const inner = (
    <>
      <span className="relative text-lg">{icon}</span>
      <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
    </>
  );
  if (href) return <Link href={href} className={className}>{inner}</Link>;
  return (
    <button type="button" title={comingSoon ? "Coming soon" : undefined} aria-label={comingSoon ? `${label} coming soon` : label} className={className}>
      {inner}
    </button>
  );
}
