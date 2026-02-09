-- 1) Role enum: EDITOR -> MANAGER
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Role' AND e.enumlabel = 'EDITOR'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Role' AND e.enumlabel = 'MANAGER'
  ) THEN
    ALTER TYPE "Role" RENAME VALUE 'EDITOR' TO 'MANAGER';
  END IF;
END $$;

ALTER TABLE "User"
  ALTER COLUMN "role" SET DEFAULT 'MANAGER';

-- 2) ApplicationStatus enum remap
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ApplicationStatus' AND e.enumlabel = 'PENDING'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ApplicationStatus' AND e.enumlabel = 'NEW'
  ) THEN
    ALTER TYPE "ApplicationStatus" RENAME VALUE 'PENDING' TO 'NEW';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ApplicationStatus' AND e.enumlabel = 'APPROVED'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ApplicationStatus' AND e.enumlabel = 'GOING'
  ) THEN
    ALTER TYPE "ApplicationStatus" RENAME VALUE 'APPROVED' TO 'GOING';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ApplicationStatus' AND e.enumlabel = 'WAITLISTED'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ApplicationStatus' AND e.enumlabel = 'CONTACTED'
  ) THEN
    ALTER TYPE "ApplicationStatus" RENAME VALUE 'WAITLISTED' TO 'CONTACTED';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ApplicationStatus' AND e.enumlabel = 'REJECTED'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ApplicationStatus' AND e.enumlabel = 'NOT_GOING'
  ) THEN
    ALTER TYPE "ApplicationStatus" RENAME VALUE 'REJECTED' TO 'NOT_GOING';
  END IF;
END $$;

ALTER TABLE "StudentTourApplication"
  ALTER COLUMN "status" SET DEFAULT 'NEW';

-- 3) StudentTourApplication manager metadata
ALTER TABLE "StudentTourApplication"
  ADD COLUMN IF NOT EXISTS "managerId" TEXT,
  ADD COLUMN IF NOT EXISTS "managerComment" TEXT,
  ADD COLUMN IF NOT EXISTS "contactedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "decisionAt" TIMESTAMP(3);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'StudentTourApplication_managerId_fkey'
  ) THEN
    ALTER TABLE "StudentTourApplication"
      ADD CONSTRAINT "StudentTourApplication_managerId_fkey"
      FOREIGN KEY ("managerId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "StudentTourApplication_tourPostId_status_idx"
  ON "StudentTourApplication"("tourPostId", "status");
CREATE INDEX IF NOT EXISTS "StudentTourApplication_userId_status_idx"
  ON "StudentTourApplication"("userId", "status");

-- 4) Application status history
CREATE TABLE IF NOT EXISTS "ApplicationStatusLog" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "fromStatus" "ApplicationStatus" NOT NULL,
  "toStatus" "ApplicationStatus" NOT NULL,
  "changedById" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationStatusLog_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ApplicationStatusLog_applicationId_fkey'
  ) THEN
    ALTER TABLE "ApplicationStatusLog"
      ADD CONSTRAINT "ApplicationStatusLog_applicationId_fkey"
      FOREIGN KEY ("applicationId") REFERENCES "StudentTourApplication"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ApplicationStatusLog_changedById_fkey'
  ) THEN
    ALTER TABLE "ApplicationStatusLog"
      ADD CONSTRAINT "ApplicationStatusLog_changedById_fkey"
      FOREIGN KEY ("changedById") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ApplicationStatusLog_applicationId_createdAt_idx"
  ON "ApplicationStatusLog"("applicationId", "createdAt");
CREATE INDEX IF NOT EXISTS "ApplicationStatusLog_changedById_createdAt_idx"
  ON "ApplicationStatusLog"("changedById", "createdAt");

-- 5) Backfill enrollments for legacy confirmed applications
INSERT INTO "StudentTourEnrollment" ("id", "userId", "tourPostId", "status", "createdAt", "updatedAt")
SELECT
  'enr_backfill_' || substr(md5(sta.id || clock_timestamp()::text), 1, 18),
  sta."userId",
  sta."tourPostId",
  'ENROLLED'::"EnrollmentStatus",
  COALESCE(sta."decisionAt", sta."updatedAt", sta."createdAt", now()),
  now()
FROM "StudentTourApplication" sta
WHERE sta."status" = 'GOING'::"ApplicationStatus"
  AND sta."userId" IS NOT NULL
ON CONFLICT ("userId", "tourPostId")
DO UPDATE SET
  "status" = 'ENROLLED'::"EnrollmentStatus",
  "updatedAt" = EXCLUDED."updatedAt";
