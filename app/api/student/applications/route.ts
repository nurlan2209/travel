import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await requireStudent();

    const rows = await prisma.studentTourApplication.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        manager: {
          select: {
            email: true
          }
        },
        tourPost: {
          include: {
            translations: true
          }
        }
      }
    });

    return NextResponse.json(
      rows.map((row) => ({
        id: row.id,
        status: row.status,
        comment: row.comment,
        managerComment: row.managerComment,
        createdAt: row.createdAt.toISOString(),
        contactedAt: row.contactedAt?.toISOString() ?? null,
        decisionAt: row.decisionAt?.toISOString() ?? null,
        managerEmail: row.manager?.email || null,
        tour: {
          id: row.tourPost.id,
          slug: row.tourPost.slug,
          tourDate: row.tourPost.tourDate.toISOString(),
          titleRu:
            row.tourPost.translations.find((translation) => translation.language === "RU")?.title ||
            row.tourPost.slug,
          titleKz:
            row.tourPost.translations.find((translation) => translation.language === "KZ")?.title ||
            row.tourPost.slug,
          titleEn:
            row.tourPost.translations.find((translation) => translation.language === "EN")?.title ||
            row.tourPost.slug
        }
      }))
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}
