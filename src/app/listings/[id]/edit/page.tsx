import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { getSessionUserId } from "@/lib/auth";
import { listingState } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

import { EditListingForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();
  if (listing.userId !== userId) redirect("/my-ads");

  const state = listingState(listing);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] pb-28">
      <header className="px-5 pt-6">
        <Link href="/my-ads" className="text-sm font-medium text-[#6f665e]">← My Ads</Link>
        <h1 className="mt-4 text-xl font-semibold text-[#191714]">Edit Ad</h1>
      </header>
      <main className="px-5 pt-5">
        {state === "active" ? (
          <p className="rounded-[16px] border border-[#eae6df] bg-white px-4 py-3 text-sm text-[#514b45]">
            Editing an active listing will cost 1 JOD. Payment is not available yet, so active ads cannot be changed in this phase.
          </p>
        ) : state === "sold" ? (
          <p className="rounded-[16px] border border-[#eae6df] bg-white px-4 py-3 text-sm">Sold listings cannot be edited.</p>
        ) : (
          <EditListingForm
            listing={{
              id: listing.id,
              title: listing.title,
              description: listing.description,
              price: listing.price.toString(),
              currency: listing.currency,
              category: listing.category,
              governorate: listing.governorate,
              city: listing.city,
              neighborhood: listing.neighborhood,
            }}
          />
        )}
      </main>
      <BottomNav active="my-ads" />
    </div>
  );
}
