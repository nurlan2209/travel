import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { siteDocumentUpdateSchema } from "@/lib/validation";
import { deleteDocument, updateDocument } from "@/lib/documents-repo";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Params) {
  const tag = "[api/admin/documents/:id][PATCH]";
  try {
    await requireRole(["ADMIN"]);
    const { id } = await context.params;
    const payload = siteDocumentUpdateSchema.parse(await request.json());
    const document = await updateDocument(id, payload);
    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }
    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
      const status = error.message === "FORBIDDEN" ? 403 : 401;
      console.error(tag, "RBAC failure", { message: error.message, status });
      return NextResponse.json({ message: error.message }, { status });
    }
    const errorMessage = error instanceof Error ? error.message : "Validation error";
    console.error(tag, "Update failed", { errorMessage, error });
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Params) {
  const tag = "[api/admin/documents/:id][DELETE]";
  try {
    await requireRole(["ADMIN"]);
    const { id } = await context.params;
    await deleteDocument(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
      const status = error.message === "FORBIDDEN" ? 403 : 401;
      console.error(tag, "RBAC failure", { message: error.message, status });
      return NextResponse.json({ message: error.message }, { status });
    }
    const errorMessage = error instanceof Error ? error.message : "Validation error";
    console.error(tag, "Delete failed", { errorMessage, error });
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
