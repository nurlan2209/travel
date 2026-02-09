"use client";

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
  coverImage: string;
  translation: {
    title: string;
    description: string;
    posterTemplateData?: {
      posterUrls?: string[];
    };
  } | null;
};

const fallbackTours = [
  {
    id: "fallback-1",
    slug: "kolsai-lakes",
    title: { kz: "Көлсай көлдері", ru: "Кольсайские озера", en: "Kolsai Lakes" },
    duration: "3 дня",
    date: "15-17 марта",
    location: { kz: "Алматы облысы", ru: "Алматинская область", en: "Almaty Region" },
    description: {
      kz: "Таулы көлдердің әдемілігін тамашалаңыз",
      ru: "Насладитесь красотой горных озер",
      en: "Enjoy the beauty of mountain lakes"
    },
    price: "35 000 ₸",
    participants: "15-20",
    isStudentTour: true,
    coverImage:
      "https://images.unsplash.com/photo-1686645995031-35ca3a653af5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
  }
];

export default function Tours({ lang }: ToursProps) {
  const [activeTab, setActiveTab] = useState<"all" | "student">("all");
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
      tabAll: "Барлық турлар",
      tabStudent: "Студенттер турлары",
      from: "бастап",
      details: "Толығырақ",
      participants: "Қатысушылар",
      posterMode: "Режим постеров"
    },
    ru: {
      title: "Наши туры",
      subtitle: "Исследуйте самые удивительные места Казахстана",
      tabAll: "Все туры",
      tabStudent: "Туры студентов",
      from: "от",
      details: "Подробнее",
      participants: "Участники",
      posterMode: "Режим постеров"
    },
    en: {
      title: "Our Tours",
      subtitle: "Explore the most amazing places in Kazakhstan",
      tabAll: "All Tours",
      tabStudent: "Student Tours",
      from: "from",
      details: "Learn More",
      participants: "Participants",
      posterMode: "Poster mode"
    }
  };

  const t = translations[lang];

  const toursFromApi = apiTours.map((tour, idx) => ({
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
    participants: "15-30",
    isStudentTour: idx % 2 === 0
  }));

  const data = toursFromApi.length > 0 ? toursFromApi : fallbackTours.map((tour) => ({
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
    participants: tour.participants,
    isStudentTour: tour.isStudentTour
  }));

  const filteredTours = activeTab === "all" ? data : data.filter((tour) => tour.isStudentTour);

  return (
    <section id="tours" className="py-20 bg-gradient-to-b from-white to-[#FFF9DF]">
      <div id="student-tours" className="sr-only" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A1022] mb-4">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex glass-card rounded-2xl p-2 shadow-lg border border-white/60">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "all"
                  ? "bg-gradient-to-br from-[#FFD428] to-[#FFC000] text-[#0A1022] shadow-lg border border-[#FFE066]"
                  : "text-[#0A1022]/70 hover:text-[#0A1022] hover:bg-white/30"
              }`}
            >
              {t.tabAll}
            </button>
            <button
              onClick={() => setActiveTab("student")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "student"
                  ? "bg-gradient-to-br from-[#FFD428] to-[#FFC000] text-[#0A1022] shadow-lg border border-[#FFE066]"
                  : "text-[#0A1022]/70 hover:text-[#0A1022] hover:bg-white/30"
              }`}
            >
              {t.tabStudent}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTours.map((tour) => {
            const hasPosters = tour.posterUrls.length > 0;
            const activePoster = posterSlide[tour.id] ?? 0;
            const posterImage = hasPosters ? tour.posterUrls[activePoster % tour.posterUrls.length] : null;

            return (
              <div
                key={tour.id}
                className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  {hasPosters ? (
                    <ImageWithFallback
                      src={posterImage || tour.image}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageWithFallback
                      src={tour.image}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

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
                  <h3 className="text-xl font-bold text-[#0A1022] mb-3 group-hover:text-[#0D3B8E] transition-colors">
                    {tour.title}
                  </h3>

                  <div className="space-y-2 mb-4">
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
                      <span>{t.participants}: {tour.participants}</span>
                    </div>
                  </div>

                  {!hasPosters ? (
                    <p className="text-sm text-[#0A1022]/60 mb-4 line-clamp-2">{tour.description}</p>
                  ) : (
                    <p className="text-xs text-[#0A1022]/60 mb-4">{t.posterMode}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#0A1022]/60">{t.from}</span>
                      <p className="text-xl font-bold text-[#C81F1F]">{tour.price}</p>
                    </div>
                    <a
                      href={`/tours/${tour.slug}?lang=${lang}`}
                      className="rounded-lg border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-4 py-2 text-sm font-semibold text-[#0A1022] transition-all duration-300 hover:from-[#FFC000] hover:to-[#FFB000]"
                    >
                      {t.details}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
