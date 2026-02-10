import { Prisma, TourStatus } from "@prisma/client";
import type { AppLanguage } from "@/lib/constants";
import { mapLangToPrismaEnum } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export type TourCatalogSort = "date_asc" | "date_desc" | "price_asc" | "price_desc";

export type TourCatalogParams = {
  lang: AppLanguage;
  q?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: TourCatalogSort;
  page?: number;
  pageSize?: number;
};

export type TourCatalogItem = {
  id: string;
  slug: string;
  coverImage: string;
  price: number;
  duration: string;
  tourDate: Date;
  place: string;
  location: string;
  meetingTime: string;
  studentLimit: number;
  title: string;
  description: string;
};

export function normalizeSort(value?: string | null): TourCatalogSort {
  if (value === "price_asc") return "price_asc";
  if (value === "price_desc") return "price_desc";
  if (value === "date_desc") return "date_desc";
  return "date_asc";
}

function parseDateStart(value?: string) {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseDateEnd(value?: string) {
  if (!value) return undefined;
  const d = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function clampInt(value: number | undefined, min: number, max: number, fallback: number) {
  if (!value || Number.isNaN(value)) return fallback;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export async function getTourCatalog(params: TourCatalogParams) {
  const langEnum = mapLangToPrismaEnum(params.lang);
  const page = clampInt(params.page, 1, 9999, 1);
  const pageSize = clampInt(params.pageSize, 1, 50, 12);
  const q = params.q?.trim();
  const location = params.location?.trim();
  const dateFrom = parseDateStart(params.dateFrom);
  const dateTo = parseDateEnd(params.dateTo);
  const sort = normalizeSort(params.sort);

  const andFilters: Prisma.TourPostWhereInput[] = [{ status: TourStatus.PUBLISHED }];

  if (location) {
    andFilters.push({
      location: {
        equals: location,
        mode: "insensitive"
      }
    });
  }

  if (dateFrom || dateTo) {
    andFilters.push({
      tourDate: {
        gte: dateFrom,
        lte: dateTo
      }
    });
  }

  if (q) {
    andFilters.push({
      OR: [
        { place: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        {
          translations: {
            some: {
              language: langEnum,
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } }
              ]
            }
          }
        }
      ]
    });
  }

  const where: Prisma.TourPostWhereInput = { AND: andFilters };
  const orderBy: Prisma.TourPostOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "date_desc"
          ? { tourDate: "desc" }
          : { tourDate: "asc" };

  const [total, rows] = await prisma.$transaction([
    prisma.tourPost.count({ where }),
    prisma.tourPost.findMany({
      where,
      include: {
        translations: {
          where: { language: langEnum }
        }
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  const items: TourCatalogItem[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    coverImage: row.coverImage,
    price: row.price,
    duration: row.duration,
    tourDate: row.tourDate,
    place: row.place,
    location: row.location,
    meetingTime: row.meetingTime,
    studentLimit: row.studentLimit,
    title: row.translations[0]?.title ?? row.place,
    description: row.translations[0]?.description ?? row.place
  }));

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  };
}

export async function getTourLocations() {
  const rows = await prisma.tourPost.findMany({
    where: { status: TourStatus.PUBLISHED },
    select: { location: true }
  });
  const unique = Array.from(new Set(rows.map((row) => row.location).filter(Boolean)));
  return unique.sort((a, b) => a.localeCompare(b, "ru"));
}
