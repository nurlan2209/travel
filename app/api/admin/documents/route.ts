import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { siteDocumentCreateSchema } from "@/lib/validation";
import { createDocument, listDocumentsAdmin } from "@/lib/documents-repo";

export async function GET() {
  const tag = "[api/admin/documents][GET]";
  try {
    await requireRole(["ADMIN"]);
    const documents = await listDocumentsAdmin();
    return NextResponse.json(documents);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    console.error(tag, "Request failed", { message, status, error });
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  const tag = "[api/admin/documents][POST]";
  try {
    await requireRole(["ADMIN"]);
    const payload = siteDocumentCreateSchema.parse(await request.json());
    const document = await createDocument(payload);
    if (!document) {
      console.error(tag, "Created row was not returned");
      return NextResponse.json({ message: "Failed to fetch created document" }, { status: 500 });
    }
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
      const status = error.message === "FORBIDDEN" ? 403 : 401;
      console.error(tag, "RBAC failure", { message: error.message, status });
      return NextResponse.json({ message: error.message }, { status });
    }
    const errorMessage = error instanceof Error ? error.message : "Validation error";
    console.error(tag, "Create failed", { errorMessage, error });
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
