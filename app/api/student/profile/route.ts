import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/rbac";
import { studentProfileUpdateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireStudent();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        studentProfile: {
          select: {
            fullName: true,
            phone: true,
            university: true,
            avatarUrl: true,
            bio: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: "Пользователь не найден" }, { status: 404 });
    }

    if (user.studentProfile) {
      return NextResponse.json({
        ...user.studentProfile,
        user: { email: user.email }
      });
    }

    // Fallback for old student accounts created before profile data migration:
    // use latest application snapshot to restore profile fields.
    const latestApplication = await prisma.studentTourApplication.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        fullName: true,
        phone: true,
        university: true
      }
    });

    if (latestApplication) {
      const restoredProfile = await prisma.studentProfile.create({
        data: {
          userId: session.user.id,
          fullName: latestApplication.fullName,
          phone: latestApplication.phone,
          university: latestApplication.university
        },
        select: {
          fullName: true,
          phone: true,
          university: true,
          avatarUrl: true,
          bio: true
        }
      });

      return NextResponse.json({
        ...restoredProfile,
        user: { email: user.email }
      });
    }

    return NextResponse.json({
      fullName: "",
      phone: "",
      university: "",
      avatarUrl: null,
      bio: null,
      user: { email: user.email }
    });
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
