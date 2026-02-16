import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Calendar, Check, Clock3, MapPin, Sparkles, Users, X } from "lucide-react";
import { mapLangToPrismaEnum, normalizeLanguage } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/public/site-header";
import { authOptions } from "@/lib/auth";
import { TourLightboxGrid } from "@/components/public/tour-lightbox-grid";
import { OpenTourApplicationButton, TourApplicationModal } from "@/components/public/tour-application-modal";

export const dynamic = "force-dynamic";

type TourPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; preview?: string }>;
};

function formatDate(value: Date, lang: "kz" | "ru" | "en") {
  const locale = lang === "kz" ? "kk-KZ" : lang === "en" ? "en-US" : "ru-RU";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(value);
}

function formatPrice(value: number, lang: "kz" | "ru" | "en") {
  const locale = lang === "en" ? "en-US" : "ru-RU";
  return `${new Intl.NumberFormat(locale).format(value)} ₸`;
}

export default async function TourPage({ params, searchParams }: TourPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const lang = normalizeLanguage(query.lang);
  const previewRequested = query.preview === "1";

  const ui = {
    kz: {
      place: "Орын",
      location: "Локация",
      date: "Күні",
      meetup: "Жиналу",
      duration: "Ұзақтығы",
      spots: "Орын саны",
      apply: "Өтінім қалдыру",
      allTours: "Барлық турлар",
      posters: "Тур постерлері",
      gallery: "Галерея",
      overview: "Шолу",
      include: "Тур құрамына кіреді",
      exclude: "Тур құрамына кірмейді",
      tourPlan: "Тур жоспары",
      similar: "Ұқсас турлар",
      quickApply: "Онлайн өтінім",
      from: "Бағасы",
      emptyDetails: "Бұл бөлім әлі толтырылмаған."
    },
    ru: {
      place: "Место",
      location: "Локация",
      date: "Дата",
      meetup: "Сбор",
      duration: "Длительность",
      spots: "Лимит мест",
      apply: "Оставить заявку",
      allTours: "Все туры",
      posters: "Постеры тура",
      gallery: "Галерея",
      overview: "Обзор",
      include: "В стоимость входит",
      exclude: "Не входит",
      tourPlan: "План тура",
      similar: "Похожие туры",
      quickApply: "Быстрая заявка",
      from: "Цена",
      emptyDetails: "Этот раздел пока не заполнен."
    },
    en: {
      place: "Place",
      location: "Location",
      date: "Date",
      meetup: "Meetup",
      duration: "Duration",
      spots: "Seat limit",
      apply: "Apply now",
      allTours: "All tours",
      posters: "Tour posters",
      gallery: "Gallery",
      overview: "Overview",
      include: "Included",
      exclude: "Excluded",
      tourPlan: "Tour Plan",
      similar: "Similar tours",
      quickApply: "Quick application",
      from: "Price",
      emptyDetails: "This section is not filled yet."
    }
  }[lang];

  const tour = await prisma.tourPost.findUnique({
    where: { slug },
    include: {
      translations: true
    }
  });

  if (!tour) {
    notFound();
  }

  if (tour.status !== "PUBLISHED") {
    if (!previewRequested) {
      notFound();
    }
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "MANAGER") {
      notFound();
    }
  }

  const translation = tour.translations.find((item) => item.language === mapLangToPrismaEnum(lang)) ?? tour.translations[0];
  const translationData = (translation?.posterTemplateData ?? null) as {
    tourDetails?: {
      included?: string[];
      excluded?: string[];
      plan?: Array<{ title?: string; description?: string }>;
    };
  } | null;
  const includedItems = Array.isArray(translationData?.tourDetails?.included)
    ? translationData?.tourDetails?.included.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const excludedItems = Array.isArray(translationData?.tourDetails?.excluded)
    ? translationData?.tourDetails?.excluded.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const planItems = Array.isArray(translationData?.tourDetails?.plan)
    ? translationData?.tourDetails?.plan
        .filter((item): item is { title?: string; description?: string } => typeof item === "object" && item !== null)
        .map((item) => ({
          title: item.title?.trim() ?? "",
          description: item.description?.trim() ?? ""
        }))
        .filter((item) => item.title.length > 0 && item.description.length > 0)
    : [];
  const candidateTours = await prisma.tourPost.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: tour.id }
    },
    orderBy: { tourDate: "asc" },
    include: {
      translations: {
        where: { language: mapLangToPrismaEnum(lang) }
      }
    },
    take: 6
  });
  const relatedTours = [...candidateTours.filter((item) => item.location === tour.location), ...candidateTours.filter((item) => item.location !== tour.location)].slice(0, 2);
  const posterUrls = Array.from(
    new Set(
      tour.translations
        .flatMap((item) => {
          const data = item.posterTemplateData as { posterUrls?: string[] } | null;
          return Array.isArray(data?.posterUrls) ? data.posterUrls : [];
        })
        .filter(Boolean)
    )
  );

  return (
    <main className="theme-page-surface theme-tour-page min-h-screen bg-[#FFF9DF] text-[#0A1022]">
      <SiteHeader lang={lang} solidOnScrollTargetId="tour-hero" />

      <section id="tour-hero" className="relative overflow-hidden border-b border-[#0A1022]/10">
        <div className="relative h-[52vh] min-h-[360px] w-full">
          <Image
            src={tour.coverImage}
            alt={translation?.title ?? tour.place}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div className="absolute inset-x-0 bottom-6 z-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl rounded-3xl border border-white/28 bg-black/14 p-6 text-white shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-lg">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
              <Sparkles size={14} />
              MNU Travel
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">{translation?.title ?? tour.place}</h1>
            {tour.status === "DRAFT" ? (
              <p className="mt-3 inline-flex items-center rounded-full border border-amber-300/60 bg-amber-200/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-100">
                Draft preview
              </p>
            ) : null}
            {translation?.description ? (
              <p className="mt-3 text-sm leading-relaxed text-white/88 md:text-base">{translation.description}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <OpenTourApplicationButton
                label={ui.apply}
                className="rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-5 py-2.5 text-sm font-bold text-[#0A1022] transition hover:from-[#FFC000] hover:to-[#FFB000]"
              />
              <Link href={`/tours?lang=${lang}`} className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15">
                {ui.allTours}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:px-8">
        <div className="space-y-6">
          <article className="glass-white rounded-3xl border border-white/90 p-6">
            <h3 className="mb-3 text-2xl font-black">{ui.overview}</h3>
            <div className="mb-4 grid grid-cols-1 gap-3 text-sm text-[#0A1022]/85 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border border-[#0A1022]/10 bg-white/70 px-3 py-2.5">
                <Clock3 size={16} className="text-[#0D3B8E]" />
                <div>
                  <p className="text-xs text-[#0A1022]/60">{ui.duration}</p>
                  <p className="font-semibold">{tour.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#0A1022]/10 bg-white/70 px-3 py-2.5">
                <Calendar size={16} className="text-[#0D3B8E]" />
                <div>
                  <p className="text-xs text-[#0A1022]/60">{ui.date}</p>
                  <p className="font-semibold">{formatDate(tour.tourDate, lang)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#0A1022]/10 bg-white/70 px-3 py-2.5">
                <Users size={16} className="text-[#0D3B8E]" />
                <div>
                  <p className="text-xs text-[#0A1022]/60">{ui.spots}</p>
                  <p className="font-semibold">{tour.studentLimit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#0A1022]/10 bg-white/70 px-3 py-2.5">
                <MapPin size={16} className="text-[#0D3B8E]" />
                <div>
                  <p className="text-xs text-[#0A1022]/60">{ui.location}</p>
                  <p className="font-semibold">{tour.location}</p>
                </div>
              </div>
            </div>
            <p className="leading-relaxed text-[#0A1022]/75">
              {translation?.description || tour.place}
            </p>
          </article>

          <article className="glass-white rounded-3xl border border-white/90 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xl font-black">{ui.include}</h3>
                {includedItems.length === 0 ? (
                  <p className="text-sm text-[#0A1022]/60">{ui.emptyDetails}</p>
                ) : (
                  <ul className="space-y-2">
                    {includedItems.map((item, idx) => (
                      <li key={`${item}-${idx}`} className="flex items-center gap-2 text-sm text-[#0A1022]/75">
                        <Check size={16} className="text-[#0D3B8E]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="mb-3 text-xl font-black">{ui.exclude}</h3>
                {excludedItems.length === 0 ? (
                  <p className="text-sm text-[#0A1022]/60">{ui.emptyDetails}</p>
                ) : (
                  <ul className="space-y-2">
                    {excludedItems.map((item, idx) => (
                      <li key={`${item}-${idx}`} className="flex items-center gap-2 text-sm text-[#0A1022]/75">
                        <X size={16} className="text-[#C81F1F]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </article>

          <article className="glass-white rounded-3xl border border-white/90 p-6">
            <h3 className="mb-4 text-2xl font-black">{ui.tourPlan}</h3>
            {planItems.length === 0 ? (
              <p className="text-sm text-[#0A1022]/60">{ui.emptyDetails}</p>
            ) : (
              <div className="space-y-3">
                {planItems.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="rounded-2xl border border-[#0A1022]/10 bg-white/70 p-4">
                    <p className="text-sm font-bold text-[#0D3B8E]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#0A1022]/75">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </article>

          {posterUrls.length > 0 ? (
            <article className="glass-white rounded-3xl border border-white/90 p-6">
              <h3 className="mb-4 text-2xl font-black">{ui.posters}</h3>
              <TourLightboxGrid
                images={posterUrls}
                altPrefix={`${translation?.title ?? tour.place}-poster`}
                cardHeightClass="h-64"
              />
            </article>
          ) : null}

          {tour.gallery.length > 0 ? (
            <article className="glass-white rounded-3xl border border-white/90 p-6">
              <h3 className="mb-4 text-2xl font-black">{ui.gallery}</h3>
              <TourLightboxGrid
                images={tour.gallery}
                altPrefix={`${translation?.title ?? tour.place}-gallery`}
                cardHeightClass="h-56"
              />
            </article>
          ) : null}

          {relatedTours.length > 0 ? (
            <article className="glass-white rounded-3xl border border-white/90 p-6">
              <h3 className="mb-4 text-2xl font-black">{ui.similar}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedTours.map((item) => {
                  const itemTranslation = item.translations[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/tours/${item.slug}?lang=${lang}`}
                      className="overflow-hidden rounded-2xl border border-[#0A1022]/10 bg-white/70 transition hover:shadow-lg"
                    >
                      <div className="relative h-40">
                        <Image
                          src={item.coverImage}
                          alt={itemTranslation?.title ?? item.place}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-1 text-sm font-bold">{itemTranslation?.title ?? item.place}</p>
                        <p className="mt-1 text-xs text-[#0A1022]/65">{formatDate(item.tourDate, lang)}</p>
                        <p className="mt-2 text-sm font-black text-[#C81F1F]">{formatPrice(item.price, lang)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </article>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass-white-strong rounded-3xl border border-white/90 p-5">
            <p className="text-sm text-[#0A1022]/70">{ui.from}</p>
            <p className="mt-1 text-3xl font-black text-[#C81F1F]">{formatPrice(tour.price, lang)}</p>
            <p className="mt-3 text-sm text-[#0A1022]/70">{ui.quickApply}</p>
            <OpenTourApplicationButton
              label={ui.apply}
              className="mt-5 flex w-full items-center justify-center rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-4 py-3 text-sm font-bold text-[#0A1022] transition hover:from-[#FFC000] hover:to-[#FFB000]"
            />
          </div>
        </aside>
      </section>
      <TourApplicationModal
        lang={lang}
        tourPostId={tour.id}
        tourTitle={translation?.title ?? tour.place}
      />
    </main>
  );
}
