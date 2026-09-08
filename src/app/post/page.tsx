"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BottomNav } from "@/components/BottomNav";
import { CATEGORIES } from "@/lib/categories";

type CountryRow = { id: string; name: string; code: string; currency: string };
type RegionRow = { id: string; name: string; nameAr: string; countryId: string };

export default function PostAdPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [countryId, setCountryId] = useState("");
  const [countryCode, setCountryCode] = useState("");

  useEffect(() => {
    fetch("/api/geo?type=countries")
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data.rows) ? data.rows : [];
        setCountries(rows);
        const first = rows[0];
        if (first) {
          setCountryId(first.id);
          setCountryCode(first.code);
        }
      })
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (!countryId) {
      setRegions([]);
      return;
    }
    fetch(`/api/geo?type=regions&countryId=${encodeURIComponent(countryId)}`)
      .then((res) => res.json())
      .then((data) => setRegions(Array.isArray(data.rows) ? data.rows : []))
      .catch(() => setRegions([]));
  }, [countryId]);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, countryCode }),
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
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#ffffff] pb-28">
      <header className="px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-[#8A7568]">
          ← Explore
        </Link>
        <h1 className="mt-4 text-xl font-semibold text-[#3A2418]">Post Ad</h1>
        <p className="mt-1 text-sm text-[#8A7568]">Active ads last 30 days. Limit: 5 at a time.</p>
      </header>

      <form action={onSubmit} className="space-y-3 px-5 pt-5">
        {error ? (
          <p className="rounded-[16px] border border-[#EADFD7] bg-white px-3 py-2 text-sm text-[#8a2f2f]">
            {error}
          </p>
        ) : null}
        <input name="title" required placeholder="Title" className="h-12 w-full rounded-2xl border border-[#EADFD7] bg-white px-4 text-sm" />
        <textarea name="description" required placeholder="Description" className="min-h-28 w-full rounded-2xl border border-[#EADFD7] bg-white px-4 py-3 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input name="price" required placeholder="Price" inputMode="decimal" className="h-12 rounded-2xl border border-[#EADFD7] bg-white px-4 text-sm" />
          <input name="currency" defaultValue="JOD" className="h-12 rounded-2xl border border-[#EADFD7] bg-white px-4 text-sm" />
        </div>
        <select name="category" required className="h-12 w-full rounded-2xl border border-[#EADFD7] bg-white px-4 text-sm">
          <option value="">Category</option>
          {CATEGORIES.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.en}
            </option>
          ))}
        </select>
        <select
          required
          value={countryId}
          onChange={(event) => {
            const next = countries.find((item) => item.id === event.target.value);
            setCountryId(event.target.value);
            setCountryCode(next?.code || "");
          }}
          className="h-12 w-full rounded-2xl border border-[#EADFD7] bg-white px-4 text-sm"
        >
          <option value="">Country</option>
          {countries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select name="regionId" required className="h-12 w-full rounded-2xl border border-[#EADFD7] bg-white px-4 text-sm">
          <option value="">Region</option>
          {regions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input name="city" required placeholder="City" className="h-12 rounded-2xl border border-[#EADFD7] bg-white px-4 text-sm" />
        <input name="neighborhood" placeholder="Neighborhood (optional)" className="h-12 rounded-2xl border border-[#EADFD7] bg-white px-4 text-sm" />
        <button type="submit" disabled={pending || countries.length === 0} className="h-12 w-full rounded-full bg-[#3A2418] text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Publishing…" : countries.length === 0 ? "Location data unavailable" : "Publish"}
        </button>
      </form>

      <BottomNav active="post" />
    </div>
  );
}
