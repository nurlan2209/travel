import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const tourPostId = searchParams.get("tourPostId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const q = searchParams.get("q")?.trim();

    const where: Prisma.StudentTourApplicationWhereInput = {};

    if (statusParam && ["NEW", "CONTACTED", "GOING", "NOT_GOING"].includes(statusParam)) {
      where.status = statusParam as ApplicationStatus;
    }

    if (tourPostId) {
      where.tourPostId = tourPostId;
    }

    if (dateFrom || dateTo) {
      where.tourPost = {
        tourDate: {
          gte: dateFrom ? new Date(dateFrom) : undefined,
          lte: dateTo ? new Date(dateTo) : undefined
        }
      };
    }

    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { university: { contains: q, mode: "insensitive" } },
        { comment: { contains: q, mode: "insensitive" } }
      ];
    }

    const rows = await prisma.studentTourApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        manager: {
          select: {
            id: true,
            email: true
          }
        },
        tourPost: {
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
          }
        },
        statusLogs: {
          orderBy: { createdAt: "desc" },
          include: {
            changedBy: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(
      rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        managerId: row.managerId,
        fullName: row.fullName,
        university: row.university,
        phone: row.phone,
        email: row.email,
        comment: row.comment,
        managerComment: row.managerComment,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        contactedAt: row.contactedAt?.toISOString() ?? null,
        decisionAt: row.decisionAt?.toISOString() ?? null,
        manager: row.manager,
        tour: {
          id: row.tourPost.id,
          slug: row.tourPost.slug,
          tourDate: row.tourPost.tourDate.toISOString(),
          studentLimit: row.tourPost.studentLimit,
          titleRu:
            row.tourPost.translations.find((translation) => translation.language === "RU")?.title ||
            row.tourPost.slug
        },
        statusLogs: row.statusLogs.map((log) => ({
          id: log.id,
          fromStatus: log.fromStatus,
          toStatus: log.toStatus,
          note: log.note,
          createdAt: log.createdAt.toISOString(),
          changedBy: log.changedBy
        }))
      }))
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
