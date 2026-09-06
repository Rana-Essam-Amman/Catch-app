import { BottomNav } from "@/components/BottomNav";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORIES } from "@/lib/categories";
import { DEMO_LISTINGS } from "@/lib/demo-listings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  let dbListings: { title: string; description: string; price: string; currency: string; city: string; category: string }[] = [];
  try {
    const rows = await prisma.listing.findMany({ orderBy: { createdAt: "desc" }, take: 8 });
    dbListings = rows.map((row) => ({ title: row.title, description: row.description, price: row.price.toString(), currency: row.currency, city: row.city, category: row.category }));
  } catch {
    dbListings = [];
  }
  const feed = dbListings.length >= 2
    ? dbListings.map((item, i) => ({ ...item, featured: i === 0, image: DEMO_LISTINGS[i % DEMO_LISTINGS.length].image, neighborhood: item.city, subtitle: item.description }))
    : DEMO_LISTINGS.map((item) => ({ ...item, neighborhood: item.city, subtitle: item.description }));
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] pb-28">
      <header className="flex items-start justify-between px-5 pt-6">
        <div>
          <h1 className="text-[34px] leading-none text-[#231F20]" style={{ fontFamily: "var(--font-newsreader), serif" }}>Catch</h1>
          <p className="mt-1 text-[10px] font-medium tracking-[0.28em] text-[#231F20]/70">THE DEAL</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#eae6df] bg-white text-lg">🔔<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d64545]" /></button>
          <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80)" }} />
        </div>
      </header>
      <button type="button" className="mx-5 mt-4 inline-flex items-center gap-1 rounded-full border border-[#eae6df] bg-white px-3 py-1.5 text-xs font-medium">🇯🇴 Jordan • Amman <span className="opacity-60">▾</span></button>
      <div className="px-5 pt-4">
        <label className="flex items-center gap-2 rounded-full border border-[#eae6df] bg-white px-4 py-3">
          <span>🔍</span>
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-[#231F20]/40" placeholder="Search luxury watches, phones, decor..." />
        </label>
      </div>
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">All Categories</h2>
            <p className="text-xs text-[#231F20]/55" style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>جميع الأقسام (16)</p>
          </div>
          <span className="text-xs">Directory →</span>
        </div>
        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {CATEGORIES.map((cat) => (
            <button key={cat.slug} type="button" className="flex flex-col items-center gap-1">
              <span className="flex h-[64px] w-[64px] items-center justify-center rounded-2xl bg-white text-2xl ring-1 ring-[#eae6df]">{cat.icon}</span>
              <span className="text-center text-[11px] font-medium">{cat.en}</span>
              <span className="text-center text-[9px] text-[#231F20]/50" style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>{cat.ar}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="px-5 pt-8">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold">Recent Classifieds Nearby</h2>
            <p className="text-xs text-[#231F20]/55">Direct peer-to-peer contacts</p>
          </div>
          <span className="rounded-full bg-[#231F20] px-2 py-1 text-[9px] font-bold text-[#fbf9f6]">{feed.length} NEW TODAY</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {feed.map((item, i) => (
            <ListingCard key={`${item.title}-${i}`} title={item.title} subtitle={item.subtitle} price={item.price} currency={item.currency} neighborhood={item.neighborhood} image={item.image} featured={item.featured} />
          ))}
        </div>
      </section>
      <div className="fixed bottom-[88px] left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-10">
        <div className="flex overflow-hidden rounded-full border border-[#eae6df] bg-white/95 shadow-md">
          <button type="button" className="flex-1 py-2.5 text-center text-xs font-medium">🗺 Map View</button>
          <button type="button" className="flex-1 border-l border-[#eae6df] py-2.5 text-center text-xs font-medium">☰ Filters (3)</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
