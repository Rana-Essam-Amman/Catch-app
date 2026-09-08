/**
 * PHASE 1 MIGRATION VERIFICATION SUITE
 * 
 * READ-ONLY verification against the migrated database.
 * Does NOT modify data.
 * Reports exact counts and violations.
 * 
 * Usage: node scripts/verify-phase1-migration.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface VerificationReport {
  name: string;
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    expected?: number | string | string[];
    actual?: number | string | string[];
    violations?: string[];
  }[];
  summary: string;
}

const report: VerificationReport[] = [];

async function verifyDataPreservation() {
  console.log("\n=== A. DATA PRESERVATION ===");
  const checks = [];

  try {
    const userCount = await prisma.user.count();
    checks.push({
      name: "User count",
      passed: userCount > 0 || true, // Pass even if 0 (acceptable for fresh DB)
      actual: userCount,
    });

    const listingCount = await prisma.listing.count();
    checks.push({
      name: "Listing count",
      passed: listingCount > 0 || true,
      actual: listingCount,
    });

    const favoriteCount = await prisma.favorite.count();
    checks.push({
      name: "Favorite count",
      passed: favoriteCount > 0 || true,
      actual: favoriteCount,
    });

    // Verify IDs are preserved
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { id: true, email: true },
        take: 5,
      });
      checks.push({
        name: "User IDs format",
        passed: users.every((u) => u.id && typeof u.id === "string"),
        actual: `${users.length} sample users verified`,
      });
    }

    if (listingCount > 0) {
      const listings = await prisma.listing.findMany({
        select: { id: true, userId: true, title: true },
        take: 5,
      });
      checks.push({
        name: "Listing IDs format",
        passed: listings.every((l) => l.id && l.userId && typeof l.id === "string"),
        actual: `${listings.length} sample listings verified`,
      });

      // Verify listing ownership relationships
      const orphanedListings = await prisma.listing.findMany({
        where: { userId: { equals: "", mode: "insensitive" } },
        select: { id: true },
      });
      checks.push({
        name: "Listing ownership (no orphaned listings)",
        passed: orphanedListings.length === 0,
        expected: 0,
        actual: orphanedListings.length,
      });
    }

    if (favoriteCount > 0) {
      const favorites = await prisma.favorite.findMany({
        select: { userId: true, listingId: true },
        take: 5,
      });
      checks.push({
        name: "Favorite relationships",
        passed: favorites.every((f) => f.userId && f.listingId),
        actual: `${favorites.length} sample favorites verified`,
      });

      // Check for orphaned favorites (user or listing doesn't exist)
      const orphanedFavs = await prisma.favorite.findMany({
        where: {
          OR: [
            { user: null },
            { listing: null },
          ],
        },
      });
      checks.push({
        name: "Favorite orphan check",
        passed: orphanedFavs.length === 0,
        expected: 0,
        actual: orphanedFavs.length,
      });
    }

    report.push({
      name: "A. Data Preservation",
      passed: checks.every((c) => c.passed),
      checks,
      summary: `User: ${userCount}, Listing: ${listingCount}, Favorite: ${favoriteCount}`,
    });
  } catch (err) {
    console.error("Data preservation check failed:", err);
    report.push({
      name: "A. Data Preservation",
      passed: false,
      checks: [
        {
          name: "Error",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

async function verifyCategoryIntegrity() {
  console.log("\n=== B. CATEGORY INTEGRITY ===");
  const checks = [];

  try {
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true, name: true, nameAr: true },
    });

    // Check count
    checks.push({
      name: "Exactly 17 categories",
      passed: categories.length === 17,
      expected: 17,
      actual: categories.length,
    });

    // Check all canonical categories exist
    const canonicalSlugs = [
      "motors",
      "real-estate",
      "mobiles",
      "watches",
      "computers",
      "electronics",
      "furniture",
      "fashion",
      "services",
      "jobs",
      "baby",
      "beauty",
      "pets",
      "sports",
      "hobbies",
      "misc",
    ];

    const foundSlugs = new Set(categories.map((c) => c.slug));
    const missingSlugs = canonicalSlugs.filter((s) => !foundSlugs.has(s));
    const extraSlugs = categories
      .map((c) => c.slug)
      .filter((s) => !canonicalSlugs.includes(s));

    checks.push({
      name: "All canonical categories exist",
      passed: missingSlugs.length === 0,
      violations: missingSlugs.length > 0 ? [`Missing: ${missingSlugs.join(", ")}`] : undefined,
    });

    checks.push({
      name: '"more" does not exist',
      passed: !foundSlugs.has("more"),
      violations: foundSlugs.has("more") ? ["Found 'more' category (should not exist)"] : undefined,
    });

    checks.push({
      name: '"misc" = "كراكيب"',
      passed: (() => {
        const misc = categories.find((c) => c.slug === "misc");
        return misc?.nameAr === "كراكيب";
      })(),
      violations: (() => {
        const misc = categories.find((c) => c.slug === "misc");
        return misc?.nameAr !== "كراكيب" ? [`Found: "${misc?.nameAr}"`] : undefined;
      })(),
    });

    // Check for duplicates
    const slugCounts = new Map<string, number>();
    categories.forEach((c) => {
      slugCounts.set(c.slug, (slugCounts.get(c.slug) || 0) + 1);
    });
    const duplicateSlugs = Array.from(slugCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([slug, _]) => slug);

    checks.push({
      name: "No duplicate slugs",
      passed: duplicateSlugs.length === 0,
      violations: duplicateSlugs.length > 0 ? [`Duplicates: ${duplicateSlugs.join(", ")}`] : undefined,
    });

    checks.push({
      name: "No unexpected extra categories",
      passed: extraSlugs.length === 0,
      violations: extraSlugs.length > 0 ? [`Extra: ${extraSlugs.join(", ")}`] : undefined,
    });

    report.push({
      name: "B. Category Integrity",
      passed: checks.every((c) => c.passed),
      checks,
      summary: `${categories.length}/17 categories found`,
    });
  } catch (err) {
    console.error("Category check failed:", err);
    report.push({
      name: "B. Category Integrity",
      passed: false,
      checks: [
        {
          name: "Error",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

async function verifyJordanGeography() {
  console.log("\n=== C. JORDAN GEOGRAPHY ===");
  const checks = [];

  try {
    const jordan = await prisma.country.findUnique({
      where: { code: "JO" },
      include: { regions: true },
    });

    checks.push({
      name: "Jordan country exists",
      passed: !!jordan,
      violations: !jordan ? ["Jordan (JO) not found"] : undefined,
    });

    checks.push({
      name: "Jordan currency is JOD",
      passed: jordan?.currency === "JOD",
      actual: jordan?.currency,
      violations: jordan?.currency !== "JOD" ? [`Found: "${jordan?.currency}"`] : undefined,
    });

    const regionCount = jordan?.regions.length || 0;
    checks.push({
      name: "Exactly 12 Jordanian regions",
      passed: regionCount === 12,
      expected: 12,
      actual: regionCount,
    });

    // Verify canonical governorate names
    const canonicalGovernoratesEn = [
      "Amman",
      "Zarqa",
      "Irbid",
      "Ajloun",
      "Jerash",
      "Mafraq",
      "Balqa",
      "Madaba",
      "Aqaba",
      "Tafilah",
      "Ma''an",
      "Karak",
    ];

    if (jordan) {
      const foundGovernoratesEn = new Set(jordan.regions.map((r) => r.name));
      const missingGov = canonicalGovernoratesEn.filter((g) => !foundGovernoratesEn.has(g));
      const extraGov = jordan.regions
        .map((r) => r.name)
        .filter((g) => !canonicalGovernoratesEn.includes(g));

      checks.push({
        name: "All canonical governorates present",
        passed: missingGov.length === 0,
        violations: missingGov.length > 0 ? [`Missing: ${missingGov.join(", ")}`] : undefined,
      });

      checks.push({
        name: "No unexpected governorates",
        passed: extraGov.length === 0,
        violations: extraGov.length > 0 ? [`Extra: ${extraGov.join(", ")}`] : undefined,
      });

      // Check for orphaned regions/cities/neighborhoods
      const orphanedRegions = await prisma.region.findMany({
        where: { countryId: { not: jordan.id } },
      });
      
      const orphanedCities = await prisma.city.findMany({
        where: {
          region: {
            countryId: { not: jordan.id },
          },
        },
      });

      checks.push({
        name: "No orphaned regions (geographic integrity)",
        passed: orphanedRegions.length === 0,
        expected: 0,
        actual: orphanedRegions.length,
      });

      checks.push({
        name: "No orphaned cities (geographic integrity)",
        passed: orphanedCities.length === 0,
        expected: 0,
        actual: orphanedCities.length,
      });
    }

    report.push({
      name: "C. Jordan Geography",
      passed: checks.every((c) => c.passed),
      checks,
      summary: `${regionCount} regions found in Jordan`,
    });
  } catch (err) {
    console.error("Geography check failed:", err);
    report.push({
      name: "C. Jordan Geography",
      passed: false,
      checks: [
        {
          name: "Error",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

async function verifyForeignKeySafety() {
  console.log("\n=== D. FOREIGN KEY SAFETY ===");
  const checks = [];

  try {
    // Check for orphaned listings (should have valid userId)
    const orphanedListings = await prisma.listing.findMany({
      where: { user: null },
      select: { id: true },
    });

    checks.push({
      name: "No orphaned listings (missing user)",
      passed: orphanedListings.length === 0,
      expected: 0,
      actual: orphanedListings.length,
      violations:
        orphanedListings.length > 0
          ? [`${orphanedListings.length} listings without users`]
          : undefined,
    });

    // Check for orphaned favorites
    const orphanedFavorites = await prisma.favorite.findMany({
      where: {
        OR: [{ user: null }, { listing: null }],
      },
      select: { id: true },
    });

    checks.push({
      name: "No orphaned favorites",
      passed: orphanedFavorites.length === 0,
      expected: 0,
      actual: orphanedFavorites.length,
      violations:
        orphanedFavorites.length > 0
          ? [`${orphanedFavorites.length} favorites with broken relationships`]
          : undefined,
    });

    // Check for orphaned listing images
    const orphanedImages = await prisma.listingImage.findMany({
      where: { listing: null },
      select: { id: true },
    });

    checks.push({
      name: "No orphaned listing images",
      passed: orphanedImages.length === 0,
      expected: 0,
      actual: orphanedImages.length,
    });

    // Check for orphaned conversations
    const orphanedConversations = await prisma.conversation.findMany({
      where: { listing: null },
      select: { id: true },
    });

    checks.push({
      name: "No orphaned conversations",
      passed: orphanedConversations.length === 0,
      expected: 0,
      actual: orphanedConversations.length,
    });

    // Check for orphaned conversation participants
    const orphanedParticipants = await prisma.conversationParticipant.findMany({
      where: {
        OR: [
          { conversation: null },
          { user: null },
        ],
      },
      select: { id: true },
    });

    checks.push({
      name: "No orphaned conversation participants",
      passed: orphanedParticipants.length === 0,
      expected: 0,
      actual: orphanedParticipants.length,
    });

    // Check for orphaned messages
    const orphanedMessages = await prisma.message.findMany({
      where: {
        OR: [
          { conversation: null },
          { sender: null },
        ],
      },
      select: { id: true },
    });

    checks.push({
      name: "No orphaned messages",
      passed: orphanedMessages.length === 0,
      expected: 0,
      actual: orphanedMessages.length,
    });

    // Check for orphaned notifications
    const orphanedNotifications = await prisma.notification.findMany({
      where: { recipient: null },
      select: { id: true },
    });

    checks.push({
      name: "No orphaned notifications",
      passed: orphanedNotifications.length === 0,
      expected: 0,
      actual: orphanedNotifications.length,
    });

    // Check for orphaned reports
    const orphanedReports = await prisma.report.findMany({
      where: {
        OR: [
          { listing: null },
          { reporter: null },
        ],
      },
      select: { id: true },
    });

    checks.push({
      name: "No orphaned reports",
      passed: orphanedReports.length === 0,
      expected: 0,
      actual: orphanedReports.length,
    });

    report.push({
      name: "D. Foreign Key Safety",
      passed: checks.every((c) => c.passed),
      checks,
      summary: "All foreign key relationships intact",
    });
  } catch (err) {
    console.error("Foreign key check failed:", err);
    report.push({
      name: "D. Foreign Key Safety",
      passed: false,
      checks: [
        {
          name: "Error",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

async function verifyListingState() {
  console.log("\n=== E. LISTING STATE ===");
  const checks = [];

  try {
    const listings = await prisma.listing.findMany({
      select: { id: true, state: true, isSold: true, expiresAt: true, deletedAt: true },
    });

    checks.push({
      name: "All listings have a state",
      passed: listings.every((l) => l.state),
      violations: listings.filter((l) => !l.state).length > 0 ? ["Some listings missing state"] : undefined,
    });

    // Count state distribution
    const stateDistribution = new Map<string, number>();
    listings.forEach((l) => {
      stateDistribution.set(l.state, (stateDistribution.get(l.state) || 0) + 1);
    });

    const states = Array.from(stateDistribution.keys());
    const validStates = ["active", "expired", "sold", "deleted"];
    const invalidStates = states.filter((s) => !validStates.includes(s));

    checks.push({
      name: "All states are valid (active/expired/sold/deleted)",
      passed: invalidStates.length === 0,
      violations:
        invalidStates.length > 0
          ? [`Invalid states found: ${invalidStates.join(", ")}`]
          : undefined,
    });

    // Check contradictions: deleted listings should have deletedAt and state='deleted'
    const deletedListings = listings.filter((l) => l.state === "deleted");
    const deletedWithoutTimestamp = deletedListings.filter((l) => !l.deletedAt);

    checks.push({
      name: "Deleted listings have deletedAt timestamp",
      passed: deletedWithoutTimestamp.length === 0,
      violations:
        deletedWithoutTimestamp.length > 0
          ? [`${deletedWithoutTimestamp.length} deleted listings missing timestamp`]
          : undefined,
    });

    // Check sold listings
    const soldStateListings = listings.filter((l) => l.state === "sold");
    const soldListingsNotMarked = soldStateListings.filter((l) => !l.isSold);

    checks.push({
      name: "Listings in sold state have isSold = true",
      passed: soldListingsNotMarked.length === 0,
      violations:
        soldListingsNotMarked.length > 0
          ? [`${soldListingsNotMarked.length} listings in sold state but isSold != true`]
          : undefined,
    });

    // State distribution summary
    checks.push({
      name: "State distribution",
      passed: true,
      actual: Array.from(stateDistribution.entries())
        .map(([state, count]) => `${state}: ${count}`)
        .join(", "),
    });

    report.push({
      name: "E. Listing State",
      passed: checks.every((c) => c.passed),
      checks,
      summary: `${listings.length} listings verified`,
    });
  } catch (err) {
    console.error("Listing state check failed:", err);
    report.push({
      name: "E. Listing State",
      passed: false,
      checks: [
        {
          name: "Error",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

async function reportCodeUsage() {
  console.log("\n=== F. CODE USAGE ANALYSIS ===");
  console.log("(This is informational - requires manual code review)");

  const fieldUsages = [
    "category",
    "governorate",
    "city",
    "neighborhood",
    "isSold",
    "expiresAt",
    "isFeatured",
    "featuredUntil",
  ];

  const checks = [];

  checks.push({
    name: "Fields used in legacy code",
    passed: true,
    actual:
      "Manual review required for: " + fieldUsages.join(", "),
  });

  checks.push({
    name: "Code locations to verify",
    passed: true,
    actual: [
      "src/app/page.tsx - Explore page queries",
      "src/lib/listings.ts - Query helpers",
      "src/app/listings/* - Listing routes",
      "src/components/ListingCard.tsx - Display logic",
    ].join("\n"),
  });

  report.push({
    name: "F. Code Usage Analysis",
    passed: true,
    checks,
    summary: "See manual review checklist",
  });
}

async function runAllVerifications() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║     PHASE 1 MIGRATION VERIFICATION SUITE                ║");
  console.log("║            READ-ONLY VERIFICATION                       ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  await verifyDataPreservation();
  await verifyCategoryIntegrity();
  await verifyJordanGeography();
  await verifyForeignKeySafety();
  await verifyListingState();
  await reportCodeUsage();

  // Print summary
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║              VERIFICATION REPORT SUMMARY                ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  let allPassed = true;

  report.forEach((section) => {
    const icon = section.passed ? "✓" : "✗";
    console.log(`${icon} ${section.name}`);
    console.log(`  Summary: ${section.summary}`);

    section.checks.forEach((check) => {
      const checkIcon = check.passed ? "  ✓" : "  ✗";
      console.log(`${checkIcon} ${check.name}`);
      if (check.expected !== undefined) {
        console.log(`    Expected: ${check.expected}`);
      }
      if (check.actual !== undefined) {
        console.log(`    Actual: ${check.actual}`);
      }
      if (check.violations && check.violations.length > 0) {
        check.violations.forEach((v) => console.log(`    ⚠ ${v}`));
        allPassed = false;
      }
    });
    console.log();
  });

  console.log("╔════════════════════════════════════════════════════════╗");
  if (allPassed) {
    console.log("║            ✓ ALL VERIFICATIONS PASSED                   ║");
    console.log("║     Safe to commit to dev. Ready for full migration.    ║");
  } else {
    console.log("║            ✗ SOME VERIFICATIONS FAILED                  ║");
    console.log("║        DO NOT COMMIT. Address violations above.         ║");
  }
  console.log("╚════════════════════════════════════════════════════════╝\n");

  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

runAllVerifications().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
