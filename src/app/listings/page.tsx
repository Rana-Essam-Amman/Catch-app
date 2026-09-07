import Link from "next/link";

import { BottomNav } from "@/components/BottomNav";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORIES } from "@/lib/categories";
import { DEMO_LISTINGS } from "@/lib/demo-listings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const selected = CATEGORIES.find((item) => item.slug === category);
  const placeholder = DEMO_LISTINGS[0]?.image;

  let error = false;
  let rows: {
    title: string;
    description: string;
    price: string;
    currency: string;
    city: string;
    phone: string | null;
  }[] = [];

  try {
    const data = await prisma.listing.findMany({
      where: selected ? { category: selected.slug } : undefined,
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { user: { select: { phoneNumber: true } } },
    });
    rows = data.map((row) => ({
      title: row.title,
      description: row.description,
      price: row.price.toString(),
      currency: row.currency,
      city: row.city,
      phone: row.user.phoneNumber,
    }));
  } catch {
    error = true;
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] pb-28">
      <header className="px-5 pt-6">
        <p className="text-2xl font-semibold tracking-tight text-[#191714]">Catch</p>
        <h1 className="mt-4 text-xl font-semibold text-[#191714]">
          {selected ? selected.en : "All listings"}
        </h1>
        {selected ? (
          <p className="mt-1 text-sm text-[#77716b]" style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>
            {selected.ar}
          </p>
        ) : null}
      </header>

      <main className="px-5 pt-5">
        {error ? (
          <p className="rounded-[20px] border border-[#eae6df] bg-white p-4 text-sm text-[#77716b]">
            Listings are unavailable right now.
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-[20px] border border-[#eae6df] bg-white p-4 text-sm text-[#77716b]">
            No listings in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {rows.map((item, index) => (
              <ListingCard
                key={`${item.title}-${index}`}
                listing={{
                  title: item.title,
                  subtitle: item.description,
                  price: item.price,
                  currency: item.currency,
                  neighborhood: item.city,
                  image: placeholder,
                  phone: item.phone,
                }}
              />
            ))}
          </div>
        )}

        <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#6f665e]">
          Back to Explore
        </Link>
      </main>

      <BottomNav active="categories" />
    </div>
  );
}
