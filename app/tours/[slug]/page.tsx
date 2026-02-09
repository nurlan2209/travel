import { notFound } from "next/navigation";
import Image from "next/image";
import { normalizeLanguage, t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { mapLangToPrismaEnum } from "@/lib/i18n";
import { PosterPreview } from "@/components/public/poster-preview";
import { SiteHeader } from "@/components/public/site-header";
import { formatCurrencyKzt } from "@/lib/utils";

export const dynamic = "force-dynamic";

type TourPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function TourPage({ params, searchParams }: TourPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const lang = normalizeLanguage(query.lang);
  const dict = t(lang);

  const tour = await prisma.tourPost.findUnique({
    where: { slug },
    include: {
      translations: {
        where: { language: mapLangToPrismaEnum(lang) }
      }
    }
  });

  if (!tour) {
    notFound();
  }

  const translation = tour.translations[0];
  const posterUrls =
    (translation?.posterTemplateData as { posterUrls?: string[] } | undefined)?.posterUrls?.filter(Boolean) ??
    [];
  const effectivePosters = posterUrls;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1f3a5f_0%,#091525_50%,#050910_100%)] text-white">
      <SiteHeader lang={lang} />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-28 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="text-4xl font-black">{translation?.title ?? tour.place}</h1>
          <p className="text-white/80">{translation?.description}</p>
          <ul className="space-y-2 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
            <li>{dict.tourPlace}: {tour.place}</li>
            <li>{dict.tourLocation}: {tour.location}</li>
            <li>{dict.tourDate}: {new Date(tour.tourDate).toLocaleDateString()}</li>
            <li>{dict.tourMeetup}: {tour.meetingTime}</li>
            <li>{dict.tourDuration}: {tour.duration}</li>
            <li className="text-lg font-black text-[#ffb3b3]">{formatCurrencyKzt(tour.price)}</li>
          </ul>
          <a href={`/?lang=${lang}#application`} className="inline-block rounded-full bg-[#8d1111] px-5 py-3 text-sm font-semibold">
            {dict.tourApply}
          </a>
        </div>

        <div className="space-y-4">
          {effectivePosters.length > 0 ? (
            effectivePosters.map((poster, idx) => (
              <Image
                key={`${poster}-${idx}`}
                src={poster}
                alt={`${translation?.title ?? tour.place} poster ${idx + 1}`}
                width={1080}
                height={1350}
                className="w-full rounded-3xl object-cover"
              />
            ))
          ) : (
            <>
              <Image
                src={tour.coverImage}
                alt={translation?.title ?? tour.place}
                width={1200}
                height={700}
                className="h-72 w-full rounded-3xl object-cover"
              />
              <PosterPreview posterData={translation?.posterTemplateData ?? {}} lang={lang} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
