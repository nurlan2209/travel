import { NextResponse } from "next/server";
import { normalizeLanguage } from "@/lib/i18n";
import { listDocumentsPublic } from "@/lib/documents-repo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = normalizeLanguage(searchParams.get("lang"));
    const documents = await listDocumentsPublic(lang);
    return NextResponse.json(documents);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
