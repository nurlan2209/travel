import { NextResponse } from "next/server";
import { normalizeLanguage } from "@/lib/i18n";

export async function POST(request: Request) {
  const payload = (await request.json()) as { lang?: string };
  const lang = normalizeLanguage(payload?.lang);

  const response = NextResponse.json({ ok: true, lang });
  response.cookies.set("admin_lang", lang, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax"
  });
  return response;
}
