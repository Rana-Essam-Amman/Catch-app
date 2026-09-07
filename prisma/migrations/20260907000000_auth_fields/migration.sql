-- Additive auth fields only. Nullable uniques so existing Sprint 0 rows stay valid.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "handle" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifyToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifyTokenExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "User_handle_key" ON "User"("handle");
CREATE UNIQUE INDEX IF NOT EXISTS "User_phoneNumber_key" ON "User"("phoneNumber");
