-- Role + status enums
ALTER TYPE "public"."Role" ADD VALUE IF NOT EXISTS 'STUDENT';

CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'WAITLISTED', 'REJECTED');
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ENROLLED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "public"."MomentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Tour capacity
ALTER TABLE "public"."TourPost"
ADD COLUMN IF NOT EXISTS "studentLimit" INTEGER NOT NULL DEFAULT 40;

-- Student profile
CREATE TABLE IF NOT EXISTS "public"."StudentProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "university" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "bio" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StudentProfile_userId_key" ON "public"."StudentProfile"("userId");

ALTER TABLE "public"."StudentProfile"
ADD CONSTRAINT "StudentProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Applications
CREATE TABLE IF NOT EXISTS "public"."StudentTourApplication" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "tourPostId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "university" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "comment" TEXT,
  "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentTourApplication_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."StudentTourApplication"
ADD CONSTRAINT "StudentTourApplication_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."StudentTourApplication"
ADD CONSTRAINT "StudentTourApplication_tourPostId_fkey"
FOREIGN KEY ("tourPostId") REFERENCES "public"."TourPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enrollments
CREATE TABLE IF NOT EXISTS "public"."StudentTourEnrollment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tourPostId" TEXT NOT NULL,
  "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentTourEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StudentTourEnrollment_userId_tourPostId_key" ON "public"."StudentTourEnrollment"("userId", "tourPostId");

ALTER TABLE "public"."StudentTourEnrollment"
ADD CONSTRAINT "StudentTourEnrollment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."StudentTourEnrollment"
ADD CONSTRAINT "StudentTourEnrollment_tourPostId_fkey"
FOREIGN KEY ("tourPostId") REFERENCES "public"."TourPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Student moments
CREATE TABLE IF NOT EXISTS "public"."StudentTravelMoment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tourPostId" TEXT NOT NULL,
  "photoUrl" TEXT NOT NULL,
  "captionRu" TEXT NOT NULL,
  "captionKz" TEXT NOT NULL,
  "captionEn" TEXT NOT NULL,
  "status" "public"."MomentStatus" NOT NULL DEFAULT 'PENDING',
  "moderatorNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentTravelMoment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."StudentTravelMoment"
ADD CONSTRAINT "StudentTravelMoment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."StudentTravelMoment"
ADD CONSTRAINT "StudentTravelMoment_tourPostId_fkey"
FOREIGN KEY ("tourPostId") REFERENCES "public"."TourPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Password reset codes
CREATE TABLE IF NOT EXISTS "public"."PasswordResetCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetCode_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."PasswordResetCode"
ADD CONSTRAINT "PasswordResetCode_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
