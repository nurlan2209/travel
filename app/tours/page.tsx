import Link from "next/link";
import { Calendar, Clock3, Filter, MapPin, Search } from "lucide-react";
import { normalizeLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/public/site-header";
import { getTourCatalog, getTourLocations, normalizeSort, type TourCatalogSort } from "@/lib/tour-catalog";

export const dynamic = "force-dynamic";

type ToursCatalogPageProps = {
  searchParams: Promise<{
    lang?: string;
    q?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
};

function toPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

function formatDate(value: Date, lang: "kz" | "ru" | "en") {
  const locale = lang === "kz" ? "kk-KZ" : lang === "en" ? "en-US" : "ru-RU";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(value);
}

function formatPrice(value: number, lang: "kz" | "ru" | "en") {
  const locale = lang === "en" ? "en-US" : "ru-RU";
  return `${new Intl.NumberFormat(locale).format(value)} ₸`;
}

export default async function ToursCatalogPage({ searchParams }: ToursCatalogPageProps) {
  const query = await searchParams;
  const lang = normalizeLanguage(query.lang);
  const sort = normalizeSort(query.sort) as TourCatalogSort;
  const page = toPositiveInt(query.page, 1);
  const pageSize = toPositiveInt(query.pageSize, 12);

  const [catalog, locations] = await Promise.all([
    getTourCatalog({
      lang,
      q: query.q,
      location: query.location,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      sort,
      page,
      pageSize
    }),
    getTourLocations()
  ]);

  const ui = {
    kz: {
      title: "Барлық турлар",
      subtitle: "Күнге, бағаға және локацияға қарай ыңғайлы сүзгілеу",
      search: "Тур атауы немесе орын",
      location: "Локация",
      allLocations: "Барлық локациялар",
      dateFrom: "Күні (бастап)",
      dateTo: "Күні (дейін)",
      sort: "Сұрыптау",
      apply: "Қолдану",
      reset: "Тазарту",
      sortDateAsc: "Күні: ерте → кеш",
      sortDateDesc: "Күні: кеш → ерте",
      sortPriceAsc: "Бағасы: арзан → қымбат",
      sortPriceDesc: "Бағасы: қымбат → арзан",
      colDate: "Күні",
      colTour: "Тур",
      colLocation: "Локация",
      colDuration: "Ұзақтығы",
      colPrice: "Бағасы",
      details: "Толығырақ",
      empty: "Фильтр бойынша тур табылмады",
      prev: "Алдыңғы",
      next: "Келесі",
      total: "Барлығы",
      page: "Бет"
    },
    ru: {
      title: "Все туры",
      subtitle: "Удобный каталог с фильтрами по дате, цене и локации",
      search: "Название тура или место",
      location: "Локация",
      allLocations: "Все локации",
      dateFrom: "Дата от",
      dateTo: "Дата до",
      sort: "Сортировка",
      apply: "Применить",
      reset: "Сбросить",
      sortDateAsc: "По дате: сначала ближайшие",
      sortDateDesc: "По дате: сначала дальние",
      sortPriceAsc: "По цене: дешевле → дороже",
      sortPriceDesc: "По цене: дороже → дешевле",
      colDate: "Дата",
      colTour: "Тур",
      colLocation: "Локация",
      colDuration: "Длительность",
      colPrice: "Цена",
      details: "Подробнее",
      empty: "По выбранным фильтрам туры не найдены",
      prev: "Назад",
      next: "Вперед",
      total: "Всего",
      page: "Страница"
    },
    en: {
      title: "All Tours",
      subtitle: "Smart catalog with filters by date, price, and location",
      search: "Tour title or place",
      location: "Location",
      allLocations: "All locations",
      dateFrom: "Date from",
      dateTo: "Date to",
      sort: "Sort by",
      apply: "Apply",
      reset: "Reset",
      sortDateAsc: "Date: nearest first",
      sortDateDesc: "Date: latest first",
      sortPriceAsc: "Price: low → high",
      sortPriceDesc: "Price: high → low",
      colDate: "Date",
      colTour: "Tour",
      colLocation: "Location",
      colDuration: "Duration",
      colPrice: "Price",
      details: "Details",
      empty: "No tours found for selected filters",
      prev: "Prev",
      next: "Next",
      total: "Total",
      page: "Page"
    }
  }[lang];

  const queryForPage = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set("lang", lang);
    if (query.q) params.set("q", query.q);
    if (query.location) params.set("location", query.location);
    if (query.dateFrom) params.set("dateFrom", query.dateFrom);
    if (query.dateTo) params.set("dateTo", query.dateTo);
    params.set("sort", sort);
    params.set("pageSize", String(pageSize));
    params.set("page", String(targetPage));
    return `/tours?${params.toString()}`;
  };

  return (
    <main className="theme-page-surface theme-catalog min-h-screen bg-[linear-gradient(180deg,#fefefe_0%,#fff7d4_100%)] text-[#0A1022]">
      <SiteHeader lang={lang} />

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">{ui.title}</h1>
          <p className="mt-2 text-[#0A1022]/70">{ui.subtitle}</p>
        </div>

        <form method="GET" action="/tours" className="glass-white-strong mb-7 rounded-2xl border border-white/80 p-4 md:p-5">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="pageSize" value={String(pageSize)} />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="xl:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#0A1022]/65">
                {ui.search}
              </span>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0A1022]/45" />
                <input
                  name="q"
                  defaultValue={query.q ?? ""}
                  placeholder={ui.search}
                  className="w-full rounded-xl border border-[#0A1022]/12 bg-white/80 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#0D3B8E]"
                />
              </div>
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#0A1022]/65">
                {ui.location}
              </span>
              <select
                name="location"
                defaultValue={query.location ?? ""}
                className="w-full rounded-xl border border-[#0A1022]/12 bg-white/80 px-3 py-2.5 text-sm outline-none transition focus:border-[#0D3B8E]"
              >
                <option value="">{ui.allLocations}</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#0A1022]/65">
                {ui.dateFrom}
              </span>
              <input
                type="date"
                name="dateFrom"
                defaultValue={query.dateFrom ?? ""}
                className="w-full rounded-xl border border-[#0A1022]/12 bg-white/80 px-3 py-2.5 text-sm outline-none transition focus:border-[#0D3B8E]"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#0A1022]/65">
                {ui.dateTo}
              </span>
              <input
                type="date"
                name="dateTo"
                defaultValue={query.dateTo ?? ""}
                className="w-full rounded-xl border border-[#0A1022]/12 bg-white/80 px-3 py-2.5 text-sm outline-none transition focus:border-[#0D3B8E]"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#0A1022]/65">
                {ui.sort}
              </span>
              <select
                name="sort"
                defaultValue={sort}
                className="w-full rounded-xl border border-[#0A1022]/12 bg-white/80 px-3 py-2.5 text-sm outline-none transition focus:border-[#0D3B8E]"
              >
                <option value="date_asc">{ui.sortDateAsc}</option>
                <option value="date_desc">{ui.sortDateDesc}</option>
                <option value="price_asc">{ui.sortPriceAsc}</option>
                <option value="price_desc">{ui.sortPriceDesc}</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-5 py-2.5 text-sm font-bold text-[#0A1022] transition-all hover:from-[#FFC000] hover:to-[#FFB000]"
            >
              <Filter size={16} />
              {ui.apply}
            </button>
            <Link href={`/tours?lang=${lang}`} className="rounded-xl border border-[#0A1022]/15 bg-white/75 px-5 py-2.5 text-sm font-semibold hover:bg-white">
              {ui.reset}
            </Link>
          </div>
        </form>

        {catalog.items.length === 0 ? (
          <div className="glass-white rounded-2xl p-6 text-center text-[#0A1022]/75">{ui.empty}</div>
        ) : (
          <>
            <div className="glass-white hidden overflow-hidden rounded-2xl border border-white/85 md:block">
              <table className="w-full text-left">
                <thead className="bg-[#0A1022]/5 text-xs uppercase tracking-wide text-[#0A1022]/70">
                  <tr>
                    <th className="px-4 py-3">{ui.colDate}</th>
                    <th className="px-4 py-3">{ui.colTour}</th>
                    <th className="px-4 py-3">{ui.colLocation}</th>
                    <th className="px-4 py-3">{ui.colDuration}</th>
                    <th className="px-4 py-3">{ui.colPrice}</th>
                    <th className="px-4 py-3 text-right">{ui.details}</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.items.map((tour) => (
                    <tr key={tour.id} className="border-t border-[#0A1022]/8">
                      <td className="px-4 py-4 text-sm font-medium">{formatDate(tour.tourDate, lang)}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold">{tour.title}</div>
                        <div className="mt-1 text-xs text-[#0A1022]/65 line-clamp-1">{tour.description}</div>
                      </td>
                      <td className="px-4 py-4 text-sm">{tour.location}</td>
                      <td className="px-4 py-4 text-sm">{tour.duration}</td>
                      <td className="px-4 py-4 text-sm font-bold text-[#C81F1F]">{formatPrice(tour.price, lang)}</td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/tours/${tour.slug}?lang=${lang}`}
                          className="rounded-lg border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-4 py-2 text-sm font-semibold text-[#0A1022] transition hover:from-[#FFC000] hover:to-[#FFB000]"
                        >
                          {ui.details}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {catalog.items.map((tour) => (
                <article key={`${tour.id}-mobile`} className="glass-white rounded-2xl border border-white/85 p-4">
                  <h3 className="text-lg font-bold">{tour.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[#0A1022]/70">{tour.description}</p>
                  <div className="mt-3 grid gap-2 text-sm text-[#0A1022]/75">
                    <p className="inline-flex items-center gap-2">
                      <Calendar size={15} />
                      {formatDate(tour.tourDate, lang)}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <MapPin size={15} />
                      {tour.location}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Clock3 size={15} />
                      {tour.duration}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-black text-[#C81F1F]">{formatPrice(tour.price, lang)}</p>
                    <Link
                      href={`/tours/${tour.slug}?lang=${lang}`}
                      className="rounded-lg border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-4 py-2 text-sm font-semibold text-[#0A1022]"
                    >
                      {ui.details}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#0A1022]/70">
            {ui.total}: {catalog.meta.total}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={queryForPage(Math.max(1, page - 1))}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                page <= 1
                  ? "pointer-events-none border-[#0A1022]/10 text-[#0A1022]/35"
                  : "border-[#0A1022]/20 bg-white/80 hover:bg-white"
              }`}
            >
              {ui.prev}
            </Link>
            <span className="text-sm text-[#0A1022]/70">
              {ui.page} {catalog.meta.page} / {catalog.meta.totalPages}
            </span>
            <Link
              href={queryForPage(Math.min(catalog.meta.totalPages, page + 1))}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                page >= catalog.meta.totalPages
                  ? "pointer-events-none border-[#0A1022]/10 text-[#0A1022]/35"
                  : "border-[#0A1022]/20 bg-white/80 hover:bg-white"
              }`}
            >
              {ui.next}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
