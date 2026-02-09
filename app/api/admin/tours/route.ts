import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { tourInputSchema } from "@/lib/validation";

function mapTranslationData(input: {
  title: string;
  description: string;
  posterTemplateData: unknown;
  translationStatus?: "MANUAL" | "AUTO_GENERATED" | "AUTO_EDITED";
  translationVersion?: number;
  sourceRuHash?: string | null;
}) {
  return {
    title: input.title,
    description: input.description,
    posterTemplateData: input.posterTemplateData as Prisma.InputJsonValue,
    translationStatus: input.translationStatus ?? "MANUAL",
    translationVersion: input.translationVersion ?? 1,
    sourceRuHash: input.sourceRuHash ?? null
  };
}

export async function GET() {
  try {
    await requireRole(["ADMIN", "MANAGER"]);

    const tours = await prisma.tourPost.findMany({
      orderBy: { updatedAt: "desc" },
      include: { translations: true }
    });

    return NextResponse.json(tours);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const payload = tourInputSchema.parse(await request.json());

    const created = await prisma.tourPost.create({
      data: {
        slug: payload.slug,
        status: payload.status,
        coverImage: payload.coverImage,
        gallery: payload.gallery,
        price: payload.price,
        studentLimit: payload.studentLimit,
        duration: payload.duration,
        meetingTime: payload.meetingTime,
        tourDate: new Date(payload.tourDate),
        place: payload.place,
        location: payload.location,
        translations: {
          create: [
            {
              language: Language.KZ,
              ...mapTranslationData(payload.translations.kz)
            },
            {
              language: Language.RU,
              ...mapTranslationData(payload.translations.ru)
            },
            {
              language: Language.EN,
              ...mapTranslationData(payload.translations.en)
            }
          ]
        }
      },
      include: { translations: true }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
      const status = error.message === "FORBIDDEN" ? 403 : 401;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json({ message: "Validation error" }, { status: 400 });
  }
}
