import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { tourInputSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

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

export async function GET(_request: Request, context: Params) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const { id } = await context.params;

    const tour = await prisma.tourPost.findUnique({
      where: { id },
      include: { translations: true }
    });

    if (!tour) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(tour);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(request: Request, context: Params) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const { id } = await context.params;
    const payload = tourInputSchema.parse(await request.json());

    const updated = await prisma.tourPost.update({
      where: { id },
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
        location: payload.location
      }
    });

    await Promise.all([
      prisma.tourPostTranslation.upsert({
        where: { tourPostId_language: { tourPostId: id, language: Language.KZ } },
        create: { tourPostId: id, language: Language.KZ, ...mapTranslationData(payload.translations.kz) },
        update: mapTranslationData(payload.translations.kz)
      }),
      prisma.tourPostTranslation.upsert({
        where: { tourPostId_language: { tourPostId: id, language: Language.RU } },
        create: { tourPostId: id, language: Language.RU, ...mapTranslationData(payload.translations.ru) },
        update: mapTranslationData(payload.translations.ru)
      }),
      prisma.tourPostTranslation.upsert({
        where: { tourPostId_language: { tourPostId: id, language: Language.EN } },
        create: { tourPostId: id, language: Language.EN, ...mapTranslationData(payload.translations.en) },
        update: mapTranslationData(payload.translations.en)
      })
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
      const status = error.message === "FORBIDDEN" ? 403 : 401;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json({ message: "Validation error" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Params) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const { id } = await context.params;

    await prisma.tourPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}
