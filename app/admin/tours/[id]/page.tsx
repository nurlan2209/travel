import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { TourForm } from "@/components/admin/tour-form";
import { adminT, resolveAdminLang } from "@/lib/admin-i18n";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTourPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const lang = resolveAdminLang(cookieStore.get("admin_lang")?.value);
  const dict = adminT(lang);

  const tour = await prisma.tourPost.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!tour) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">{dict.editTourTitle}</h1>
      <TourForm
        lang={lang}
        initial={{
          id: tour.id,
          slug: tour.slug,
          status: tour.status,
          coverImage: tour.coverImage,
          gallery: tour.gallery,
          price: tour.price,
          studentLimit: tour.studentLimit,
          duration: tour.duration,
          meetingTime: tour.meetingTime,
          tourDate: tour.tourDate.toISOString(),
          place: tour.place,
          location: tour.location,
          translations: tour.translations.map((item) => ({
            language: item.language,
            title: item.title,
            description: item.description,
            translationStatus: item.translationStatus,
            translationVersion: item.translationVersion,
            sourceRuHash: item.sourceRuHash,
            posterTemplateData: item.posterTemplateData as {
              posterA: {
                heroTagline: string;
                featureBlocks: Array<{ title: string; lines: string[] }>;
                priceLabel: string;
              };
              posterB: {
                programTitle: string;
                timeline: Array<{ time: string; text: string }>;
                priceLabel: string;
                registerNote: string;
              };
            }
          }))
        }}
      />
    </section>
  );
}
