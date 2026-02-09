import Link from "next/link";
import type { AppLanguage } from "@/lib/constants";
import { formatCurrencyKzt } from "@/lib/utils";

type TourCardProps = {
  lang: AppLanguage;
  tour: {
    slug: string;
    coverImage: string;
    price: number;
    place: string;
    duration: string;
    translations: Array<{ title: string; description: string }>;
  };
};

export function TourCard({ tour, lang }: TourCardProps) {
  const translation = tour.translations[0];

  return (
    <Link
      href={`/tours/${tour.slug}?lang=${lang}`}
      className="group rounded-3xl border border-white/30 bg-white/12 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:-translate-y-1"
    >
      <div
        className="h-56 rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url(${tour.coverImage})` }}
      />
      <div className="mt-4 space-y-2 text-white">
        <h3 className="text-xl font-bold">{translation?.title ?? tour.place}</h3>
        <p className="line-clamp-2 text-sm text-white/80">{translation?.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span>{tour.duration}</span>
          <span className="rounded-full bg-[#8d1111]/80 px-3 py-1 font-semibold">
            {formatCurrencyKzt(tour.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
