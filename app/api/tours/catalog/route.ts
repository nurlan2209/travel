import { NextRequest, NextResponse } from "next/server";
import { normalizeLanguage } from "@/lib/i18n";
import { getTourCatalog, getTourLocations, normalizeSort } from "@/lib/tour-catalog";

export async function GET(request: NextRequest) {
  try {
    const lang = normalizeLanguage(request.nextUrl.searchParams.get("lang"));
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const location = request.nextUrl.searchParams.get("location") ?? undefined;
    const dateFrom = request.nextUrl.searchParams.get("dateFrom") ?? undefined;
    const dateTo = request.nextUrl.searchParams.get("dateTo") ?? undefined;
    const sort = normalizeSort(request.nextUrl.searchParams.get("sort"));
    const page = Number.parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
    const pageSize = Number.parseInt(request.nextUrl.searchParams.get("pageSize") ?? "12", 10);

    const [catalog, locations] = await Promise.all([
      getTourCatalog({
        lang,
        q,
        location,
        dateFrom,
        dateTo,
        sort,
        page,
        pageSize
      }),
      getTourLocations()
    ]);

    return NextResponse.json({
      items: catalog.items,
      meta: catalog.meta,
      locations
    });
  } catch (error) {
    console.error("[api/tours/catalog][GET]", error);
    return NextResponse.json({ message: "Failed to load catalog" }, { status: 500 });
  }
}

