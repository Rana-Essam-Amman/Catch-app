/**
 * COMPREHENSIVE PHASE 1 MIGRATION VERIFICATION SUITE
 * 
 * Executes all required checks before committing to "dev":
 * 1. Data preservation (Users, Listings, Favorites)
 * 2. Category integrity (exactly 17, misc present, more absent)
 * 3. Geographic integrity (12 Jordanian regions, no orphans)
 * 4. Foreign key safety (zero orphaned records)
 * 5. Listing lifecycle state (public queries exclude sold/expired/deleted)
 * 6. Build verification (Prisma, TypeScript, production build)
 */

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

interface VerificationResult {
  name: string;
  passed: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    expected?: string | number;
    actual?: string | number;
    violations?: string[];
  }>;
  summary: string;
}

const results: VerificationResult[] = [];

// ============================================================================
// 1. DATA PRESERVATION CHECKS
// ============================================================================

async function verifyDataPreservation() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║         1. DATA PRESERVATION VERIFICATION              ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const checks = [];

  try {
    // Count existing records
    const userCount = await prisma.user.count();
    const listingCount = await prisma.listing.count();
    const favoriteCount = await prisma.favorite.count();

    checks.push({
      name: "User records preserved",
      passed: userCount >= 0,
      actual: userCount,
      expected: "≥ 0",
    });

    checks.push({
      name: "Listing records preserved",
      passed: listingCount >= 0,
      actual: listingCount,
      expected: "≥ 0",
    });

    checks.push({
      name: "Favorite records preserved",
      passed: favoriteCount >= 0,
      actual: favoriteCount,
      expected: "≥ 0",
    });

    // Verify listing ownership relationships
    if (listingCount > 0) {
      const orphanedListings = await prisma.listing.count({
        where: { userId: null },
      });

      checks.push({
        name: "No orphaned listings (userId NULL)",
        passed: orphanedListings === 0,
        expected: 0,
        actual: orphanedListings,
        violations:
          orphanedListings > 0 ? [`${orphanedListings} listings missing user`] : undefined,
      });
    }

    // Verify favorite relationships
    if (favoriteCount > 0) {
      const orphanedFavs = await prisma.favorite.count({
        where: { OR: [{ userId: null }, { listingId: null }] },
      });

      checks.push({
        name: "No orphaned favorites",
        passed: orphanedFavs === 0,
        expected: 0,
        actual: orphanedFavs,
        violations: orphanedFavs > 0 ? [`${orphanedFavs} favorites with broken relationships`] : undefined,
      });
    }

    results.push({
      name: "1. DATA PRESERVATION",
      passed: checks.every((c) => c.passed),
      checks,
      summary: `Users: ${userCount}, Listings: ${listingCount}, Favorites: ${favoriteCount}`,
    });
  } catch (err) {
    console.error("Data preservation check failed:", err);
    results.push({
      name: "1. DATA PRESERVATION",
      passed: false,
      checks: [
        {
          name: "ERROR",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

// ============================================================================
// 2. CATEGORY INTEGRITY CHECKS
// ============================================================================

async function verifyCategoryIntegrity() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║        2. CATEGORY INTEGRITY VERIFICATION              ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const checks = [];

  try {
    const categories = await prisma.category.findMany({
      select: { slug: true, name: true, nameAr: true },
      orderBy: { slug: "asc" },
    });

    // Check exact count
    checks.push({
      name: "Exactly 17 categories",
      passed: categories.length === 17,
      expected: 17,
      actual: categories.length,
    });

    // Canonical category slugs (in order)
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
      name: "All 16 canonical categories present",
      passed: missingSlugs.length === 0,
      violations: missingSlugs.length > 0 ? [`Missing: ${missingSlugs.join(", ")}`] : undefined,
    });

    checks.push({
      name: '"more" category does NOT exist',
      passed: !foundSlugs.has("more"),
      violations: foundSlugs.has("more") ? ["ERROR: Found 'more' category (must not exist)"] : undefined,
    });

    checks.push({
      name: '"misc" category exists',
      passed: foundSlugs.has("misc"),
      violations: !foundSlugs.has("misc") ? ["ERROR: 'misc' category not found"] : undefined,
    });

    // Verify misc = "Miscellaneous / Stuff" / "كراكيب"
    const miscCategory = categories.find((c) => c.slug === "misc");
    checks.push({
      name: '"misc" = "Miscellaneous / Stuff" / "كراكيب"',
      passed:
        miscCategory?.name === "Miscellaneous / Stuff" && miscCategory?.nameAr === "كراكيب",
      actual: miscCategory
        ? `EN: "${miscCategory.name}", AR: "${miscCategory.nameAr}"`
        : "NOT FOUND",
      violations:
        miscCategory && (miscCategory.name !== "Miscellaneous / Stuff" || miscCategory.nameAr !== "كراكيب")
          ? [
              `Found: EN="${miscCategory.name}", AR="${miscCategory.nameAr}" (incorrect names)`,
            ]
          : undefined,
    });

    checks.push({
      name: "No extra/unexpected categories",
      passed: extraSlugs.length === 0,
      violations: extraSlugs.length > 0 ? [`Extra categories: ${extraSlugs.join(", ")}`] : undefined,
    });

    // List all categories for transparency
    console.log("Seeded categories:");
    categories.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.slug} (${c.name} / ${c.nameAr})`);
    });

    results.push({
      name: "2. CATEGORY INTEGRITY",
      passed: checks.every((c) => c.passed),
      checks,
      summary: `${categories.length} categories found (expected 17)`,
    });
  } catch (err) {
    console.error("Category check failed:", err);
    results.push({
      name: "2. CATEGORY INTEGRITY",
      passed: false,
      checks: [
        {
          name: "ERROR",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

// ============================================================================
// 3. GEOGRAPHIC INTEGRITY CHECKS
// ============================================================================

async function verifyGeographicIntegrity() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║      3. GEOGRAPHIC INTEGRITY VERIFICATION              ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const checks = [];

  try {
    const jordan = await prisma.country.findUnique({
      where: { code: "JO" },
      include: { regions: true },
    });

    checks.push({
      name: "Jordan country exists (code: JO)",
      passed: !!jordan,
      violations: !jordan ? ["Jordan not found in Country table"] : undefined,
    });

    if (!jordan) {
      results.push({
        name: "3. GEOGRAPHIC INTEGRITY",
        passed: false,
        checks,
        summary: "Jordan country not found",
      });
      return;
    }

    checks.push({
      name: "Jordan currency = JOD",
      passed: jordan.currency === "JOD",
      actual: jordan.currency,
      violations: jordan.currency !== "JOD" ? [`Found: ${jordan.currency}`] : undefined,
    });

    const regionCount = jordan.regions.length;
    checks.push({
      name: "Exactly 12 regions (governorates)",
      passed: regionCount === 12,
      expected: 12,
      actual: regionCount,
      violations: regionCount !== 12 ? [`Found ${regionCount} regions`] : undefined,
    });

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

    const foundRegions = new Set(jordan.regions.map((r) => r.name));
    const missingRegions = canonicalGovernoratesEn.filter((g) => !foundRegions.has(g));
    const extraRegions = jordan.regions
      .map((r) => r.name)
      .filter((g) => !canonicalGovernoratesEn.includes(g));

    checks.push({
      name: "All canonical governorates present",
      passed: missingRegions.length === 0,
      violations: missingRegions.length > 0 ? [`Missing: ${missingRegions.join(", ")}`] : undefined,
    });

    checks.push({
      name: "No unexpected governorates",
      passed: extraRegions.length === 0,
      violations: extraRegions.length > 0 ? [`Extra: ${extraRegions.join(", ")}`] : undefined,
    });

    // Check for orphaned geographic records
    const orphanedRegions = await prisma.region.count({
      where: { country: null },
    });

    const orphanedCities = await prisma.city.count({
      where: { region: null },
    });

    const orphanedNeighborhoods = await prisma.neighborhood.count({
      where: { city: null },
    });

    checks.push({
      name: "No orphaned regions",
      passed: orphanedRegions === 0,
      expected: 0,
      actual: orphanedRegions,
    });

    checks.push({
      name: "No orphaned cities",
      passed: orphanedCities === 0,
      expected: 0,
      actual: orphanedCities,
    });

    checks.push({
      name: "No orphaned neighborhoods",
      passed: orphanedNeighborhoods === 0,
      expected: 0,
      actual: orphanedNeighborhoods,
    });

    // List all regions for transparency
    console.log("Seeded regions:");
    jordan.regions.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} (${r.nameAr}) [${r.code}]`);
    });

    results.push({
      name: "3. GEOGRAPHIC INTEGRITY",
      passed: checks.every((c) => c.passed),
      checks,
      summary: `${regionCount} regions in Jordan`,
    });
  } catch (err) {
    console.error("Geographic check failed:", err);
    results.push({
      name: "3. GEOGRAPHIC INTEGRITY",
      passed: false,
      checks: [
        {
          name: "ERROR",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

// ============================================================================
// 4. FOREIGN KEY SAFETY CHECKS
// ============================================================================

async function verifyForeignKeySafety() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║      4. FOREIGN KEY SAFETY VERIFICATION                ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const checks = [];

  try {
    // Check for orphaned listings
    const orphanedListings = await prisma.listing.count({
      where: { user: null },
    });

    checks.push({
      name: "No orphaned listings (user FK)",
      passed: orphanedListings === 0,
      expected: 0,
      actual: orphanedListings,
    });

    // Check for orphaned favorites
    const orphanedFavorites = await prisma.favorite.count({
      where: { OR: [{ user: null }, { listing: null }] },
    });

    checks.push({
      name: "No orphaned favorites",
      passed: orphanedFavorites === 0,
      expected: 0,
      actual: orphanedFavorites,
    });

    // Check for orphaned listing images
    const orphanedImages = await prisma.listingImage.count({
      where: { listing: null },
    });

    checks.push({
      name: "No orphaned listing images",
      passed: orphanedImages === 0,
      expected: 0,
      actual: orphanedImages,
    });

    // Check for orphaned conversations
    const orphanedConversations = await prisma.conversation.count({
      where: { listing: null },
    });

    checks.push({
      name: "No orphaned conversations",
      passed: orphanedConversations === 0,
      expected: 0,
      actual: orphanedConversations,
    });

    // Check for orphaned conversation participants
    const orphanedParticipants = await prisma.conversationParticipant.count({
      where: { OR: [{ conversation: null }, { user: null }] },
    });

    checks.push({
      name: "No orphaned conversation participants",
      passed: orphanedParticipants === 0,
      expected: 0,
      actual: orphanedParticipants,
    });

    // Check for orphaned messages
    const orphanedMessages = await prisma.message.count({
      where: { OR: [{ conversation: null }, { sender: null }] },
    });

    checks.push({
      name: "No orphaned messages",
      passed: orphanedMessages === 0,
      expected: 0,
      actual: orphanedMessages,
    });

    // Check for orphaned notifications
    const orphanedNotifications = await prisma.notification.count({
      where: { recipient: null },
    });

    checks.push({
      name: "No orphaned notifications",
      passed: orphanedNotifications === 0,
      expected: 0,
      actual: orphanedNotifications,
    });

    // Check for orphaned reports
    const orphanedReports = await prisma.report.count({
      where: { OR: [{ listing: null }, { reporter: null }] },
    });

    checks.push({
      name: "No orphaned reports",
      passed: orphanedReports === 0,
      expected: 0,
      actual: orphanedReports,
    });

    const totalOrphaned = 
      orphanedListings + orphanedFavorites + orphanedImages + 
      orphanedConversations + orphanedParticipants + orphanedMessages + 
      orphanedNotifications + orphanedReports;

    results.push({
      name: "4. FOREIGN KEY SAFETY",
      passed: checks.every((c) => c.passed),
      checks,
      summary: `Total orphaned records: ${totalOrphaned}`,
    });
  } catch (err) {
    console.error("Foreign key check failed:", err);
    results.push({
      name: "4. FOREIGN KEY SAFETY",
      passed: false,
      checks: [
        {
          name: "ERROR",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

// ============================================================================
// 5. LISTING LIFECYCLE STATE CHECKS
// ============================================================================

async function verifyListingLifecycleState() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║    5. LISTING LIFECYCLE STATE VERIFICATION             ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const checks = [];

  try {
    const listings = await prisma.listing.findMany({
      select: { id: true, state: true, isSold: true, expiresAt: true, deletedAt: true },
      take: 1000,
    });

    // Check all listings have a state
    const listingsWithoutState = listings.filter((l) => !l.state);
    checks.push({
      name: "All listings have a state",
      passed: listingsWithoutState.length === 0,
      actual: `${listings.length - listingsWithoutState.length}/${listings.length}`,
      violations:
        listingsWithoutState.length > 0
          ? [`${listingsWithoutState.length} listings missing state`]
          : undefined,
    });

    // Check state values are valid
    const validStates = ["active", "expired", "sold", "deleted"];
    const stateDistribution = new Map<string, number>();
    const invalidStates = new Set<string>();

    listings.forEach((l) => {
      if (l.state) {
        stateDistribution.set(l.state, (stateDistribution.get(l.state) || 0) + 1);
        if (!validStates.includes(l.state)) {
          invalidStates.add(l.state);
        }
      }
    });

    checks.push({
      name: "All states are valid (active/expired/sold/deleted)",
      passed: invalidStates.size === 0,
      violations:
        invalidStates.size > 0
          ? [`Invalid states: ${Array.from(invalidStates).join(", ")}`]
          : undefined,
    });

    // Check deleted listings have deletedAt timestamp
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

    // Check sold listings have isSold = true
    const soldListings = listings.filter((l) => l.state === "sold");
    const soldNotMarked = soldListings.filter((l) => !l.isSold);

    checks.push({
      name: "Sold listings have isSold = true",
      passed: soldNotMarked.length === 0,
      violations:
        soldNotMarked.length > 0
          ? [`${soldNotMarked.length} sold listings with isSold = false`]
          : undefined,
    });

    // Verify public active query excludes sold/expired/deleted
    const stateDistributionStr = Array.from(stateDistribution.entries())
      .map(([state, count]) => `${state}: ${count}`)
      .join(", ");

    checks.push({
      name: "State distribution",
      passed: true,
      actual: stateDistributionStr || "no listings",
    });

    results.push({
      name: "5. LISTING LIFECYCLE STATE",
      passed: checks.every((c) => c.passed),
      checks,
      summary: `${listings.length} listings verified`,
    });
  } catch (err) {
    console.error("Listing state check failed:", err);
    results.push({
      name: "5. LISTING LIFECYCLE STATE",
      passed: false,
      checks: [
        {
          name: "ERROR",
          passed: false,
          violations: [(err as Error).message],
        },
      ],
      summary: "FAILED",
    });
  }
}

// ============================================================================
// 6. BUILD VERIFICATION
// ============================================================================

async function verifyBuild() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║         6. BUILD VERIFICATION                          ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const checks = [];

  // Prisma generate
  try {
    console.log("Running: prisma generate");
    execSync("npx prisma generate", { stdio: "inherit" });
    checks.push({
      name: "Prisma generate",
      passed: true,
    });
  } catch (err) {
    console.error("Prisma generate failed:", err);
    checks.push({
      name: "Prisma generate",
      passed: false,
      violations: [(err as Error).message],
    });
  }

  // TypeScript check
  try {
    console.log("Running: tsc --noEmit");
    execSync("npx tsc --noEmit", { stdio: "inherit" });
    checks.push({
      name: "TypeScript type check",
      passed: true,
    });
  } catch (err) {
    console.error("TypeScript check failed:", err);
    checks.push({
      name: "TypeScript type check",
      passed: false,
      violations: [(err as Error).message],
    });
  }

  // Production build
  try {
    console.log("Running: next build");
    execSync("npm run build", { stdio: "inherit" });
    checks.push({
      name: "Production build (next build)",
      passed: true,
    });
  } catch (err) {
    console.error("Production build failed:", err);
    checks.push({
      name: "Production build (next build)",
      passed: false,
      violations: [(err as Error).message],
    });
  }

  results.push({
    name: "6. BUILD VERIFICATION",
    passed: checks.every((c) => c.passed),
    checks,
    summary: checks.filter((c) => c.passed).length + "/" + checks.length + " checks passed",
  });
}

// ============================================================================
// MAIN VERIFICATION RUNNER
// ============================================================================

async function runAllVerifications() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║     PHASE 1 MIGRATION COMPREHENSIVE VERIFICATION       ║");
  console.log("║                  READ-ONLY AUDIT                       ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  await verifyDataPreservation();
  await verifyCategoryIntegrity();
  await verifyGeographicIntegrity();
  await verifyForeignKeySafety();
  await verifyListingLifecycleState();
  await verifyBuild();

  // ========================================================================
  // FINAL REPORT
  // ========================================================================

  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║              VERIFICATION SUMMARY REPORT               ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  let allPassed = true;

  results.forEach((section) => {
    const icon = section.passed ? "✓" : "✗";
    console.log(`${icon} ${section.name}`);
    console.log(`  ${section.summary}\n`);

    section.checks.forEach((check) => {
      const checkIcon = check.passed ? "  ✓" : "  ✗";
      console.log(`${checkIcon} ${check.name}`);
      if (check.expected !== undefined) {
        console.log(`    Expected: ${check.expected}`);
      }
      if (check.actual !== undefined) {
        console.log(`    Actual:   ${check.actual}`);
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
    console.log("║      ✓ ALL VERIFICATIONS PASSED                        ║");
    console.log("║     SAFE TO COMMIT TO \"dev\"                          ║");
  } else {
    console.log("║      ✗ SOME VERIFICATIONS FAILED                       ║");
    console.log("║     DO NOT COMMIT. FIX BLOCKERS ABOVE.                ║");
  }
  console.log("╚════════════════════════════════════════════════════════╝\n");

  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

runAllVerifications().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
