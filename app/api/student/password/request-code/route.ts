import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { forgotPasswordRequestSchema } from "@/lib/validation";
import { buildSixDigitCode } from "@/lib/student";
import { sendResetCodeEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  const tag = "[api/student/password/request-code][POST]";
  try {
    const payload = forgotPasswordRequestSchema.parse(await request.json());
    const email = payload.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, isActive: true }
    });

    if (!user || user.role !== Role.STUDENT || !user.isActive) {
      return NextResponse.json({ ok: true });
    }

    const code = buildSixDigitCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt
      }
    });

    await sendResetCodeEmail(email, code);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation error";
    console.error(tag, message, { error });
    if (message === "SMTP_CONFIG_MISSING") {
      return NextResponse.json({ message: "Email service is not configured" }, { status: 500 });
    }
    return NextResponse.json({ message }, { status: 400 });
  }
}
