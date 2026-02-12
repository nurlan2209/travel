CREATE TABLE IF NOT EXISTS "SiteDocument" (
  "id" TEXT NOT NULL,
  "titleRu" TEXT NOT NULL,
  "titleKz" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "descriptionRu" TEXT NOT NULL,
  "descriptionKz" TEXT NOT NULL,
  "descriptionEn" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SiteDocument_sortOrder_createdAt_idx"
  ON "SiteDocument"("sortOrder", "createdAt");

CREATE INDEX IF NOT EXISTS "SiteDocument_isActive_sortOrder_createdAt_idx"
  ON "SiteDocument"("isActive", "sortOrder", "createdAt");
