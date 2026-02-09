import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { roleUpdateSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Params) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await context.params;
    const payload = roleUpdateSchema.parse(await request.json());

    const user = await prisma.user.update({
      where: { id },
      data: { role: payload.role },
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

    return NextResponse.json({ message: "Validation error" }, { status: 400 });
  }
}
