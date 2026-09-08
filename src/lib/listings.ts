import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

export const MAX_ACTIVE_LISTINGS = 5;
export const LISTING_TTL_DAYS = 30;
export const ALLOWED_CURRENCIES = ["JOD"] as const;

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

export type ListingLifecycleState = "active" | "expired" | "sold" | "deleted";

export function listingState(input: {
  isSold?: boolean;
  expiresAt?: Date | null;
  state?: string | null;
  deletedAt?: Date | null;
  now?: Date;
}): ListingLifecycleState {
  if (input.state === "deleted" || input.deletedAt) return "deleted";
  if (input.state === "sold" || input.isSold) return "sold";
  const now = input.now ?? new Date();
  if (input.state === "expired") return "expired";
  if (input.expiresAt && input.expiresAt.getTime() <= now.getTime()) return "expired";
  return "active";
}

/** Public marketplace: exclude sold, expired, and soft-deleted. */
export function activeListingWhere(now = new Date()) {
  return {
    AND: [
      { deletedAt: null },
      { isSold: false },
      { state: { notIn: ["sold", "expired", "deleted"] } },
      { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    ],
  };
}

export function activeListingWhereWithFallback(now = new Date()) {
  return activeListingWhere(now);
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
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const currency = String(body.currency ?? "JOD").trim().toUpperCase() || "JOD";
  const category = String(body.category ?? "").trim();
  const governorate = String(body.governorate ?? "").trim();
  const city = String(body.city ?? "").trim();
  const neighborhoodRaw = String(body.neighborhood ?? "").trim();
  const neighborhood = neighborhoodRaw ? neighborhoodRaw : null;
  const price = Number(String(body.price ?? "").trim());

  if (title.length < 3 || title.length > 80) {
    return { error: "Title must be 3–80 characters." };
  }
  if (description.length < 8 || description.length > 2000) {
    return { error: "Description must be 8–2000 characters." };
  }
  if (!Number.isFinite(price) || price <= 0 || price > 99_999_999.99) {
    return { error: "Enter a valid price." };
  }
  if (!(ALLOWED_CURRENCIES as readonly string[]).includes(currency)) {
    return { error: "Currency must be JOD." };
  }
  if (!isKnownCategory(category)) {
    return { error: "Choose a valid category." };
  }
  if (!(GOVERNORATES as readonly string[]).includes(governorate)) {
    return { error: "Choose a valid governorate." };
  }
  if (city.length < 2 || city.length > 40) {
    return { error: "City must be 2–40 characters." };
  }
  if (neighborhood && neighborhood.length > 60) {
    return { error: "Neighborhood is too long." };
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

export function isLockTimeoutError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("lock timeout") ||
    message.includes("55p03") ||
    message.includes("canceling statement due to lock timeout")
  );
}
