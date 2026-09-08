import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

export const MAX_ACTIVE_LISTINGS = 5;
export const LISTING_TTL_DAYS = 30;

export const GOVERNORATES = [
  "Amman",
  "Zarqa",
  "Irbid",
  "Balqa",
  "Madaba",
  "Jerash",
  "Ajloun",
  "Mafraq",
  "Karak",
  "Tafilah",
  "Ma'an",
  "Aqaba",
] as const;

export type ListingLifecycleState = "active" | "expired" | "sold";

export function listingState(input: {
  isSold: boolean;
  expiresAt: Date | null;
  now?: Date;
}): ListingLifecycleState {
  if (input.isSold) return "sold";
  const now = input.now ?? new Date();
  if (input.expiresAt && input.expiresAt.getTime() <= now.getTime()) {
    return "expired";
  }
  return "active";
}

export function activeListingWhere(now = new Date()) {
  return {
    isSold: false,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

export async function countActiveListings(userId: string, now = new Date()) {
  return prisma.listing.count({
    where: {
      userId,
      ...activeListingWhere(now),
    },
  });
}

export function expiresAtFrom(createdAt: Date) {
  return new Date(createdAt.getTime() + LISTING_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function isKnownCategory(slug: string) {
  return CATEGORIES.some((item) => item.slug === slug);
}

export function parseListingInput(body: Record<string, unknown>) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const currency = String(body.currency || "JOD").trim().toUpperCase() || "JOD";
  const category = String(body.category || "").trim();
  const governorate = String(body.governorate || "").trim();
  const city = String(body.city || "").trim();
  const neighborhood = String(body.neighborhood || "").trim() || null;
  const priceRaw = String(body.price || "").trim();
  const price = Number(priceRaw);

  if (title.length < 3 || title.length > 80) {
    return { error: "Title must be 3–80 characters." };
  }
  if (description.length < 8 || description.length > 2000) {
    return { error: "Description must be 8–2000 characters." };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Enter a valid price." };
  }
  if (!isKnownCategory(category)) {
    return { error: "Choose a valid category." };
  }
  if (!governorate || !city) {
    return { error: "Governorate and city are required." };
  }

  return {
    data: {
      title,
      description,
      price,
      currency,
      category,
      governorate,
      city,
      neighborhood,
    },
  };
}
