import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const buildPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

const cachedPrisma = globalForPrisma.prisma;
const hasTeamMemberDelegate = Boolean((cachedPrisma as PrismaClient & { teamMember?: unknown } | undefined)?.teamMember);

export const prisma = cachedPrisma && hasTeamMemberDelegate ? cachedPrisma : buildPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function getTeamMemberModel() {
  const extract = (client: PrismaClient) => {
    const candidate = client as unknown as Record<string, unknown>;
    if (!("teamMember" in candidate)) return null;
    const teamMember = candidate.teamMember;
    if (!teamMember || typeof teamMember !== "object") return null;
    return teamMember as PrismaClient["teamMember"];
  };

  const existing = extract(prisma);
  if (existing) return existing;

  // Dev fallback for stale hot-reload client instances.
  const freshClient = buildPrismaClient();
  const fresh = extract(freshClient);
  if (!fresh) return null;

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = freshClient;
  }

  return fresh;
}

export function getPrismaModelErrorMessage() {
  return "Team model unavailable. Restart dev server and run `npx prisma generate`.";
}

export function getPrismaDebugInfo() {
  const candidate = prisma as unknown as Record<string, unknown>;
  return {
    hasTeamMember: "teamMember" in candidate && Boolean(candidate.teamMember),
    prismaKeysSample: Object.keys(candidate).slice(0, 25),
    nodeEnv: process.env.NODE_ENV
  };
}
