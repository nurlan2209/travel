"use client";

import { useEffect, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface GalleryProps {
  lang: "kz" | "ru" | "en";
}

type MomentItem = {
  id: string;
  photoUrl: string;
  caption: string;
  studentName: string;
  tourTitle: string;
};

const fallbackImages = [
  {
    src: "https://images.unsplash.com/photo-1698420475875-6d838697083b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLYXpha2hzdGFuJTIwbW91bnRhaW5zJTIwbGFuZHNjYXBlJTIwdHJhdmVsfGVufDF8fHx8MTc3MDQ2MDUxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Kazakhstan Mountains"
  },
  {
    src: "https://images.unsplash.com/photo-1686645995031-35ca3a653af5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLYXpha2hzdGFuJTIwbGFrZSUyMG5hdHVyZSUyMEtvbHNhaXxlbnwxfHx8fDE3NzA0NjA1NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Kolsai Lake"
  },
  {
    src: "https://images.unsplash.com/photo-1607644546432-45b4e524dd3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGFyeW4lMjBDYW55b24lMjBLYXpha2hzdGFufGVufDF8fHx8MTc3MDQ2MDU0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Charyn Canyon"
  },
  {
    src: "https://images.unsplash.com/photo-1698324357891-1bb903b5e48c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGhpa2luZyUyMGFkdmVudHVyZSUyMG1vdW50YWluc3xlbnwxfHx8fDE3NzA0NjA1MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Students Hiking"
  },
  {
    src: "https://images.unsplash.com/photo-1582826310241-0cd9cc92dbb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHBlb3BsZSUyMGdyb3VwJTIwdHJhdmVsaW5nJTIwYWR2ZW50dXJlfGVufDF8fHx8MTc3MDQ2MDU0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Travel Group"
  }
];

export default function Gallery({ lang }: GalleryProps) {
  const [moments, setMoments] = useState<MomentItem[]>([]);

  useEffect(() => {
    async function loadMoments() {
      const response = await fetch(`/api/moments?lang=${lang}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as MomentItem[];
      setMoments(data);
    }
    void loadMoments();
  }, [lang]);

  const translations = {
    kz: {
      title: "Біздің саяхаттар",
      subtitle: "Студенттердің ең жақсы сәттері"
    },
    ru: {
      title: "Наши путешествия",
      subtitle: "Лучшие моменты студентов"
    },
    en: {
      title: "Our Journeys",
      subtitle: "Best Moments from Students"
    }
  };

  const t = translations[lang];
  const galleryImages =
    moments.length > 0
      ? moments.map((item) => ({
          src: item.photoUrl,
          alt: `${item.studentName} — ${item.tourTitle}`,
          caption: item.caption
        }))
      : fallbackImages;

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-[#FFF9DF] to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A1022] mb-4">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70">{t.subtitle}</p>
        </div>

        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden">
          {galleryImages.map((image, index) => (
            <article key={`mobile-moment-${index}`} className="glass-card relative min-h-[300px] min-w-[86%] snap-center overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              {"caption" in image ? (
                <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-3 py-2 text-xs text-white">
                  {(image as { caption?: string }).caption}
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <div className="hidden max-w-7xl mx-auto gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 lg:row-span-2">
            <div className="group glass-card relative h-full min-h-[400px] overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={galleryImages[0].src}
                alt={galleryImages[0].alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {"caption" in galleryImages[0] ? (
                <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-3 py-2 text-xs text-white">
                  {(galleryImages[0] as { caption?: string }).caption}
                </div>
              ) : null}
            </div>
          </div>

          {galleryImages.slice(1).map((image, index) => (
            <div key={index}>
              <div className="group glass-card relative h-full min-h-[190px] overflow-hidden rounded-2xl">
                <ImageWithFallback
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {"caption" in image ? (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-3 py-2 text-xs text-white">
                    {(image as { caption?: string }).caption}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
