import { Language, TourStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapLangToPrismaEnum } from "@/lib/i18n";
import type { AppLanguage } from "@/lib/constants";

export async function getPublishedTours(language: AppLanguage) {
  const prismaLanguage = mapLangToPrismaEnum(language) as Language;

  return prisma.tourPost.findMany({
    where: {
      status: TourStatus.PUBLISHED
    },
    include: {
      translations: {
        where: { language: prismaLanguage }
      }
    },
    orderBy: { tourDate: "asc" }
  });
}

export async function getTourBySlug(slug: string, language: AppLanguage) {
  const prismaLanguage = mapLangToPrismaEnum(language) as Language;

  return prisma.tourPost.findUnique({
    where: { slug },
    include: {
      translations: {
        where: { language: prismaLanguage }
      }
    }
  });
}

export async function getAllToursForAdmin() {
  return prisma.tourPost.findMany({
    include: {
      translations: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}
