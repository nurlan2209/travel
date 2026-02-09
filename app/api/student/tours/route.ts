import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { recalculateEnrollmentStatuses } from "@/lib/student";

export async function GET() {
  try {
    const session = await requireStudent();
    await recalculateEnrollmentStatuses(session.user.id);

    const rows = await prisma.studentTourEnrollment.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["ENROLLED", "COMPLETED"] }
      },
      orderBy: { createdAt: "desc" },
      include: {
        tourPost: {
          include: { translations: true }
        }
      }
    });

    return NextResponse.json(rows.map((row) => {
      const ruTitle = row.tourPost.translations.find((t) => t.language === "RU")?.title || row.tourPost.slug;
      const kzTitle = row.tourPost.translations.find((t) => t.language === "KZ")?.title || row.tourPost.slug;
      const enTitle = row.tourPost.translations.find((t) => t.language === "EN")?.title || row.tourPost.slug;
      return {
        id: row.id,
        status: row.status,
        tourPostId: row.tourPostId,
        tourDate: row.tourPost.tourDate,
        coverImage: row.tourPost.coverImage,
        titleRu: ruTitle,
        titleKz: kzTitle,
        titleEn: enTitle,
        place: row.tourPost.place,
        location: row.tourPost.location
      };
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}
