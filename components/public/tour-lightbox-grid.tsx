"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  images: string[];
  altPrefix: string;
  cardHeightClass?: string;
};

export function TourLightboxGrid({ images, altPrefix, cardHeightClass = "h-56" }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length));
        return;
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((url, idx) => (
          <button
            key={`${url}-${idx}`}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`relative ${cardHeightClass} overflow-hidden rounded-2xl border border-[#0A1022]/10 text-left`}
            aria-label={`open-${altPrefix}-${idx + 1}`}
          >
            <Image
              src={url}
              alt={`${altPrefix}-${idx + 1}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] bg-black/82 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
        >
          <div className="relative mx-auto flex h-full w-full max-w-6xl items-center justify-center px-4 py-10">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
              onClick={() => setActiveIndex(null)}
              aria-label="close-preview"
            >
              <X size={20} />
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length));
                  }}
                  aria-label="prev-image"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
                  }}
                  aria-label="next-image"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            ) : null}

            <div
              className="relative h-full max-h-[86vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/25"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={images[activeIndex]}
                alt={`${altPrefix}-preview-${activeIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
