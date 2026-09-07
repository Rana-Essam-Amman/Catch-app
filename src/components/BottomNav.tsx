import Link from "next/link";

export function BottomNav({ active }: { active?: "explore" | "categories" }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[#eae6df] bg-[#fbf9f6]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="relative grid grid-cols-5 items-end px-2 pb-2 pt-2">
        <Tab href="/" icon="🧭" label="Explore" active={active === "explore"} />
        <Tab href="/listings" icon="▦" label="Categories" active={active === "categories"} />
        <div className="flex flex-col items-center">
          <button type="button" aria-label="Post Ad coming soon" title="Coming soon" className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#231F20] text-2xl font-light text-[#fbf9f6] shadow-lg">
            +
          </button>
          <span className="mt-1 text-[10px] font-semibold text-[#231F20]">Post Ad</span>
        </div>
        <Tab icon="💬" label="Messages" comingSoon />
        <Tab icon="🏪" label="My Ads" comingSoon />
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
  const className = `flex flex-col items-center gap-0.5 pb-1 ${active ? "text-[#231F20]" : "text-[#231F20]/45"}`;
  const inner = (
    <>
      <span className="relative text-lg">{icon}</span>
      <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" title={comingSoon ? "Coming soon" : undefined} aria-label={comingSoon ? `${label} coming soon` : label} className={className}>
      {inner}
    </button>
  );
}
