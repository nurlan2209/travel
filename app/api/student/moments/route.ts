import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/rbac";
import { studentMomentCreateSchema } from "@/lib/validation";
import { createStudentMoment, hasCompletedEnrollment } from "@/lib/moments-repo";

export async function POST(request: Request) {
  const tag = "[api/student/moments][POST]";
  try {
    const session = await requireStudent();
    const payload = studentMomentCreateSchema.parse(await request.json());

    const enrollment = await hasCompletedEnrollment(session.user.id, payload.tourPostId);

    if (!enrollment) {
      return NextResponse.json({ message: "Момент можно добавить только после завершения тура" }, { status: 403 });
    }

    const moment = await createStudentMoment({
      userId: session.user.id,
      tourPostId: payload.tourPostId,
      photoUrl: payload.photoUrl,
      captionRu: payload.captionRu,
      captionKz: payload.captionKz,
      captionEn: payload.captionEn
    });
    if (!moment) {
      return NextResponse.json({ message: "Не удалось сохранить момент" }, { status: 500 });
    }

    return NextResponse.json(moment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation error";
    const status = message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 400;
    console.error(tag, message, { error });
    return NextResponse.json({ message }, { status });
  }
}
