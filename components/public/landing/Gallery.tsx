"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export default function Gallery({ lang }: GalleryProps) {
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(180);
  const dragXRef = useRef(0);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

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
      subtitle: "Студенттердің ең жақсы сәттері",
      empty: "Әзірге бекітілген студент сәттері жоқ.",
      dragHint: "Карталарды айналдыру үшін тартыңыз"
    },
    ru: {
      title: "Наши путешествия",
      subtitle: "Лучшие моменты студентов",
      empty: "Пока нет одобренных студенческих моментов.",
      dragHint: "Потяните, чтобы вращать карусель"
    },
    en: {
      title: "Our Journeys",
      subtitle: "Best Moments from Students",
      empty: "No approved student moments yet.",
      dragHint: "Drag to rotate the carousel"
    }
  };

  const t = translations[lang];
  const galleryImages = useMemo(
    () =>
      moments.map((item) => ({
        src: item.photoUrl,
        alt: `${item.studentName} — ${item.tourTitle}`,
        caption: item.caption
      })),
    [moments]
  );
  const desktopImages = galleryImages.slice(0, 10);
  const angleStep = desktopImages.length > 0 ? 360 / desktopImages.length : 36;

  const applyRotation = useCallback(() => {
    if (!ringRef.current) return;
    ringRef.current.style.transform = `translateZ(-500px) rotateY(${rotationRef.current}deg)`;
  }, []);

  useEffect(() => {
    applyRotation();
  }, [applyRotation, desktopImages.length]);

  useEffect(() => {
    if (desktopImages.length < 2) return;
    let raf = 0;
    const tick = () => {
      if (!draggingRef.current) {
        rotationRef.current += 0.08;
        applyRotation();
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [applyRotation, desktopImages.length]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    stageRef.current.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setIsDragging(true);
    dragXRef.current = event.clientX;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const delta = event.clientX - dragXRef.current;
    rotationRef.current += delta * 0.35;
    dragXRef.current = event.clientX;
    applyRotation();
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    if (stageRef.current.hasPointerCapture(event.pointerId)) {
      stageRef.current.releasePointerCapture(event.pointerId);
    }
    draggingRef.current = false;
    setIsDragging(false);
  };

  const rotateByStep = (multiplier: number) => {
    rotationRef.current += angleStep * multiplier;
    applyRotation();
  };

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-[#FFF9DF] to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A1022] mb-4">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70">{t.subtitle}</p>
        </div>

        {galleryImages.length === 0 ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#0A1022]/10 bg-white/80 p-6 text-center text-[#0A1022]/70 shadow-[0_18px_46px_rgba(10,16,34,0.08)]">
            {t.empty}
          </div>
        ) : (
          <>
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden">
              {galleryImages.map((image, index) => (
                <article key={`mobile-moment-${index}`} className="glass-card relative min-h-[300px] min-w-[86%] snap-center overflow-hidden rounded-2xl">
                  <ImageWithFallback src={image.src} alt={image.alt} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-3 py-2 text-xs text-white">{image.caption}</div>
                </article>
              ))}
            </div>

            <div className="relative mx-auto hidden w-full max-w-6xl md:block">
              <div
                ref={stageRef}
                className={`relative h-[500px] overflow-hidden rounded-[2rem] border border-[#0A1022]/10 bg-[radial-gradient(circle_at_50%_40%,#fff8de_0%,#fff1c2_38%,#fde9a4_100%)] shadow-[0_25px_80px_rgba(10,16,34,0.18)] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
              >
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 via-black/0 to-transparent" />
                <div className="absolute inset-0 [perspective:2000px]">
                  <div
                    ref={ringRef}
                    className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] transition-transform duration-150 ease-out"
                  >
                    {desktopImages.map((image, index) => (
                      <article
                        key={`ring-${index}`}
                        className="absolute left-1/2 top-1/2 h-[250px] w-[390px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/35 bg-black/10 shadow-[0_20px_50px_rgba(10,16,34,0.25)]"
                        style={{ transform: `rotateY(${-index * angleStep}deg) translateZ(500px)` }}
                      >
                        <ImageWithFallback src={image.src} alt={image.alt} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
                          <p className="line-clamp-2 text-sm font-medium text-white">{image.caption}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => rotateByStep(1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/30 px-3 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-black/45"
                  aria-label="Rotate previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => rotateByStep(-1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/30 px-3 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-black/45"
                  aria-label="Rotate next"
                >
                  ›
                </button>
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/35 bg-black/30 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
                  {t.dragHint}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
