import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "rtf",
  "odt",
  "ods",
  "odp"
]);

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot < 0) return "";
  return fileName.slice(lastDot + 1).toLowerCase();
}

function sanitizeBaseName(fileName: string) {
  const base = fileName.replace(/\.[^/.]+$/, "");
  return base
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "document";
}

export async function POST(request: Request) {
  const tag = "[api/admin/documents/upload][POST]";
  try {
    await requireRole(["ADMIN"]);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Файл не передан" }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ message: "Пустой файл" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ message: "Файл слишком большой (макс. 25MB)" }, { status: 400 });
    }

    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ message: "Неподдерживаемый формат файла" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "documents");
    await mkdir(uploadsDir, { recursive: true });

    const safeBaseName = sanitizeBaseName(file.name);
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeBaseName}.${extension}`;
    const fullPath = path.join(uploadsDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(arrayBuffer));

    return NextResponse.json({
      ok: true,
      fileName: file.name,
      fileSize: file.size,
      url: `/uploads/documents/${fileName}`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    if (message === "FORBIDDEN" || message === "UNAUTHORIZED") {
      return NextResponse.json({ message }, { status: message === "FORBIDDEN" ? 403 : 401 });
    }
    console.error(tag, "Upload failed", { error });
    return NextResponse.json({ message: "Не удалось загрузить файл" }, { status: 500 });
  }
}
