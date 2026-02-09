-- CreateEnum
CREATE TYPE "public"."TranslationStatus" AS ENUM ('MANUAL', 'AUTO_GENERATED', 'AUTO_EDITED');

-- AlterTable
ALTER TABLE "public"."TourPost" ADD COLUMN     "posterAUrl" TEXT,
ADD COLUMN     "posterBUrl" TEXT,
ADD COLUMN     "postersGeneratedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."TourPostTranslation" ADD COLUMN     "sourceRuHash" TEXT,
ADD COLUMN     "translationStatus" "public"."TranslationStatus" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "translationVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "brandTitle" TEXT NOT NULL,
    "brandSubtitle" TEXT NOT NULL,
    "instagramHandle" TEXT NOT NULL,
    "footerAddress" TEXT NOT NULL,
    "topFrameText" TEXT NOT NULL,
    "bottomFrameText" TEXT NOT NULL,
    "decorTokens" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
