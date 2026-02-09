import { NextResponse } from "next/server";
import { TourStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole(["ADMIN", "MANAGER"]);

    const tours = await prisma.tourPost.findMany({
      where: { status: TourStatus.PUBLISHED },
      select: {
        id: true,
        slug: true,
        tourDate: true,
        studentLimit: true,
        translations: {
          select: {
            language: true,
            title: true
          }
        }
      },
      orderBy: { tourDate: "asc" }
    });

    const grouped = await prisma.studentTourApplication.groupBy({
      by: ["tourPostId"],
      where: { status: "GOING" },
      _count: { _all: true }
    });

    const goingByTour = new Map(grouped.map((group) => [group.tourPostId, group._count._all]));

    return NextResponse.json(
      tours.map((tour) => {
        const goingCount = goingByTour.get(tour.id) ?? 0;
        return {
          tourPostId: tour.id,
          slug: tour.slug,
          titleRu: tour.translations.find((translation) => translation.language === "RU")?.title || tour.slug,
          tourDate: tour.tourDate.toISOString(),
          studentLimit: tour.studentLimit,
          goingCount,
          isClosed: goingCount >= tour.studentLimit
        };
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
