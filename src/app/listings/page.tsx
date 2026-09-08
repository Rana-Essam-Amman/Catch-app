import Link from "next/link";

import { BottomNav } from "@/components/BottomNav";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORIES } from "@/lib/categories";
import { activeListingWhere } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const selected = CATEGORIES.find((item) => item.slug === category);

  let error = false;
  let rows: {
    id: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    city: string;
    phone: string | null;
  }[] = [];

  try {
    const data = await prisma.listing.findMany({
      where: {
        ...activeListingWhere(),
        ...(selected ? { category: selected.slug } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { user: { select: { phoneNumber: true } } },
    });
    rows = data.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price.toString(),
      currency: row.currency,
      city: row.city || row.governorate || "",
      phone: row.user.phoneNumber,
    }));
  } catch {
    error = true;
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#ffffff] pb-28">
      <header className="px-5 pt-6">
        <p className="font-display text-2xl font-semibold tracking-tight text-[#3A2418]">Catch</p>
        <p className="font-display text-xs italic text-[#8B654D]">The Deal</p>
        <h1 className="mt-4 text-xl font-semibold text-[#3A2418]">{selected ? selected.en : "All listings"}</h1>
        {selected ? (
          <p className="mt-1 font-arabic text-sm text-[#8A7568]">{selected.ar}</p>
        ) : null}
      </header>
      <main className="px-5 pt-5">
        {error ? (
          <p className="rounded-[20px] border border-[#EADFD7] bg-white p-4 text-sm text-[#8A7568]">Listings are unavailable right now.</p>
        ) : rows.length === 0 ? (
          <p className="rounded-[20px] border border-[#EADFD7] bg-[#F3E9E1] p-4 text-sm text-[#8A7568]">No listings in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {rows.map((item) => (
              <ListingCard
                key={item.id}
                listing={{
                  id: item.id,
                  title: item.title,
                  subtitle: item.description,
                  price: item.price,
                  currency: item.currency,
                  neighborhood: item.city,
                  phone: item.phone,
                }}
              />
            ))}
          </div>
        )}
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#8A7568]">Back to Explore</Link>
      </main>
      <BottomNav active="categories" />
    </div>
  );
}
