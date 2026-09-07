import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { CategoryGrid } from "@/components/CategoryGrid";
import { IconButton } from "@/components/IconButton";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { DEMO_LISTINGS } from "@/lib/demo-listings";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  let dbListings: {
    title: string;
    description: string;
    price: string;
    currency: string;
    city: string;
    category: string;
    phone?: string | null;
  }[] = [];

  try {
    const rows = await prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { phoneNumber: true } } },
    });

    dbListings = rows.map((row) => ({
      title: row.title,
      description: row.description,
      price: row.price.toString(),
      currency: row.currency,
      city: row.city,
      category: row.category,
      phone: row.user.phoneNumber,
    }));
  } catch {
    dbListings = [];
  }

  const feed =
    dbListings.length >= 2
      ? dbListings.map((item, i) => ({
          ...item,
          featured: i === 0,
          image: DEMO_LISTINGS[i % DEMO_LISTINGS.length].image,
          neighborhood: item.city,
          subtitle: item.description,
        }))
      : DEMO_LISTINGS.map((item) => ({
          ...item,
          neighborhood: item.city,
          subtitle: item.description,
          phone: null as string | null,
        }));

  const sessionUserId = await getSessionUserId();

  let sessionUser: { handle: string | null; name: string | null } | null =
    null;

  if (sessionUserId) {
    try {
      sessionUser = await prisma.user.findUnique({
        where: { id: sessionUserId },
        select: {
          handle: true,
          name: true,
        },
      });
    } catch {
      sessionUser = null;
    }
  }

  const displayName =
    sessionUser?.handle?.trim() ||
    sessionUser?.name?.trim() ||
    null;

  const initial = displayName ? displayName.slice(0, 1).toUpperCase() : null;

  async function signOut() {
    "use server";
    await clearSessionCookie();
    redirect("/");
  }

  return (
    <AppShell className="pb-32">
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <p className="font-display text-[28px] font-bold leading-none tracking-tight text-[var(--color-primary)]">
            Catch
          </p>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.28em] text-[var(--color-muted)]">
            THE DEAL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Notifications" title="Coming soon">
            ⌁
          </IconButton>
          {displayName ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[88px] truncate text-xs font-semibold text-[var(--color-primary)]">
                {displayName}
              </span>
              <div
                className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-warm-surface)] text-sm font-bold"
                aria-label={displayName}
              >
                {initial}
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[11px] font-semibold"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link href="/register">Create account</Link>
              <span className="text-[var(--color-muted-secondary)]">·</span>
              <Link href="/login">Sign in</Link>
            </div>
          )}
        </div>
      </header>

      <main className="px-5 pb-8 pt-4">
        <button
          type="button"
          title="Coming soon"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <span aria-hidden>🇯🇴</span>
          Jordan • Amman
          <span aria-hidden className="text-[var(--color-muted-secondary)]">
            ▾
          </span>
        </button>

        <div className="mt-4">
          <SearchBar />
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--color-primary)]">
                All Categories
              </h2>
              <p className="font-arabic text-xs text-[var(--color-muted)]">
                جميع الأقسام (16)
              </p>
            </div>
            <Link
              href="/listings"
              className="text-xs font-bold text-[var(--color-primary)]"
            >
              Directory →
            </Link>
          </div>
          <CategoryGrid />
        </section>

        <section className="mt-7">
          <div className="mb-3">
            <h2 className="font-display text-lg font-bold text-[var(--color-primary)]">
              Recent Classifieds Nearby
            </h2>
            <p className="text-xs font-medium text-[var(--color-muted)]">
              Direct peer-to-peer contacts
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {feed.map((item, index) => (
              <ListingCard key={`${item.title}-${index}`} listing={item} />
            ))}
          </div>
        </section>
      </main>

      <div className="pointer-events-none fixed bottom-[88px] left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-5">
        <div className="pointer-events-auto mx-auto flex w-fit items-center gap-1 rounded-full bg-[rgba(35,31,32,0.92)] px-2 py-2 text-white shadow-[var(--shadow-float)]">
          <button
            type="button"
            title="Coming soon"
            className="rounded-full px-4 py-2 text-xs font-semibold"
          >
            Map View
          </button>
          <span className="h-4 w-px bg-white/20" aria-hidden />
          <button
            type="button"
            title="Coming soon"
            className="rounded-full px-4 py-2 text-xs font-semibold"
          >
            Filters
          </button>
        </div>
      </div>

      <BottomNav active="explore" />
    </AppShell>
  );
}
