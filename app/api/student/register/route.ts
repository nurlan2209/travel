import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { studentRegisterSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const tag = "[api/student/register][POST]";
  try {
    const parsed = studentRegisterSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    const payload = parsed.data;

    const email = payload.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.STUDENT,
        isActive: true,
        studentProfile: {
          create: {
            fullName: payload.fullName,
            phone: payload.phone,
            university: payload.university
          }
        }
      },
      select: { id: true, email: true }
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Validation error";
    console.error(tag, message, { error });
    return NextResponse.json({ message }, { status: 400 });
  }
}
