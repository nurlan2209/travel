import type { Prisma } from "@prisma/client";
import type { AppLanguage } from "@/lib/constants";
import { t } from "@/lib/i18n";

type PosterData = Prisma.JsonValue;

function safePosterData(input: PosterData) {
  const data = typeof input === "object" && input && !Array.isArray(input) ? input : {};
  const item = data as Record<string, unknown>;
  const posterB =
    typeof item.posterB === "object" && item.posterB && !Array.isArray(item.posterB)
      ? (item.posterB as Record<string, unknown>)
      : null;
  const posterA =
    typeof item.posterA === "object" && item.posterA && !Array.isArray(item.posterA)
      ? (item.posterA as Record<string, unknown>)
      : null;

  return {
    date: typeof item.date === "string" ? item.date : "",
    meetupTime: typeof item.meetupTime === "string" ? item.meetupTime : "",
    meetupPoint: typeof item.meetupPoint === "string" ? item.meetupPoint : "",
    transferWindow: typeof item.transferWindow === "string" ? item.transferWindow : "",
    program: Array.isArray(item.program)
      ? item.program.filter((v): v is string => typeof v === "string")
      : Array.isArray(posterB?.timeline)
        ? (posterB?.timeline as Array<{ time?: string; text?: string }>).map((row) => `${row.time || ""} ${row.text || ""}`.trim())
        : [],
    priceLabel:
      typeof item.priceLabel === "string"
        ? item.priceLabel
        : typeof posterA?.priceLabel === "string"
          ? posterA.priceLabel
          : typeof posterB?.priceLabel === "string"
            ? posterB.priceLabel
            : "",
    locationLabel:
      typeof item.locationLabel === "string"
        ? item.locationLabel
        : typeof posterB?.registerNote === "string"
          ? posterB.registerNote
          : ""
  };
}

export function PosterPreview({ posterData, lang }: { posterData: PosterData; lang: AppLanguage }) {
  const poster = safePosterData(posterData);
  const dict = t(lang);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/80 to-cyan-100/70 p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-xl font-black uppercase tracking-wide text-[#8d1111]">{dict.posterBlockTitle}</h3>
        <span className="rounded-full bg-white/80 px-4 py-2 text-2xl font-black text-[#8d1111]">{poster.priceLabel}</span>
      </div>

      <div className="mb-4 rounded-2xl bg-white/70 p-4">
        <p className="text-sm font-semibold text-slate-700">{dict.posterDate}: {poster.date}</p>
        <p className="text-sm font-semibold text-slate-700">{dict.posterMeetup}: {poster.meetupTime}</p>
        <p className="text-sm text-slate-700">{dict.posterPoint}: {poster.meetupPoint}</p>
        <p className="text-sm text-slate-700">{dict.posterTransfer}: {poster.transferWindow}</p>
      </div>

      <ol className="space-y-2">
        {poster.program.map((line) => (
          <li key={line} className="rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-[#102a43]">
            {line}
          </li>
        ))}
      </ol>

      <p className="mt-4 text-sm font-bold text-slate-700">{dict.posterLocation}: {poster.locationLabel}</p>
    </section>
  );
}
