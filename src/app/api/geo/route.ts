import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "countries";
  const countryId = searchParams.get("countryId") || "";
  const regionId = searchParams.get("regionId") || "";
  const cityId = searchParams.get("cityId") || "";

  try {
    if (type === "countries") {
      const rows = await prisma.country.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true, currency: true },
      });
      return NextResponse.json({ ok: true, rows });
    }
    if (type === "regions") {
      if (!countryId) {
        return NextResponse.json({ error: "countryId required." }, { status: 400 });
      }
      const rows = await prisma.region.findMany({
        where: { countryId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, nameAr: true, code: true, countryId: true },
      });
      return NextResponse.json({ ok: true, rows });
    }
    if (type === "cities") {
      if (!regionId) {
        return NextResponse.json({ error: "regionId required." }, { status: 400 });
      }
      const rows = await prisma.city.findMany({
        where: { regionId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, nameAr: true, regionId: true },
      });
      return NextResponse.json({ ok: true, rows });
    }
    if (type === "neighborhoods") {
      if (!cityId) {
        return NextResponse.json({ error: "cityId required." }, { status: 400 });
      }
      const rows = await prisma.neighborhood.findMany({
        where: { cityId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, nameAr: true, cityId: true },
      });
      return NextResponse.json({ ok: true, rows });
    }
    return NextResponse.json({ error: "Unknown geo type." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Geography is unavailable." }, { status: 503 });
  }
}
