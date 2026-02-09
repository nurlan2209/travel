import { NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { adminApplicationStatusUpdateSchema } from "@/lib/validation";
import {
  canTransitionApplicationStatus,
  isDecisionStatus
} from "@/lib/application-workflow";
import { sendApplicationStatusEmail } from "@/lib/mailer";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Params) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    const { id } = await context.params;
    const payload = adminApplicationStatusUpdateSchema.parse(await request.json());

    const application = await prisma.studentTourApplication.findUnique({
      where: { id },
      include: {
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
        }
      }
    });

    if (!application) {
      return NextResponse.json({ message: "Заявка не найдена" }, { status: 404 });
    }

    const nextStatus = payload.status as ApplicationStatus;

    if (application.status !== nextStatus && !canTransitionApplicationStatus(application.status, nextStatus)) {
      return NextResponse.json(
        {
          code: "INVALID_STATUS_TRANSITION",
          message: "Недопустимый переход статуса"
        },
        { status: 409 }
      );
    }

    if (nextStatus === "GOING" && application.status !== "GOING") {
      const goingCount = await prisma.studentTourApplication.count({
        where: {
          tourPostId: application.tourPostId,
          status: "GOING",
          NOT: { id: application.id }
        }
      });

      if (goingCount >= application.tourPost.studentLimit) {
        return NextResponse.json(
          {
            code: "TOUR_CLOSED",
            message: "Лимит мест достигнут, набор закрыт"
          },
          { status: 409 }
        );
      }
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.studentTourApplication.update({
        where: { id: application.id },
        data: {
          status: nextStatus,
          managerId: session.user.id,
          managerComment: payload.note ?? application.managerComment,
          contactedAt:
            nextStatus === "CONTACTED"
              ? application.contactedAt ?? now
              : application.contactedAt,
          decisionAt: isDecisionStatus(nextStatus) ? now : application.decisionAt
        }
      });

      if (application.status !== nextStatus) {
        await tx.applicationStatusLog.create({
          data: {
            applicationId: application.id,
            fromStatus: application.status,
            toStatus: nextStatus,
            changedById: session.user.id,
            note: payload.note || null
          }
        });
      }

      if (application.userId) {
        if (nextStatus === "GOING") {
          await tx.studentTourEnrollment.upsert({
            where: {
              userId_tourPostId: {
                userId: application.userId,
                tourPostId: application.tourPostId
              }
            },
            update: {
              status: "ENROLLED"
            },
            create: {
              userId: application.userId,
              tourPostId: application.tourPostId,
              status: "ENROLLED"
            }
          });
        }

        if (nextStatus === "NOT_GOING") {
          await tx.studentTourEnrollment.updateMany({
            where: {
              userId: application.userId,
              tourPostId: application.tourPostId,
              status: "ENROLLED"
            },
            data: {
              status: "CANCELLED"
            }
          });
        }
      }

      return updated;
    });

    try {
      const tourTitle =
        application.tourPost.translations.find((translation) => translation.language === "RU")?.title ||
        application.tourPost.slug;
      await sendApplicationStatusEmail({
        email: application.email,
        fullName: application.fullName,
        tourTitle,
        tourDate: application.tourPost.tourDate,
        status: nextStatus,
        note: payload.note
      });
    } catch (mailError) {
      console.error("[api/admin/applications/:id/status][PATCH] mail_error", mailError);
    }

    return NextResponse.json({
      id: result.id,
      status: result.status,
      managerComment: result.managerComment,
      contactedAt: result.contactedAt?.toISOString() ?? null,
      decisionAt: result.decisionAt?.toISOString() ?? null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation error";
    if (message === "FORBIDDEN") {
      return NextResponse.json({ message }, { status: 403 });
    }
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ message }, { status: 401 });
    }
    return NextResponse.json({ message }, { status: 400 });
  }
}
