import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await context.params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.userId !== userId) {
    return NextResponse.json({ error: "You can only mark your own ads sold." }, { status: 403 });
  }

  await prisma.listing.update({
    where: { id },
    data: { isSold: true },
  });

  return NextResponse.json({ ok: true });
}
