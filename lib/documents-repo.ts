import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AppLanguage } from "@/lib/constants";

export type SiteDocumentRecord = {
  id: string;
  titleRu: string;
  titleKz: string;
  titleEn: string;
  descriptionRu: string;
  descriptionKz: string;
  descriptionEn: string;
  fileUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type SiteDocumentCreatePayload = Omit<SiteDocumentRecord, "id" | "createdAt" | "updatedAt">;
type SiteDocumentUpdatePayload = Partial<SiteDocumentCreatePayload>;

function cuidLike() {
  return `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function mapAdminRow(row: SiteDocumentRecord) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function listDocumentsAdmin() {
  const rows = await prisma.$queryRaw<SiteDocumentRecord[]>`
    SELECT
      id,
      "titleRu",
      "titleKz",
      "titleEn",
      "descriptionRu",
      "descriptionKz",
      "descriptionEn",
      "fileUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "SiteDocument"
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;

  return rows.map(mapAdminRow);
}

export async function listDocumentsPublic(lang: AppLanguage) {
  const rows = await prisma.$queryRaw<SiteDocumentRecord[]>`
    SELECT
      id,
      "titleRu",
      "titleKz",
      "titleEn",
      "descriptionRu",
      "descriptionKz",
      "descriptionEn",
      "fileUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "SiteDocument"
    WHERE "isActive" = TRUE
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;

  return rows.map((row) => ({
    id: row.id,
    title: lang === "ru" ? row.titleRu : lang === "en" ? row.titleEn : row.titleKz,
    description: lang === "ru" ? row.descriptionRu : lang === "en" ? row.descriptionEn : row.descriptionKz,
    fileUrl: row.fileUrl,
    sortOrder: row.sortOrder
  }));
}

export async function createDocument(payload: SiteDocumentCreatePayload) {
  const id = cuidLike();
  const now = new Date();

  await prisma.$executeRaw`
    INSERT INTO "SiteDocument" (
      id,
      "titleRu",
      "titleKz",
      "titleEn",
      "descriptionRu",
      "descriptionKz",
      "descriptionEn",
      "fileUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${id},
      ${payload.titleRu},
      ${payload.titleKz},
      ${payload.titleEn},
      ${payload.descriptionRu},
      ${payload.descriptionKz},
      ${payload.descriptionEn},
      ${payload.fileUrl},
      ${payload.sortOrder},
      ${payload.isActive},
      ${now},
      ${now}
    )
  `;

  const rows = await prisma.$queryRaw<SiteDocumentRecord[]>`
    SELECT
      id,
      "titleRu",
      "titleKz",
      "titleEn",
      "descriptionRu",
      "descriptionKz",
      "descriptionEn",
      "fileUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "SiteDocument"
    WHERE id = ${id}
    LIMIT 1
  `;

  return rows[0] ? mapAdminRow(rows[0]) : null;
}

export async function updateDocument(id: string, payload: SiteDocumentUpdatePayload) {
  const keys = Object.keys(payload) as Array<keyof SiteDocumentUpdatePayload>;
  if (keys.length === 0) {
    const rows = await prisma.$queryRaw<SiteDocumentRecord[]>`
      SELECT
        id,
        "titleRu",
        "titleKz",
        "titleEn",
        "descriptionRu",
        "descriptionKz",
        "descriptionEn",
        "fileUrl",
        "sortOrder",
        "isActive",
        "createdAt",
        "updatedAt"
      FROM "SiteDocument"
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ? mapAdminRow(rows[0]) : null;
  }

  const setFragments = keys
    .map((key) => {
      switch (key) {
        case "titleRu":
          return Prisma.sql`"titleRu" = ${payload.titleRu}`;
        case "titleKz":
          return Prisma.sql`"titleKz" = ${payload.titleKz}`;
        case "titleEn":
          return Prisma.sql`"titleEn" = ${payload.titleEn}`;
        case "descriptionRu":
          return Prisma.sql`"descriptionRu" = ${payload.descriptionRu}`;
        case "descriptionKz":
          return Prisma.sql`"descriptionKz" = ${payload.descriptionKz}`;
        case "descriptionEn":
          return Prisma.sql`"descriptionEn" = ${payload.descriptionEn}`;
        case "fileUrl":
          return Prisma.sql`"fileUrl" = ${payload.fileUrl}`;
        case "sortOrder":
          return Prisma.sql`"sortOrder" = ${payload.sortOrder}`;
        case "isActive":
          return Prisma.sql`"isActive" = ${payload.isActive}`;
        default:
          return null;
      }
    })
    .filter((fragment): fragment is Prisma.Sql => fragment !== null);

  await prisma.$executeRaw(
    Prisma.sql`
      UPDATE "SiteDocument"
      SET ${Prisma.join(setFragments, ", ")}, "updatedAt" = ${new Date()}
      WHERE id = ${id}
    `
  );

  const rows = await prisma.$queryRaw<SiteDocumentRecord[]>`
    SELECT
      id,
      "titleRu",
      "titleKz",
      "titleEn",
      "descriptionRu",
      "descriptionKz",
      "descriptionEn",
      "fileUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "SiteDocument"
    WHERE id = ${id}
    LIMIT 1
  `;

  return rows[0] ? mapAdminRow(rows[0]) : null;
}

export async function deleteDocument(id: string) {
  await prisma.$executeRaw`
    DELETE FROM "SiteDocument"
    WHERE id = ${id}
  `;
}
