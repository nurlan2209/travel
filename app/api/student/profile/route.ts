import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/rbac";
import { studentProfileUpdateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireStudent();
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        fullName: true,
        phone: true,
        university: true,
        avatarUrl: true,
        bio: true,
        user: { select: { email: true } }
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireStudent();
    const payload = studentProfileUpdateSchema.parse(await request.json());

    const profile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        fullName: payload.fullName,
        phone: payload.phone,
        university: payload.university,
        avatarUrl: payload.avatarUrl || null,
        bio: payload.bio || null
      },
      create: {
        userId: session.user.id,
        fullName: payload.fullName,
        phone: payload.phone,
        university: payload.university,
        avatarUrl: payload.avatarUrl || null,
        bio: payload.bio || null
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation error";
    if (message === "FORBIDDEN" || message === "UNAUTHORIZED") {
      return NextResponse.json({ message }, { status: message === "FORBIDDEN" ? 403 : 401 });
    }
    return NextResponse.json({ message }, { status: 400 });
  }
}
