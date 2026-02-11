import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Calendar, Clock3, MapPin, Sparkles, Users } from "lucide-react";
import { mapLangToPrismaEnum, normalizeLanguage } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/public/site-header";
import { authOptions } from "@/lib/auth";

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
      gallery: "Галерея"
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
      gallery: "Галерея"
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
      gallery: "Gallery"
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
    <main className="theme-page-surface theme-tour-page min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fff7da_100%)] text-[#0A1022]">
      <SiteHeader lang={lang} />

      <section className="relative overflow-hidden pt-20">
        <div className="relative h-[52vh] min-h-[360px] w-full">
          <Image
            src={tour.coverImage}
            alt={translation?.title ?? tour.place}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,9,16,0.48)_0%,rgba(5,9,16,0.72)_100%)]" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-[#fff7da]" />

        <div className="absolute inset-x-0 top-24 z-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl rounded-3xl border border-white/25 bg-black/35 p-6 text-white shadow-[0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl">
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
              <Link
                href={`/?lang=${lang}#application`}
                className="rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-5 py-2.5 text-sm font-bold text-[#0A1022] transition hover:from-[#FFC000] hover:to-[#FFB000]"
              >
                {ui.apply}
              </Link>
              <Link href={`/tours?lang=${lang}`} className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15">
                {ui.allTours}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass-white-strong rounded-3xl border border-white/90 p-6">
          <h2 className="mb-4 text-2xl font-black">{ui.place}: {tour.place}</h2>
          <div className="grid gap-3 text-sm text-[#0A1022]/80 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl border border-[#0A1022]/10 bg-white/70 px-3 py-2.5">
              <MapPin size={16} className="text-[#0D3B8E]" />
              <span>{ui.location}: {tour.location}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#0A1022]/10 bg-white/70 px-3 py-2.5">
              <Calendar size={16} className="text-[#0D3B8E]" />
              <span>{ui.date}: {formatDate(tour.tourDate, lang)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#0A1022]/10 bg-white/70 px-3 py-2.5">
              <Clock3 size={16} className="text-[#0D3B8E]" />
              <span>{ui.duration}: {tour.duration}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#0A1022]/10 bg-white/70 px-3 py-2.5">
              <Users size={16} className="text-[#0D3B8E]" />
              <span>{ui.spots}: {tour.studentLimit}</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#FFD428]/30 bg-gradient-to-r from-[#fff5bd] to-white p-4">
            <p className="text-sm text-[#0A1022]/70">{ui.meetup}</p>
            <p className="mt-1 text-lg font-bold text-[#0A1022]">{tour.meetingTime}</p>
            <p className="mt-3 text-sm text-[#0A1022]/70">Цена</p>
            <p className="text-3xl font-black text-[#C81F1F]">{formatPrice(tour.price, lang)}</p>
          </div>
        </div>
      </section>

      {posterUrls.length > 0 ? (
        <section className="mx-auto -mt-6 max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="glass-white-strong rounded-3xl border border-white/90 p-6">
            <h2 className="mb-4 text-2xl font-black">{ui.posters}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posterUrls.map((url, idx) => (
                <img
                  key={`${url}-${idx}`}
                  src={url}
                  alt={`${translation?.title ?? tour.place}-poster-${idx + 1}`}
                  className="h-64 w-full rounded-2xl object-cover shadow-sm"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tour.gallery.length > 0 ? (
        <section className="mx-auto -mt-6 max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="glass-white-strong rounded-3xl border border-white/90 p-6">
            <h2 className="mb-4 text-2xl font-black">{ui.gallery}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tour.gallery.map((url, idx) => (
                <img
                  key={`${url}-${idx}`}
                  src={url}
                  alt={`${translation?.title ?? tour.place}-gallery-${idx + 1}`}
                  className="h-56 w-full rounded-2xl object-cover shadow-sm"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
