-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "fullNameRu" TEXT NOT NULL,
    "fullNameKz" TEXT NOT NULL,
    "fullNameEn" TEXT NOT NULL,
    "positionRu" TEXT NOT NULL,
    "positionKz" TEXT NOT NULL,
    "positionEn" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
