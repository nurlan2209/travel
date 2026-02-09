import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { userCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const parsed = userCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    const payload = parsed.data;
    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        role: payload.role,
        isActive: payload.isActive,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
      const status = error.message === "FORBIDDEN" ? 403 : 401;
      return NextResponse.json({ message: error.message }, { status });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }

    return NextResponse.json({ message: error instanceof Error ? error.message : "Validation error" }, { status: 400 });
  }
}
