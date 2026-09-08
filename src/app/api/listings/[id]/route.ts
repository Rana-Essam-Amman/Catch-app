import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/auth";
import { listingState, parseListingInput } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
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
    return NextResponse.json({ error: "You can only edit your own ads." }, { status: 403 });
  }

  const state = listingState(listing);
  if (state === "active") {
    return NextResponse.json(
      {
        error:
          "Editing an active listing will cost 1 JOD. Payment is not available yet.",
        code: "PAID_EDIT_REQUIRED",
      },
      { status: 402 },
    );
  }
  if (state === "sold") {
    return NextResponse.json({ error: "Sold listings cannot be edited." }, { status: 409 });
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

  await prisma.listing.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
