import Link from "next/link";
import { redirect } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORIES } from "@/lib/categories";
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
  }[] = [];

  try {
    const rows = await prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    dbListings = rows.map((row) => ({
      title: row.title,
      description: row.description,
      price: row.price.toString(),
      currency: row.currency,
      city: row.city,
      category: row.category,
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

  async function signOut() {
    "use server";

    await clearSessionCookie();
    redirect("/");
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] pb-28">
      <header className="flex items-start justify-between px-5 pt-6">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-[#191714]">
            Catch
          </div>
          <div className="mt-1 text-sm text-[#77716b]">
            Find what you need. Sell what you don&apos;t.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7e0d8] bg-white text-lg shadow-sm"
          >
            🔔
          </button>

          {displayName ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[90px] truncate text-sm font-medium text-[#191714]">
                {displayName}
              </span>

              <div
                className="h-10 w-10 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80)",
                }}
                aria-label={displayName}
              />

              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-[#e7e0d8] bg-white px-3 py-2 text-xs font-medium text-[#191714] shadow-sm"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-[#191714]">
                <Link href="/register" className="hover:underline">
                  Create account
                </Link>
                <span className="text-[#b0aaa4]">·</span>
                <Link href="/login" className="hover:underline">
                  Sign in
                </Link>
              </div>

              <div
                className="h-10 w-10 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80)",
                }}
                aria-hidden="true"
              />
            </>
          )}
        </div>
      </header>

      <main className="px-5">
        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#191714]">
              Explore
            </h1>
            <Link
              href="/listings"
              className="text-sm font-medium text-[#6f665e]"
            >
              See all
            </Link>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/listings?category=${category.slug}`}
                className="whitespace-nowrap rounded-full border border-[#e7e0d8] bg-white px-4 py-2 text-sm text-[#514b45]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            {feed.map((item, index) => (
              <ListingCard
                key={`${item.title}-${index}`}
                listing={item}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
