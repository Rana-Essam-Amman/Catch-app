import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TestDbPage() {
  let error: string | null = null;
  let user = null;
  let listing = null;
  let listings: Awaited<ReturnType<typeof prisma.listing.findMany>> = [];

  try {
    user = await prisma.user.upsert({
      where: { email: "test@catch.app" },
      update: { name: "Catch Test User" },
      create: { email: "test@catch.app", name: "Catch Test User" },
    });

    listing = await prisma.listing.create({
      data: {
        title: "إعلان تجريبي",
        description: "سجل للتأكد من القراءة والكتابة",
        price: 100,
        currency: "JOD",
        category: "test",
        governorate: "Amman",
        city: "Amman",
        userId: user.id,
      },
    });

    listings = await prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", direction: "rtl" }}>
      <h1>Catch DB test</h1>
      {error ? (
        <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>
      ) : (
        <>
          <p>write: ok</p>
          <p>read: ok — {listings.length} listing(s)</p>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify({ user, listing, listings }, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
