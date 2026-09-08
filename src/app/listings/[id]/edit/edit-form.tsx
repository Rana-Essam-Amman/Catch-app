"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CATEGORIES } from "@/lib/categories";
import { GOVERNORATES } from "@/lib/listings";

export function EditListingForm({
  listing,
}: {
  listing: {
    id: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    category: string;
    governorate: string;
    city: string;
    neighborhood: string | null;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const res = await fetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not save changes.");
      return;
    }
    router.push("/my-ads");
  }

  return (
    <form action={onSubmit} className="space-y-3">
      {error ? <p className="rounded-[16px] border border-[#eae6df] bg-white px-3 py-2 text-sm text-[#8a2f2f]">{error}</p> : null}
      <input name="title" defaultValue={listing.title} className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
      <textarea name="description" defaultValue={listing.description} className="min-h-28 w-full rounded-2xl border border-[#eae6df] bg-white px-4 py-3 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input name="price" defaultValue={listing.price} className="h-12 rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
        <input name="currency" defaultValue={listing.currency} className="h-12 rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
      </div>
      <select name="category" defaultValue={listing.category} className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm">
        {CATEGORIES.map((item) => (
          <option key={item.slug} value={item.slug}>{item.en}</option>
        ))}
      </select>
      <select name="governorate" defaultValue={listing.governorate} className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm">
        {GOVERNORATES.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <input name="city" defaultValue={listing.city} className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
      <input name="neighborhood" defaultValue={listing.neighborhood ?? ""} className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
      <button disabled={pending} className="h-12 w-full rounded-full bg-[#231F20] text-sm font-semibold text-[#fbf9f6]">{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
