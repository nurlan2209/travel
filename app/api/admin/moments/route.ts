import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { listMomentsAdmin } from "@/lib/moments-repo";

export async function GET() {
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const rows = await listMomentsAdmin();
    return NextResponse.json(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}
