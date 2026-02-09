import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TeamMemberRecord = {
  id: string;
  fullNameRu: string;
  fullNameKz: string;
  fullNameEn: string;
  positionRu: string;
  positionKz: string;
  positionEn: string;
  photoUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type TeamMemberCreatePayload = Omit<TeamMemberRecord, "id" | "createdAt" | "updatedAt">;
type TeamMemberUpdatePayload = Partial<TeamMemberCreatePayload>;

function mapRow(row: TeamMemberRecord) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function cuidLike() {
  return `tm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function listTeamMembersAdmin() {
  const rows = await prisma.$queryRaw<TeamMemberRecord[]>`
    SELECT
      id,
      "fullNameRu",
      "fullNameKz",
      "fullNameEn",
      "positionRu",
      "positionKz",
      "positionEn",
      "photoUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "TeamMember"
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;

  return rows.map(mapRow);
}

export async function listTeamMembersPublic() {
  const rows = await prisma.$queryRaw<TeamMemberRecord[]>`
    SELECT
      id,
      "fullNameRu",
      "fullNameKz",
      "fullNameEn",
      "positionRu",
      "positionKz",
      "positionEn",
      "photoUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "TeamMember"
    WHERE "isActive" = TRUE
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;

  return rows.map(mapRow);
}

export async function createTeamMember(payload: TeamMemberCreatePayload) {
  const id = cuidLike();
  const now = new Date();

  await prisma.$executeRaw`
    INSERT INTO "TeamMember" (
      id,
      "fullNameRu",
      "fullNameKz",
      "fullNameEn",
      "positionRu",
      "positionKz",
      "positionEn",
      "photoUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${id},
      ${payload.fullNameRu},
      ${payload.fullNameKz},
      ${payload.fullNameEn},
      ${payload.positionRu},
      ${payload.positionKz},
      ${payload.positionEn},
      ${payload.photoUrl},
      ${payload.sortOrder},
      ${payload.isActive},
      ${now},
      ${now}
    )
  `;

  const rows = await prisma.$queryRaw<TeamMemberRecord[]>`
    SELECT
      id,
      "fullNameRu",
      "fullNameKz",
      "fullNameEn",
      "positionRu",
      "positionKz",
      "positionEn",
      "photoUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "TeamMember"
    WHERE id = ${id}
    LIMIT 1
  `;

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function updateTeamMember(id: string, payload: TeamMemberUpdatePayload) {
  const keys = Object.keys(payload) as Array<keyof TeamMemberUpdatePayload>;
  if (keys.length === 0) {
    const rows = await prisma.$queryRaw<TeamMemberRecord[]>`
      SELECT
        id,
        "fullNameRu",
        "fullNameKz",
        "fullNameEn",
        "positionRu",
        "positionKz",
        "positionEn",
        "photoUrl",
        "sortOrder",
        "isActive",
        "createdAt",
        "updatedAt"
      FROM "TeamMember"
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ? mapRow(rows[0]) : null;
  }

  const setFragments = keys
    .map((key) => {
      switch (key) {
        case "fullNameRu":
          return Prisma.sql`"fullNameRu" = ${payload.fullNameRu}`;
        case "fullNameKz":
          return Prisma.sql`"fullNameKz" = ${payload.fullNameKz}`;
        case "fullNameEn":
          return Prisma.sql`"fullNameEn" = ${payload.fullNameEn}`;
        case "positionRu":
          return Prisma.sql`"positionRu" = ${payload.positionRu}`;
        case "positionKz":
          return Prisma.sql`"positionKz" = ${payload.positionKz}`;
        case "positionEn":
          return Prisma.sql`"positionEn" = ${payload.positionEn}`;
        case "photoUrl":
          return Prisma.sql`"photoUrl" = ${payload.photoUrl}`;
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
      UPDATE "TeamMember"
      SET ${Prisma.join(setFragments, ", ")}, "updatedAt" = ${new Date()}
      WHERE id = ${id}
    `
  );

  const rows = await prisma.$queryRaw<TeamMemberRecord[]>`
    SELECT
      id,
      "fullNameRu",
      "fullNameKz",
      "fullNameEn",
      "positionRu",
      "positionKz",
      "positionEn",
      "photoUrl",
      "sortOrder",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "TeamMember"
    WHERE id = ${id}
    LIMIT 1
  `;

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteTeamMember(id: string) {
  await prisma.$executeRaw`
    DELETE FROM "TeamMember"
    WHERE id = ${id}
  `;
}
