import { NextResponse } from "next/server";
import { normalizeLanguage } from "@/lib/i18n";
import { getApprovedMoments } from "@/lib/student";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = normalizeLanguage(searchParams.get("lang"));
  const moments = await getApprovedMoments(lang);
  return NextResponse.json(moments);
}
