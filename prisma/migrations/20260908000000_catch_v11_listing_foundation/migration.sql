-- Additive Catch V1.1 listing lifecycle + favorites.
-- Safe for existing MVP rows: new columns are nullable or have defaults.
-- No drops, no data deletion.

ALTER TABLE "User" ADD COLUMN "freeSlotsUsed" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Listing" ADD COLUMN "neighborhood" TEXT;
ALTER TABLE "Listing" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "Listing" ADD COLUMN "isSold" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Listing" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Listing" ADD COLUMN "featuredUntil" TIMESTAMP(3);
ALTER TABLE "Listing" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Listing" ADD COLUMN "chatCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX "Favorite_listingId_idx" ON "Favorite"("listingId");

CREATE INDEX "Listing_category_createdAt_idx" ON "Listing"("category", "createdAt");
CREATE INDEX "Listing_governorate_city_createdAt_idx" ON "Listing"("governorate", "city", "createdAt");
CREATE INDEX "Listing_isSold_createdAt_idx" ON "Listing"("isSold", "createdAt");
CREATE INDEX "Listing_isFeatured_createdAt_idx" ON "Listing"("isFeatured", "createdAt");
CREATE INDEX "Listing_expiresAt_idx" ON "Listing"("expiresAt");

ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
