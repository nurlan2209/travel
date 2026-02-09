import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { posterSettingsSchema } from "@/lib/validation";

export async function GET() {
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const settings =
      (await prisma.siteSettings.findUnique({ where: { id: "default" } })) ??
      (await prisma.siteSettings.create({
        data: {
          id: "default",
          brandTitle: "Этно-тур с MNU Travel",
          brandSubtitle: "Откройте для себя свободу и тайны кочевой жизни",
          instagramHandle: "@mnutravel",
          footerAddress: "Зона отдыха Balqaragai, Астана",
          topFrameText: "Этно-тур с MNU Travel",
          bottomFrameText: "Почувствуй атмосферу этно-тура с MNU Travel",
          decorTokens: {}
        }
      }));
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const payload = posterSettingsSchema.parse(await request.json());
    const normalizedPayload = {
      ...payload,
      decorTokens: (payload.decorTokens ?? {}) as Prisma.InputJsonValue
    };

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: normalizedPayload,
      create: {
        id: "default",
        ...normalizedPayload
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    if (["UNAUTHORIZED", "FORBIDDEN"].includes(message)) {
      const status = message === "FORBIDDEN" ? 403 : 401;
      return NextResponse.json({ message }, { status });
    }

    return NextResponse.json({ message: "Validation error" }, { status: 400 });
  }
}
