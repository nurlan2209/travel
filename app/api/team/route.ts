import { NextResponse } from "next/server";
import { listTeamMembersPublic } from "@/lib/team-repo";

export async function GET() {
  const tag = "[api/team][GET]";
  try {
    const members = await listTeamMembersPublic();

    return NextResponse.json(members);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch team";
    console.error(tag, "Query failed", { message, error });
    return NextResponse.json({ message }, { status: 500 });
  }
}
