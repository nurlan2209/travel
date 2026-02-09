import { prisma } from "@/lib/prisma";
import type { AppLanguage } from "@/lib/constants";

export type MomentStatusValue = "PENDING" | "APPROVED" | "REJECTED";

type AdminMomentRow = {
  id: string;
  photoUrl: string;
  captionRu: string;
  captionKz: string;
  captionEn: string;
  status: MomentStatusValue;
  createdAt: Date;
  studentEmail: string;
  studentName: string | null;
  tourSlug: string;
  tourTitleRu: string | null;
};

type PublicMomentRow = {
  id: string;
  photoUrl: string;
  captionRu: string;
  captionKz: string;
  captionEn: string;
  createdAt: Date;
  studentName: string | null;
  tourSlug: string;
  titleRu: string | null;
  titleKz: string | null;
  titleEn: string | null;
};

type CreateMomentPayload = {
  userId: string;
  tourPostId: string;
  photoUrl: string;
  captionRu: string;
  captionKz: string;
  captionEn: string;
};

function cuidLike(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function hasStudentTravelMomentModel() {
  return "studentTravelMoment" in (prisma as unknown as Record<string, unknown>);
}

export function getMomentsDebugInfo() {
  return {
    hasStudentTravelMoment: hasStudentTravelMomentModel(),
    prismaKeysSample: Object.keys(prisma).slice(0, 25),
    nodeEnv: process.env.NODE_ENV ?? "unknown"
  };
}

export async function listMomentsAdmin() {
  const rows = await prisma.$queryRaw<AdminMomentRow[]>`
    SELECT
      stm.id,
      stm."photoUrl",
      stm."captionRu",
      stm."captionKz",
      stm."captionEn",
      stm.status::text as status,
      stm."createdAt",
      u.email as "studentEmail",
      sp."fullName" as "studentName",
      tp.slug as "tourSlug",
      tptru.title as "tourTitleRu"
    FROM "StudentTravelMoment" stm
    JOIN "User" u ON u.id = stm."userId"
    LEFT JOIN "StudentProfile" sp ON sp."userId" = u.id
    JOIN "TourPost" tp ON tp.id = stm."tourPostId"
    LEFT JOIN "TourPostTranslation" tptru
      ON tptru."tourPostId" = tp.id
      AND tptru.language = 'RU'::"Language"
    ORDER BY stm."createdAt" DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    photoUrl: row.photoUrl,
    captionRu: row.captionRu,
    captionKz: row.captionKz,
    captionEn: row.captionEn,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    studentEmail: row.studentEmail,
    studentName: row.studentName || "-",
    tourSlug: row.tourSlug,
    tourTitleRu: row.tourTitleRu || row.tourSlug
  }));
}

export async function hasCompletedEnrollment(userId: string, tourPostId: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "StudentTourEnrollment"
    WHERE "userId" = ${userId}
      AND "tourPostId" = ${tourPostId}
      AND status = 'COMPLETED'::"EnrollmentStatus"
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function createStudentMoment(payload: CreateMomentPayload) {
  const id = cuidLike("stm");
  const now = new Date();

  await prisma.$executeRaw`
    INSERT INTO "StudentTravelMoment" (
      id,
      "userId",
      "tourPostId",
      "photoUrl",
      "captionRu",
      "captionKz",
      "captionEn",
      status,
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${id},
      ${payload.userId},
      ${payload.tourPostId},
      ${payload.photoUrl},
      ${payload.captionRu},
      ${payload.captionKz},
      ${payload.captionEn},
      'PENDING'::"MomentStatus",
      ${now},
      ${now}
    )
  `;

  const rows = await prisma.$queryRaw<Array<{
    id: string;
    photoUrl: string;
    captionRu: string;
    captionKz: string;
    captionEn: string;
    status: MomentStatusValue;
    createdAt: Date;
    updatedAt: Date;
  }>>`
    SELECT
      id,
      "photoUrl",
      "captionRu",
      "captionKz",
      "captionEn",
      status::text as status,
      "createdAt",
      "updatedAt"
    FROM "StudentTravelMoment"
    WHERE id = ${id}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function updateMomentStatus(id: string, status: MomentStatusValue, moderatorNote?: string) {
  await prisma.$executeRaw`
    UPDATE "StudentTravelMoment"
    SET
      status = ${status}::"MomentStatus",
      "moderatorNote" = ${moderatorNote || null},
      "updatedAt" = ${new Date()}
    WHERE id = ${id}
  `;

  const rows = await prisma.$queryRaw<Array<{
    id: string;
    status: MomentStatusValue;
    moderatorNote: string | null;
    updatedAt: Date;
  }>>`
    SELECT id, status::text as status, "moderatorNote", "updatedAt"
    FROM "StudentTravelMoment"
    WHERE id = ${id}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;
  return { ...row, updatedAt: row.updatedAt.toISOString() };
}

export async function listApprovedMoments(lang: AppLanguage, take = 18) {
  const rows = await prisma.$queryRaw<PublicMomentRow[]>`
    SELECT
      stm.id,
      stm."photoUrl",
      stm."captionRu",
      stm."captionKz",
      stm."captionEn",
      stm."createdAt",
      sp."fullName" as "studentName",
      tp.slug as "tourSlug",
      tptru.title as "titleRu",
      tptkz.title as "titleKz",
      tpten.title as "titleEn"
    FROM "StudentTravelMoment" stm
    JOIN "TourPost" tp ON tp.id = stm."tourPostId"
    JOIN "User" u ON u.id = stm."userId"
    LEFT JOIN "StudentProfile" sp ON sp."userId" = u.id
    LEFT JOIN "TourPostTranslation" tptru
      ON tptru."tourPostId" = tp.id
      AND tptru.language = 'RU'::"Language"
    LEFT JOIN "TourPostTranslation" tptkz
      ON tptkz."tourPostId" = tp.id
      AND tptkz.language = 'KZ'::"Language"
    LEFT JOIN "TourPostTranslation" tpten
      ON tpten."tourPostId" = tp.id
      AND tpten.language = 'EN'::"Language"
    WHERE stm.status = 'APPROVED'::"MomentStatus"
    ORDER BY stm."createdAt" DESC
    LIMIT ${take}
  `;

  return rows.map((row) => {
    const caption = lang === "kz" ? row.captionKz : lang === "en" ? row.captionEn : row.captionRu;
    const tourTitle = lang === "kz" ? row.titleKz : lang === "en" ? row.titleEn : row.titleRu;
    return {
      id: row.id,
      photoUrl: row.photoUrl,
      caption,
      studentName: row.studentName || "Student",
      tourTitle: tourTitle || row.tourSlug,
      createdAt: row.createdAt.toISOString()
    };
  });
}
