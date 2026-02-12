import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isStudentRoute = request.nextUrl.pathname.startsWith("/student");

  if (!isAdminRoute && !isStudentRoute) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/?auth=1", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as "ADMIN" | "MANAGER" | "STUDENT" | undefined;
  if (isAdminRoute && role === "STUDENT") {
    return NextResponse.redirect(new URL("/student", request.url));
  }
  if (isStudentRoute && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/admin/applications", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"]
};
