import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapLangToPrismaEnum, normalizeLanguage } from "@/lib/i18n";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: Params) {
  const { slug } = await context.params;
  const lang = normalizeLanguage(request.nextUrl.searchParams.get("lang"));

  const tour = await prisma.tourPost.findUnique({
    where: { slug },
    include: {
      translations: {
        where: { language: mapLangToPrismaEnum(lang) }
      }
    }
  });

  if (!tour) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...tour,
    translation: tour.translations[0] ?? null
  });
}
