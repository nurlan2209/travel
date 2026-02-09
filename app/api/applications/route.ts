import { NextResponse } from "next/server";
import { ApplicationStatus, TourStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/rbac";
import { studentTourApplicationCreateSchema } from "@/lib/validation";
import { ACTIVE_APPLICATION_STATUSES, getUtcDayRange } from "@/lib/application-workflow";

export async function POST(request: Request) {
  const tag = "[api/applications][POST]";
  try {
    const session = await requireStudent();
    const payload = studentTourApplicationCreateSchema.parse(await request.json());

    const tour = await prisma.tourPost.findFirst({
      where: { id: payload.tourPostId, status: TourStatus.PUBLISHED },
      select: {
        id: true,
        studentLimit: true,
        tourDate: true
      }
    });

    if (!tour) {
      return NextResponse.json({ message: "Тур недоступен" }, { status: 404 });
    }

    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        studentProfile: {
          select: {
            fullName: true,
            university: true,
            phone: true
          }
        }
      }
    });

    if (!student?.studentProfile) {
      return NextResponse.json({
        code: "PROFILE_REQUIRED",
        message: "Сначала заполните профиль студента"
      }, { status: 400 });
    }

    const goingCount = await prisma.studentTourApplication.count({
      where: {
        tourPostId: payload.tourPostId,
        status: ApplicationStatus.GOING
      }
    });

    if (goingCount >= tour.studentLimit) {
      return NextResponse.json({
        code: "TOUR_CLOSED",
        message: "Набор на этот тур закрыт"
      }, { status: 409 });
    }

    const { start, end } = getUtcDayRange(tour.tourDate);

    const dateConflict = await prisma.studentTourApplication.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ACTIVE_APPLICATION_STATUSES },
        tourPost: {
          tourDate: {
            gte: start,
            lte: end
          }
        }
      },
      select: {
        id: true,
        tourPostId: true
      }
    });

    if (dateConflict) {
      return NextResponse.json({
        code: "DATE_CONFLICT",
        message: "У вас уже есть активная заявка на эту дату"
      }, { status: 409 });
    }

    await prisma.studentTourApplication.create({
      data: {
        userId: session.user.id,
        tourPostId: payload.tourPostId,
        fullName: student.studentProfile.fullName,
        university: student.studentProfile.university,
        phone: student.studentProfile.phone,
        email: student.email,
        comment: payload.comment || null,
        status: ApplicationStatus.NEW
      }
    });

    return NextResponse.json({
      ok: true,
      status: ApplicationStatus.NEW,
      message: "Заявка отправлена, менеджер свяжется с вами"
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation error";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ code: "AUTH_REQUIRED", message: "Нужно войти в аккаунт" }, { status: 401 });
    }
    if (message === "FORBIDDEN") {
      return NextResponse.json({ code: "FORBIDDEN", message: "Только студент может отправлять заявки" }, { status: 403 });
    }
    console.error(tag, message, { error });
    return NextResponse.json({ message }, { status: 400 });
  }
}
