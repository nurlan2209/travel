import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { teamMemberUpdateSchema } from "@/lib/validation";
import { deleteTeamMember, updateTeamMember } from "@/lib/team-repo";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Params) {
  const tag = "[api/admin/team/:id][PATCH]";
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const { id } = await context.params;
    const payload = teamMemberUpdateSchema.parse(await request.json());
    const member = await updateTeamMember(id, payload);
    if (!member) {
      return NextResponse.json({ message: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json(member);
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
  const tag = "[api/admin/team/:id][DELETE]";
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const { id } = await context.params;
    await deleteTeamMember(id);
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
