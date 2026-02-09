import { prisma } from "@/lib/prisma";
import type { AppLanguage } from "@/lib/constants";
import { listApprovedMoments } from "@/lib/moments-repo";

export function buildSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function pickMomentCaption(
  moment: { captionRu: string; captionKz: string; captionEn: string },
  lang: AppLanguage
) {
  if (lang === "kz") return moment.captionKz;
  if (lang === "en") return moment.captionEn;
  return moment.captionRu;
}

export async function recalculateEnrollmentStatuses(userId: string) {
  const now = new Date();
  await prisma.studentTourEnrollment.updateMany({
    where: {
      userId,
      status: "ENROLLED",
      tourPost: {
        tourDate: { lt: now }
      }
    },
    data: { status: "COMPLETED" }
  });
}

export async function getApprovedMoments(lang: AppLanguage) {
  return listApprovedMoments(lang, 18);
}
