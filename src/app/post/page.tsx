"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BottomNav } from "@/components/BottomNav";
import { CATEGORIES } from "@/lib/categories";
import { GOVERNORATES } from "@/lib/listings";

export default function PostAdPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) {
      setError(data.error || "Could not publish listing.");
      return;
    }
    router.push(`/listings/${data.id}`);
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] pb-28">
      <header className="px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-[#6f665e]">
          ← Explore
        </Link>
        <h1 className="mt-4 text-xl font-semibold text-[#191714]">Post Ad</h1>
        <p className="mt-1 text-sm text-[#77716b]">Active ads last 30 days. Limit: 5 at a time.</p>
      </header>

      <form action={onSubmit} className="space-y-3 px-5 pt-5">
        {error ? (
          <p className="rounded-[16px] border border-[#eae6df] bg-white px-3 py-2 text-sm text-[#8a2f2f]">
            {error}
          </p>
        ) : null}
        <input name="title" required placeholder="Title" className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
        <textarea name="description" required placeholder="Description" className="min-h-28 w-full rounded-2xl border border-[#eae6df] bg-white px-4 py-3 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input name="price" required placeholder="Price" inputMode="decimal" className="h-12 rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
          <input name="currency" defaultValue="JOD" className="h-12 rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
        </div>
        <select name="category" required className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm">
          <option value="">Category</option>
          {CATEGORIES.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.en}
            </option>
          ))}
        </select>
        <select name="governorate" required className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm">
          <option value="">Governorate</option>
          {GOVERNORATES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input name="city" required placeholder="City" className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
        <input name="neighborhood" placeholder="Neighborhood (optional)" className="h-12 w-full rounded-2xl border border-[#eae6df] bg-white px-4 text-sm" />
        <button type="submit" disabled={pending} className="h-12 w-full rounded-full bg-[#231F20] text-sm font-semibold text-[#fbf9f6] disabled:opacity-60">
          {pending ? "Publishing…" : "Publish"}
        </button>
      </form>

      <BottomNav active="post" />
    </div>
  );
}
