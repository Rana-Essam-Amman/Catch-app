import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/auth";
import { listingState } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { listingId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const listingId = String(body.listingId || "");
  if (!listingId) {
    return NextResponse.json({ error: "Listing required." }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, saved: false });
  }

  if (listingState(listing) !== "active") {
    return NextResponse.json({ error: "Only active listings can be saved." }, { status: 409 });
  }

  await prisma.favorite.create({ data: { userId, listingId } });
  return NextResponse.json({ ok: true, saved: true });
}
