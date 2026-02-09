import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireRole(allowedRoles: Array<"ADMIN" | "MANAGER" | "STUDENT">) {
  const session = await requireSession();
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireStudent() {
  const session = await requireSession();
  if (session.user.role !== "STUDENT") {
    throw new Error("FORBIDDEN");
  }
  return session;
}
