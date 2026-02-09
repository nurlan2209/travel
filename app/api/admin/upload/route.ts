import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { cloudinary } from "@/lib/cloudinary";

export async function POST() {
  try {
    await requireRole(["ADMIN", "MANAGER"]);

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "mnu-travel/tours";

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder
      },
      process.env.CLOUDINARY_API_SECRET || ""
    );

    return NextResponse.json({
      timestamp,
      folder,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ message }, { status });
  }
}
