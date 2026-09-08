import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { CategoryGrid } from "@/components/CategoryGrid";
import { IconButton } from "@/components/IconButton";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { clearSessionCookie, getSessionUserId } from "@/lib/auth";
import { CATEGORIES } from "@/lib/categories";
import { GOVERNORATES, activeListingWhere } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function featuredWhere(now: Date) {
  return {
    isFeatured: true,
    OR: [{ featuredUntil: null }, { featuredUntil: { gt: now } }],
  };
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category.trim() : "";
  const city = typeof params.city === "string" ? params.city.trim() : "";
  const governorate = typeof params.governorate === "string" ? params.governorate.trim() : "";
  const min = Number(typeof params.min === "string" ? params.min : "");
  const max = Number(typeof params.max === "string" ? params.max : "");
  const view = typeof params.view === "string" ? params.view : "list";
  const now = new Date();

  const where: Prisma.ListingWhereInput = {
    AND: [
      activeListingWhere(now),
      q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      category ? { category } : {},
      city ? { city: { contains: city, mode: "insensitive" } } : {},
      governorate ? { governorate } : {},
      Number.isFinite(min) && min > 0 ? { price: { gte: min } } : {},
      Number.isFinite(max) && max > 0 ? { price: { lte: max } } : {},
    ],
  };

  const sessionUserId = await getSessionUserId();
  let sessionUser: { handle: string | null; name: string | null } | null = null;
  let savedIds = new Set<string>();

  if (sessionUserId) {
    try {
      sessionUser = await prisma.user.findUnique({
        where: { id: sessionUserId },
        select: { handle: true, name: true },
      });
      const favs = await prisma.favorite.findMany({
        where: { userId: sessionUserId },
        select: { listingId: true },
      });
      savedIds = new Set(favs.map((item) => item.listingId));
    } catch {
      sessionUser = null;
    }
  }

  let dbListings: {
    id: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    city: string;
    neighborhood: string | null;
    category: string;
    governorate: string;
    phone?: string | null;
    featured: boolean;
  }[] = [];
  let loadError = false;

  try {
    const rows = await prisma.listing.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 24,
      include: { user: { select: { phoneNumber: true } } },
    });

    dbListings = rows.map((row) => {
      const featured =
        row.isFeatured && (!row.featuredUntil || row.featuredUntil.getTime() > now.getTime());
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price.toString(),
        currency: row.currency,
        city: row.city,
        neighborhood: row.neighborhood,
        category: row.category,
        governorate: row.governorate,
        phone: row.user.phoneNumber,
        featured,
      };
    });
  } catch {
    loadError = true;
    dbListings = [];
  }

  const featured = dbListings.filter((item) => item.featured);
  const recent = dbListings.filter((item) => !item.featured);
  const displayName = sessionUser?.handle?.trim() || sessionUser?.name?.trim() || null;
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
          <p className="font-display text-[28px] font-bold leading-none tracking-tight text-[var(--color-espresso)]">Catch</p>
          <p className="mt-1 font-display text-[12px] italic text-[var(--color-dark-cappuccino)]">The Deal</p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Notifications" href={sessionUserId ? "/my-ads" : "/login"}>
            \u2301
          </IconButton>
          {displayName ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[88px] truncate text-xs font-semibold">{displayName}</span>
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-light-cappuccino)] text-sm font-bold">
                {initial}
              </div>
              <form action={signOut}>
                <button type="submit" className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-[11px] font-semibold">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link href="/register">Create account</Link>
              <span className="text-[var(--color-muted)]">\u00b7</span>
              <Link href="/login">Sign in</Link>
            </div>
          )}
        </div>
      </header>
      <main className="px-5 pb-8 pt-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-light-cappuccino)] px-3 py-2 text-xs font-semibold text-[var(--color-espresso)] shadow-[var(--shadow-soft)]">
          <span aria-hidden>JO</span>
          Jordan marketplace
        </p>
        <div className="mt-4">
          <SearchBar defaultValue={q} />
        </div>

        <form method="get" action="/" className="mt-4 grid grid-cols-2 gap-2">
          {q ? <input type="hidden" name="q" value={q} /> : null}
          <select name="category" defaultValue={category} className="h-10 rounded-full border border-[var(--color-border)] bg-white px-3 text-xs">
            <option value="">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.en}
              </option>
            ))}
          </select>
          <select name="governorate" defaultValue={governorate} className="h-10 rounded-full border border-[var(--color-border)] bg-white px-3 text-xs">
            <option value="">All governorates</option>
            {GOVERNORATES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input name="min" defaultValue={Number.isFinite(min) && min > 0 ? String(min) : ""} placeholder="Min price" className="h-10 rounded-full border border-[var(--color-border)] px-3 text-xs" />
          <input name="max" defaultValue={Number.isFinite(max) && max > 0 ? String(max) : ""} placeholder="Max price" className="h-10 rounded-full border border-[var(--color-border)] px-3 text-xs" />
          <input name="city" defaultValue={city} placeholder="City" className="h-10 rounded-full border border-[var(--color-border)] px-3 text-xs" />
          <button type="submit" className="h-10 rounded-full bg-[var(--color-espresso)] text-xs font-semibold text-white">
            Apply filters
          </button>
        </form>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">All Categories</h2>
              <p className="font-arabic text-xs text-[var(--color-muted)]">\u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0645</p>
            </div>
            <Link href="/listings" className="text-xs font-bold">
              Directory \u2192
            </Link>
          </div>
          <CategoryGrid />
        </section>

        {loadError ? (
          <p className="mt-6 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-light-cappuccino)] p-4 text-sm">
            Listings could not be loaded. Please try again.
          </p>
        ) : null}

        {featured.length > 0 ? (
          <section className="mt-7">
            <h2 className="font-display text-lg font-bold">Featured</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {featured.map((item) => (
                <ListingCard
                  key={item.id}
                  signedIn={Boolean(sessionUserId)}
                  listing={{
                    id: item.id,
                    title: item.title,
                    subtitle: item.description,
                    price: item.price,
                    currency: item.currency,
                    neighborhood: item.neighborhood || item.city,
                    featured: true,
                    phone: item.phone,
                    saved: savedIds.has(item.id),
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-7">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Recent Classifieds Nearby</h2>
              <p className="text-xs font-medium text-[var(--color-muted)]">Active listings only</p>
            </div>
            <Link href={view === "map" ? "/" : "/?view=map"} className="text-xs font-bold">
              {view === "map" ? "List view" : "Map view"}
            </Link>
          </div>
          {dbListings.length === 0 && !loadError ? (
            <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-light-cappuccino)] p-6 text-sm text-[var(--color-muted)]">
              No active listings match this search.
            </div>
          ) : view === "map" ? (
            <div className="space-y-2">
              {dbListings.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="block rounded-[16px] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-soft)]"
                >
                  <p className="text-xs text-[var(--color-muted)]">
                    {item.governorate} \u00b7 {item.city}
                    {item.neighborhood ? ` \u00b7 ${item.neighborhood}` : ""}
                  </p>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm">
                    {item.price} {item.currency}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {recent.map((item) => (
                <ListingCard
                  key={item.id}
                  signedIn={Boolean(sessionUserId)}
                  listing={{
                    id: item.id,
                    title: item.title,
                    subtitle: item.description,
                    price: item.price,
                    currency: item.currency,
                    neighborhood: item.neighborhood || item.city,
                    featured: false,
                    phone: item.phone,
                    saved: savedIds.has(item.id),
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav active="explore" />
    </AppShell>
  );
}
