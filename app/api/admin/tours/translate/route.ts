import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { translateRequestSchema } from "@/lib/validation";
import { hashRuSource, translateRuToKzEn } from "@/lib/translation";

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const payload = translateRequestSchema.parse(await request.json());

    const translated = await translateRuToKzEn(payload.ru);
    const sourceRuHash = hashRuSource(payload.ru);

    return NextResponse.json({
      kz: {
        ...translated.kz,
        translationStatus: "AUTO_GENERATED",
        translationVersion: 1,
        sourceRuHash
      },
      en: {
        ...translated.en,
        translationStatus: "AUTO_GENERATED",
        translationVersion: 1,
        sourceRuHash
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "TRANSLATION_FAILED";
    if (["UNAUTHORIZED", "FORBIDDEN"].includes(message)) {
      const status = message === "FORBIDDEN" ? 403 : 401;
      return NextResponse.json({ message }, { status });
    }
    return NextResponse.json({ message }, { status: 400 });
  }
}
