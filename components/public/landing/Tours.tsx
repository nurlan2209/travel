"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ToursProps {
  lang: "kz" | "ru" | "en";
}

type TourApiItem = {
  id: string;
  slug: string;
  price: number;
  duration: string;
  tourDate: string;
  location: string;
  place: string;
  studentLimit: number;
  coverImage: string;
  translation: {
    title: string;
    description: string;
    posterTemplateData?: {
      posterUrls?: string[];
    };
  } | null;
};

const fallbackTours: Array<{
  id: string;
  slug: string;
  title: { kz: string; ru: string; en: string };
  duration: string;
  date: string;
  location: { kz: string; ru: string; en: string };
  description: { kz: string; ru: string; en: string };
  price: string;
  participants: string;
  coverImage: string;
}> = [];

export default function Tours({ lang }: ToursProps) {
  const [apiTours, setApiTours] = useState<TourApiItem[]>([]);
  const [posterSlide, setPosterSlide] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadTours() {
      const response = await fetch(`/api/tours?lang=${lang}&status=published`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as TourApiItem[];
      setApiTours(data);
      setPosterSlide(
        data.reduce<Record<string, number>>((acc, item) => {
          acc[item.id] = 0;
          return acc;
        }, {})
      );
    }

    void loadTours();
  }, [lang]);

  const translations = {
    kz: {
      title: "Біздің турлар",
      subtitle: "Қазақстанның ең керемет жерлерін зерттеңіз",
      from: "бастап",
      details: "Толығырақ",
      participants: "Қатысушылар",
      viewMore: "Көбірек көру"
    },
    ru: {
      title: "Наши туры",
      subtitle: "Исследуйте самые удивительные места Казахстана",
      from: "от",
      details: "Подробнее",
      participants: "Участники",
      viewMore: "Посмотреть еще"
    },
    en: {
      title: "Our Tours",
      subtitle: "Explore the most amazing places in Kazakhstan",
      from: "from",
      details: "Learn More",
      participants: "Participants",
      viewMore: "View more"
    }
  };

  const t = translations[lang];

  const toursFromApi = apiTours.map((tour) => ({
    id: tour.id,
    slug: tour.slug,
    image: tour.coverImage,
    posterUrls: tour.translation?.posterTemplateData?.posterUrls?.filter(Boolean) ?? [],
    title: tour.translation?.title ?? tour.place,
    duration: tour.duration,
    date: new Date(tour.tourDate).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "en" ? "en-US" : "ru-RU"),
    location: tour.location,
    description: tour.translation?.description ?? tour.place,
    price: `${new Intl.NumberFormat(lang === "en" ? "en-US" : "ru-RU").format(tour.price)} ₸`,
    participants: String(tour.studentLimit)
  }));

  const data = toursFromApi.length > 0
    ? toursFromApi
    : fallbackTours.map((tour) => ({
      id: tour.id,
      slug: tour.slug,
      image: tour.coverImage,
      posterUrls: [],
      title: tour.title[lang],
      duration: tour.duration,
      date: tour.date,
      location: tour.location[lang],
      description: tour.description[lang],
      price: tour.price,
      participants: tour.participants
    }));

  const visibleTours = data.slice(0, 4);

  return (
    <section id="tours" className="bg-gradient-to-b from-white to-[#FFF9DF] py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-[#0A1022] md:text-5xl">{t.title}</h2>
          <p className="mx-auto max-w-2xl text-lg text-[#0A1022]/70">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleTours.map((tour) => {
            const hasPosters = tour.posterUrls.length > 0;
            const activePoster = posterSlide[tour.id] ?? 0;
            const posterImage = hasPosters ? tour.posterUrls[activePoster % tour.posterUrls.length] : null;

            return (
              <div
                key={tour.id}
                className="glass-card group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={posterImage || tour.image}
                    alt={tour.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {hasPosters ? (
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/40 px-3 py-1">
                      {tour.posterUrls.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPosterSlide((prev) => ({ ...prev, [tour.id]: idx }))}
                          className={`h-2.5 w-2.5 rounded-full ${activePoster === idx ? "bg-white" : "bg-white/40"}`}
                          aria-label={`poster-${idx + 1}`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="p-5">
                  <h3 className="mb-3 text-xl font-bold text-[#0A1022] transition-colors group-hover:text-[#0D3B8E]">
                    {tour.title}
                  </h3>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-[#0A1022]/70">
                      <Clock size={16} className="mr-2 text-[#0D3B8E]" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-[#0A1022]/70">
                      <Calendar size={16} className="mr-2 text-[#0D3B8E]" />
                      <span>{tour.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-[#0A1022]/70">
                      <MapPin size={16} className="mr-2 text-[#0D3B8E]" />
                      <span>{tour.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-[#0A1022]/70">
                      <Users size={16} className="mr-2 text-[#0D3B8E]" />
                      <span>
                        {t.participants}: {tour.participants}
                      </span>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-[#0A1022]/60">{tour.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#0A1022]/60">{t.from}</span>
                      <p className="text-xl font-bold text-[#C81F1F]">{tour.price}</p>
                    </div>
                    <Link
                      href={`/tours/${tour.slug}?lang=${lang}`}
                      className="rounded-lg border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-4 py-2 text-sm font-semibold text-[#0A1022] transition-all duration-300 hover:from-[#FFC000] hover:to-[#FFB000]"
                    >
                      {t.details}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={`/tours?lang=${lang}`}
            className="rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-7 py-3 text-sm font-bold text-[#0A1022] transition-all duration-300 hover:from-[#FFC000] hover:to-[#FFB000]"
          >
            {t.viewMore}
          </Link>
        </div>
      </div>
    </section>
  );
}
