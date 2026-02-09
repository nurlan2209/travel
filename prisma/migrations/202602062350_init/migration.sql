-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "public"."TourStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('KZ', 'RU', 'EN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TourPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "public"."TourStatus" NOT NULL DEFAULT 'DRAFT',
    "coverImage" TEXT NOT NULL,
    "gallery" TEXT[],
    "price" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "meetingTime" TEXT NOT NULL,
    "tourDate" TIMESTAMP(3) NOT NULL,
    "place" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TourPostTranslation" (
    "id" TEXT NOT NULL,
    "tourPostId" TEXT NOT NULL,
    "language" "public"."Language" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "posterTemplateData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourPostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TourPost_slug_key" ON "public"."TourPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TourPostTranslation_tourPostId_language_key" ON "public"."TourPostTranslation"("tourPostId", "language");

-- AddForeignKey
ALTER TABLE "public"."TourPostTranslation" ADD CONSTRAINT "TourPostTranslation_tourPostId_fkey" FOREIGN KEY ("tourPostId") REFERENCES "public"."TourPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

