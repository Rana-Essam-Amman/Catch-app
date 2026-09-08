import Link from "next/link";
import { redirect } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { getSessionUserId } from "@/lib/auth";
import { listingState } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

import { markListingSold } from "./actions";

export const dynamic = "force-dynamic";

export default async function MyAdsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const rows = await prisma.listing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const groups = {
    active: rows.filter((row) => listingState(row) === "active"),
    expired: rows.filter((row) => listingState(row) === "expired"),
    sold: rows.filter((row) => listingState(row) === "sold"),
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] pb-28">
      <header className="px-5 pt-6">
        <h1 className="text-xl font-semibold text-[#191714]">My Ads</h1>
        <p className="mt-1 text-sm text-[#77716b]">{groups.active.length}/5 active slots in use</p>
      </header>
      <main className="space-y-6 px-5 pt-5">
        <Group title={`Active (${groups.active.length})`} rows={groups.active} actions="active" />
        <Group title={`Expired (${groups.expired.length})`} rows={groups.expired} actions="expired" />
        <Group title={`Sold (${groups.sold.length})`} rows={groups.sold} actions="sold" />
      </main>
      <BottomNav active="my-ads" />
    </div>
  );
}

function Group({
  title,
  rows,
  actions,
}: {
  title: string;
  rows: { id: string; title: string; price: { toString(): string }; currency: string }[];
  actions: "active" | "expired" | "sold";
}) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-[#191714]">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-[16px] border border-[#eae6df] bg-white px-4 py-3 text-sm text-[#77716b]">None</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <article key={row.id} className="rounded-[16px] border border-[#eae6df] bg-white p-3">
              <Link href={`/listings/${row.id}`} className="block">
                <p className="text-sm font-semibold text-[#191714]">{row.title}</p>
                <p className="text-xs text-[#77716b]">{row.price.toString()} {row.currency}</p>
              </Link>
              {actions === "active" ? (
                <div className="mt-3 flex gap-2">
                  <Link href={`/listings/${row.id}/edit`} className="rounded-full border border-[#eae6df] px-3 py-1.5 text-xs font-semibold">Edit</Link>
                  <form action={markListingSold}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="rounded-full bg-[#231F20] px-3 py-1.5 text-xs font-semibold text-white">Mark Sold</button>
                  </form>
                </div>
              ) : actions === "expired" ? (
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-[#f4f1ea] px-3 py-1.5 text-xs font-semibold">Expired</span>
                  <Link href={`/listings/${row.id}/edit`} className="rounded-full border border-[#eae6df] px-3 py-1.5 text-xs font-semibold">Edit</Link>
                </div>
              ) : (
                <span className="mt-3 inline-block rounded-full bg-[#f4f1ea] px-3 py-1.5 text-xs font-semibold">Sold</span>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
