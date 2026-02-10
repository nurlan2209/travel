import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { userUpdateSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Params) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await context.params;
    const parsed = userUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    const payload = parsed.data;

    const data: {
      email?: string;
      isActive?: boolean;
      passwordHash?: string;
    } = {};

    if (payload.email) data.email = payload.email.trim().toLowerCase();
    if (typeof payload.isActive === "boolean") data.isActive = payload.isActive;
    if (payload.password) data.passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
      const status = error.message === "FORBIDDEN" ? 403 : 401;
      return NextResponse.json({ message: error.message }, { status });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    return NextResponse.json({ message: error instanceof Error ? error.message : "Validation error" }, { status: 400 });
  }
}
