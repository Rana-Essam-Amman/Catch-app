import Link from "next/link";
import { notFound } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { CATEGORIES } from "@/lib/categories";
import { listingState } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function telHref(phone?: string | null) {
  if (!phone) return null;
  const compact = phone.replace(/\s+/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(compact)) return null;
  return `tel:${compact}`;
}

function waHref(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

export default async function ListingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { user: { select: { handle: true, name: true, phoneNumber: true } } },
  });

  if (!listing) notFound();

  const state = listingState(listing);
  const category = CATEGORIES.find((item) => item.slug === listing.category);
  const phone = listing.user.phoneNumber;
  const call = telHref(phone);
  const wa = waHref(phone);
  const seller = listing.user.handle || listing.user.name || "Seller";
  const place = [listing.neighborhood, listing.city, listing.governorate].filter(Boolean).join(" • ");

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] pb-28">
      <header className="px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-[#6f665e]">← Explore</Link>
        <h1 className="mt-4 text-2xl font-semibold text-[#191714]">{listing.title}</h1>
        <p className="mt-2 text-xl font-bold text-[#231F20]">{Number(listing.price).toLocaleString("en-JO")} {listing.currency}</p>
      </header>
      <main className="space-y-4 px-5 pt-5">
        {state !== "active" ? (
          <p className="rounded-[20px] border border-[#eae6df] bg-white px-4 py-3 text-sm font-semibold text-[#231F20]">
            {state === "sold" ? "SOLD — no longer available" : "EXPIRED"}
          </p>
        ) : null}
        <section className="rounded-[20px] border border-[#eae6df] bg-white p-4 text-sm text-[#514b45]">
          <p>{listing.description}</p>
          <dl className="mt-4 space-y-1 text-xs">
            <div>Category: {category?.en || listing.category}</div>
            <div>Location: {place}</div>
            <div>Seller: {seller}</div>
            {listing.expiresAt ? <div>Expires: {listing.expiresAt.toISOString().slice(0, 10)}</div> : null}
          </dl>
        </section>
        {state === "active" ? (
          <div className="flex gap-2">
            {call ? (
              <a href={call} className="flex-1 rounded-full bg-[#231F20] py-3 text-center text-sm font-semibold text-[#fbf9f6]">Call</a>
            ) : (
              <span className="flex-1 rounded-full bg-[#231F20]/40 py-3 text-center text-sm font-semibold text-[#fbf9f6]">Call unavailable</span>
            )}
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-[#25d366] py-3 text-center text-sm font-semibold text-white">WhatsApp</a>
            ) : (
              <span className="flex-1 rounded-full bg-[#25d366]/40 py-3 text-center text-sm font-semibold text-white">WhatsApp unavailable</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#77716b]">Contact actions are disabled for this listing.</p>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
