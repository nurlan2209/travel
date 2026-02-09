import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { forgotPasswordConfirmSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const parsed = forgotPasswordConfirmSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    const payload = parsed.data;
    const email = payload.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ message: "Код недействителен" }, { status: 400 });
    }

    const codeRecord = await prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        code: payload.code,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!codeRecord) {
      return NextResponse.json({ message: "Код недействителен или истек" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      prisma.passwordResetCode.update({
        where: { id: codeRecord.id },
        data: { consumedAt: new Date() }
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }
}
