import { NextRequest, NextResponse } from "next/server";
import { TourStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapLangToPrismaEnum, normalizeLanguage } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const lang = normalizeLanguage(request.nextUrl.searchParams.get("lang"));
  const statusParam = request.nextUrl.searchParams.get("status")?.toUpperCase();
  const status = statusParam === "DRAFT" ? TourStatus.DRAFT : TourStatus.PUBLISHED;

  const tours = await prisma.tourPost.findMany({
    where: { status },
    orderBy: { tourDate: "asc" },
    include: {
      translations: {
        where: { language: mapLangToPrismaEnum(lang) }
      }
    }
  });

  return NextResponse.json(
    tours.map((tour) => ({
      id: tour.id,
      slug: tour.slug,
      status: tour.status,
      coverImage: tour.coverImage,
      gallery: tour.gallery,
      price: tour.price,
      studentLimit: tour.studentLimit,
      duration: tour.duration,
      meetingTime: tour.meetingTime,
      tourDate: tour.tourDate,
      place: tour.place,
      location: tour.location,
      translation: tour.translations[0] ?? null
    }))
  );
}
