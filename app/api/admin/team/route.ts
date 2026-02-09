import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { teamMemberCreateSchema } from "@/lib/validation";
import { createTeamMember, listTeamMembersAdmin } from "@/lib/team-repo";

export async function GET() {
  const tag = "[api/admin/team][GET]";
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const members = await listTeamMembersAdmin();
    return NextResponse.json(members);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    console.error(tag, "Request failed", { message, status, error });
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  const tag = "[api/admin/team][POST]";
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    const payload = teamMemberCreateSchema.parse(await request.json());
    const member = await createTeamMember(payload);
    if (!member) {
      console.error(tag, "Created row was not returned");
      return NextResponse.json({ message: "Failed to fetch created team member" }, { status: 500 });
    }
    return NextResponse.json(member, { status: 201 });
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
