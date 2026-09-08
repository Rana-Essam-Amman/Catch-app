import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/auth";
import {
  MAX_ACTIVE_LISTINGS,
  expiresAtFrom,
  parseListingInput,
} from "@/lib/listings";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to post an ad." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseListingInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const listing = await prisma.$transaction(async (tx) => {
      const active = await tx.listing.count({
        where: {
          userId,
          isSold: false,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      if (active >= MAX_ACTIVE_LISTINGS) {
        throw new Error("ACTIVE_LIMIT");
      }

      const createdAt = new Date();
      return tx.listing.create({
        data: {
          ...parsed.data,
          userId,
          createdAt,
          expiresAt: expiresAtFrom(createdAt),
          isSold: false,
          isFeatured: false,
          viewCount: 0,
          chatCount: 0,
        },
      });
    });

    return NextResponse.json({ ok: true, id: listing.id });
  } catch (error) {
    if (error instanceof Error && error.message === "ACTIVE_LIMIT") {
      return NextResponse.json(
        {
          error: `You already have ${MAX_ACTIVE_LISTINGS} active listings. Sell or wait for one to expire to free a slot.`,
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not publish listing." }, { status: 500 });
  }
}
