import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { updateMomentStatus } from "@/lib/moments-repo";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  moderatorNote: z.string().optional()
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Params) {
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const { id } = await context.params;
    const payload = schema.parse(await request.json());

    const updated = await updateMomentStatus(id, payload.status, payload.moderatorNote);
    if (!updated) {
      return NextResponse.json({ message: "Moment not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation error";
    const status = message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
