"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tourInputSchema } from "@/lib/validation";
import { z } from "zod";
import type { AppLanguage } from "@/lib/constants";

type TourFormValues = z.input<typeof tourInputSchema>;

type PosterTemplateData = {
  posterA: {
    heroTagline: string;
    featureBlocks: Array<{ title: string; lines: string[] }>;
    priceLabel: string;
  };
  posterB: {
    programTitle: string;
    timeline: Array<{ time: string; text: string }>;
    priceLabel: string;
    registerNote: string;
  };
  posterUrls?: string[];
};

type TourResponse = {
  id: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  coverImage: string;
  gallery: string[];
  price: number;
  studentLimit: number;
  duration: string;
  meetingTime: string;
  tourDate: string;
  place: string;
  location: string;
  translations: Array<{
    language: "KZ" | "RU" | "EN";
    title: string;
    description: string;
    translationStatus?: "MANUAL" | "AUTO_GENERATED" | "AUTO_EDITED";
    translationVersion?: number;
    sourceRuHash?: string | null;
    posterTemplateData: PosterTemplateData;
  }>;
};

type UploadSignature = {
  timestamp: number;
  folder: string;
  signature: string;
  apiKey: string;
  cloudName: string;
};

const EMPTY_POSTER: PosterTemplateData = {
  posterA: {
    heroTagline: "-",
    featureBlocks: [{ title: "-", lines: ["-"] }],
    priceLabel: "-"
  },
  posterB: {
    programTitle: "-",
    timeline: [{ time: "-", text: "-" }],
    priceLabel: "-",
    registerNote: "-"
  },
  posterUrls: []
};

function emptyTranslation() {
  return {
    title: "",
    description: "",
    posterTemplateData: EMPTY_POSTER,
    translationStatus: "MANUAL" as const,
    translationVersion: 1,
    sourceRuHash: null
  };
}

function normalizePosterTemplateData(input: unknown): PosterTemplateData {
  const item = typeof input === "object" && input && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const posterA = typeof item.posterA === "object" && item.posterA && !Array.isArray(item.posterA) ? (item.posterA as Record<string, unknown>) : {};
  const posterB = typeof item.posterB === "object" && item.posterB && !Array.isArray(item.posterB) ? (item.posterB as Record<string, unknown>) : {};
  const rawUrls = Array.isArray(item.posterUrls) ? item.posterUrls : [];
  const posterUrls = rawUrls.filter((v): v is string => typeof v === "string" && v.trim().length > 0);

  return {
    posterA: {
      heroTagline: typeof posterA.heroTagline === "string" && posterA.heroTagline ? posterA.heroTagline : "-",
      featureBlocks:
        Array.isArray(posterA.featureBlocks) && posterA.featureBlocks.length > 0
          ? (posterA.featureBlocks as Array<{ title?: string; lines?: string[] }>).map((block) => ({
              title: block.title && block.title.trim() ? block.title : "-",
              lines: Array.isArray(block.lines) && block.lines.length > 0 ? block.lines.map((line) => line || "-") : ["-"]
            }))
          : [{ title: "-", lines: ["-"] }],
      priceLabel: typeof posterA.priceLabel === "string" && posterA.priceLabel ? posterA.priceLabel : "-"
    },
    posterB: {
      programTitle: typeof posterB.programTitle === "string" && posterB.programTitle ? posterB.programTitle : "-",
      timeline:
        Array.isArray(posterB.timeline) && posterB.timeline.length > 0
          ? (posterB.timeline as Array<{ time?: string; text?: string }>).map((row) => ({
              time: row.time && row.time.trim() ? row.time : "-",
              text: row.text && row.text.trim() ? row.text : "-"
            }))
          : [{ time: "-", text: "-" }],
      priceLabel: typeof posterB.priceLabel === "string" && posterB.priceLabel ? posterB.priceLabel : "-",
      registerNote: typeof posterB.registerNote === "string" && posterB.registerNote ? posterB.registerNote : "-"
    },
    posterUrls
  };
}

async function uploadFileToCloudinary(file: File): Promise<string> {
  const signatureResponse = await fetch("/api/admin/upload", { method: "POST" });
  if (!signatureResponse.ok) {
    throw new Error("UPLOAD_SIGNATURE_FAILED");
  }

  const signature = (await signatureResponse.json()) as UploadSignature;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("folder", signature.folder);
  formData.append("signature", signature.signature);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!uploadResponse.ok) {
    throw new Error("UPLOAD_FAILED");
  }

  const payload = (await uploadResponse.json()) as { secure_url?: string };
  if (!payload.secure_url) {
    throw new Error("UPLOAD_FAILED");
  }
  return payload.secure_url;
}

const tourFormUi = {
  kz: {
    setupTitle: "Турды баптау",
    setupHint: "Негізгі ақпарат -> аударма -> әр тілге постерлер.",
    sectionBasics: "Негізгі",
    sectionMedia: "Медиа және баға",
    studentLimit: "Студенттер лимиті",
    sectionSchedule: "Кездесу және орын",
    sectionTranslations: "Мәтін аудармалары",
    sectionPosters: "Постерлер (әр тілге бірнеше)",
    slug: "Slug",
    status: "Күйі",
    statusDraft: "Черновик",
    statusPublished: "Жарияланған",
    coverImage: "Мұқаба сурет URL",
    gallery: "Галерея (үтірмен бөлінген URL)",
    price: "Бағасы",
    duration: "Ұзақтығы",
    meetingTime: "Жиналу уақыты",
    tourDate: "Тур күні",
    place: "Орын",
    location: "Локация",
    title: "Тақырып",
    description: "Сипаттама",
    fillRuFirst: "Алдымен RU өрістерін толтырыңыз (кемі title және description).",
    overwriteConfirm: "KZ/EN мәтіні бар. Қайта аудару керек пе?",
    translating: "Аударылуда...",
    translateBtn: "RU -> KZ/EN аудару",
    translationError: "Аударма қатесі.",
    translationFailed: "Аударманы орындау мүмкін болмады.",
    postersWarning: "Жариялау үшін барлық 3 тілге кемі 1 постер жүктеген дұрыс.",
    publishWithoutPosters: "Кей тілдерде постерлер жоқ. Ескертуімен жариялау керек пе?",
    posterUploadFailed: "Постер жүктеу сәтсіз аяқталды.",
    addPoster: "Постер қосу",
    upload: "Жүктеу",
    remove: "Өшіру",
    englishPoster: "English постер",
    russianPoster: "Русский постер",
    kazakhPoster: "Қазақша постер",
    noPosters: "Постер әлі жоқ",
    saving: "Сақталуда...",
    saveTour: "Турды сақтау"
  },
  ru: {
    setupTitle: "Настройка тура",
    setupHint: "База -> перевод -> постеры для каждого языка.",
    sectionBasics: "Основное",
    sectionMedia: "Медиа и цена",
    studentLimit: "Лимит студентов",
    sectionSchedule: "Встреча и место",
    sectionTranslations: "Текст и перевод",
    sectionPosters: "Постеры (несколько на язык)",
    slug: "Slug",
    status: "Статус",
    statusDraft: "Черновик",
    statusPublished: "Опубликовано",
    coverImage: "URL обложки",
    gallery: "Галерея (URL через запятую)",
    price: "Цена",
    duration: "Длительность",
    meetingTime: "Время сбора",
    tourDate: "Дата тура",
    place: "Место",
    location: "Локация",
    title: "Название",
    description: "Описание",
    fillRuFirst: "Сначала заполните RU поля (минимум title и description).",
    overwriteConfirm: "KZ/EN уже содержат текст. Перезаписать переводом?",
    translating: "Перевод...",
    translateBtn: "Перевести RU -> KZ/EN",
    translationError: "Ошибка перевода.",
    translationFailed: "Не удалось выполнить перевод.",
    postersWarning: "Для публикации лучше загрузить хотя бы 1 постер для всех 3 языков.",
    publishWithoutPosters: "В некоторых языках нет постеров. Публиковать с предупреждением?",
    posterUploadFailed: "Не удалось загрузить постер.",
    addPoster: "Добавить еще",
    upload: "Загрузить",
    remove: "Удалить",
    englishPoster: "English постер",
    russianPoster: "Русский постер",
    kazakhPoster: "Казахский постер",
    noPosters: "Постеров пока нет",
    saving: "Сохранение...",
    saveTour: "Сохранить тур"
  },
  en: {
    setupTitle: "Tour setup",
    setupHint: "Basics -> translation -> posters per language.",
    sectionBasics: "Basics",
    sectionMedia: "Media and price",
    studentLimit: "Student limit",
    sectionSchedule: "Meeting and place",
    sectionTranslations: "Text and translation",
    sectionPosters: "Posters (multiple per language)",
    slug: "Slug",
    status: "Status",
    statusDraft: "Draft",
    statusPublished: "Published",
    coverImage: "Cover image URL",
    gallery: "Gallery (comma-separated URLs)",
    price: "Price",
    duration: "Duration",
    meetingTime: "Meeting time",
    tourDate: "Tour date",
    place: "Place",
    location: "Location",
    title: "Title",
    description: "Description",
    fillRuFirst: "Fill RU fields first (at least title and description).",
    overwriteConfirm: "KZ/EN already has text. Overwrite by translation?",
    translating: "Translating...",
    translateBtn: "Translate RU -> KZ/EN",
    translationError: "Translation error.",
    translationFailed: "Translation failed.",
    postersWarning: "For publishing, upload at least one poster for all 3 languages.",
    publishWithoutPosters: "Some languages have no posters. Publish anyway?",
    posterUploadFailed: "Poster upload failed.",
    addPoster: "Add more",
    upload: "Upload",
    remove: "Remove",
    englishPoster: "English poster",
    russianPoster: "Russian poster",
    kazakhPoster: "Kazakh poster",
    noPosters: "No posters yet",
    saving: "Saving...",
    saveTour: "Save tour"
  }
} as const;

export function TourForm({ initial, lang = "ru" }: { initial?: TourResponse; lang?: AppLanguage }) {
  const router = useRouter();
  const ui = tourFormUi[lang];
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const uploadRefs = {
    ru: useRef<HTMLInputElement | null>(null),
    kz: useRef<HTMLInputElement | null>(null),
    en: useRef<HTMLInputElement | null>(null)
  };

  const mappedInitial = useMemo(() => {
    const kzRaw = initial?.translations.find((item) => item.language === "KZ");
    const ruRaw = initial?.translations.find((item) => item.language === "RU");
    const enRaw = initial?.translations.find((item) => item.language === "EN");

    const kz = kzRaw ? { ...kzRaw, posterTemplateData: normalizePosterTemplateData(kzRaw.posterTemplateData) } : emptyTranslation();
    const ru = ruRaw ? { ...ruRaw, posterTemplateData: normalizePosterTemplateData(ruRaw.posterTemplateData) } : emptyTranslation();
    const en = enRaw ? { ...enRaw, posterTemplateData: normalizePosterTemplateData(enRaw.posterTemplateData) } : emptyTranslation();

    return {
      slug: initial?.slug ?? "",
      status: initial?.status ?? "DRAFT",
      coverImage: initial?.coverImage ?? "",
      gallery: initial?.gallery ?? [],
      price: initial?.price ?? 0,
      studentLimit: initial?.studentLimit ?? 40,
      duration: initial?.duration ?? "",
      meetingTime: initial?.meetingTime ?? "",
      tourDate: initial?.tourDate ? initial.tourDate.slice(0, 10) : "",
      place: initial?.place ?? "",
      location: initial?.location ?? "",
      translations: { kz, ru, en }
    };
  }, [initial]);

  const [posterUrlsByLang, setPosterUrlsByLang] = useState<Record<"ru" | "kz" | "en", string[]>>({
    ru: mappedInitial.translations.ru.posterTemplateData.posterUrls ?? [],
    kz: mappedInitial.translations.kz.posterTemplateData.posterUrls ?? [],
    en: mappedInitial.translations.en.posterTemplateData.posterUrls ?? []
  });

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourInputSchema),
    defaultValues: mappedInitial
  });

  function setPosterUrl(language: "ru" | "kz" | "en", index: number, value: string) {
    setPosterUrlsByLang((prev) => {
      const next = { ...prev, [language]: [...prev[language]] };
      next[language][index] = value;
      return next;
    });
  }

  function addPoster(language: "ru" | "kz" | "en") {
    setPosterUrlsByLang((prev) => ({ ...prev, [language]: [...prev[language], ""] }));
  }

  function removePoster(language: "ru" | "kz" | "en", index: number) {
    setPosterUrlsByLang((prev) => ({
      ...prev,
      [language]: prev[language].filter((_, idx) => idx !== index)
    }));
  }

  async function onUploadPoster(language: "ru" | "kz" | "en", index?: number, file?: File | null) {
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadFileToCloudinary(file);
      setPosterUrlsByLang((prev) => {
        const list = [...prev[language]];
        if (typeof index === "number") {
          list[index] = url;
        } else {
          list.push(url);
        }
        return { ...prev, [language]: list };
      });
    } catch {
      setError(ui.posterUploadFailed);
    } finally {
      setSaving(false);
    }
  }

  async function onTranslate() {
    const ru = form.getValues("translations.ru");

    if (!ru.title || !ru.description) {
      setError(ui.fillRuFirst);
      return;
    }

    const kz = form.getValues("translations.kz");
    const en = form.getValues("translations.en");
    const hasExisting = Boolean(kz.title || kz.description || en.title || en.description);

    if (hasExisting) {
      const confirmed = window.confirm(ui.overwriteConfirm);
      if (!confirmed) return;
    }

    setTranslating(true);
    setError("");

    try {
      const response = await fetch("/api/admin/tours/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ru })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || ui.translationFailed);
        setTranslating(false);
        return;
      }

      form.setValue("translations.kz", {
        ...data.kz,
        posterTemplateData: {
          ...normalizePosterTemplateData(data.kz.posterTemplateData),
          posterUrls: posterUrlsByLang.kz
        }
      });
      form.setValue("translations.en", {
        ...data.en,
        posterTemplateData: {
          ...normalizePosterTemplateData(data.en.posterTemplateData),
          posterUrls: posterUrlsByLang.en
        }
      });
    } catch {
      setError(ui.translationError);
    } finally {
      setTranslating(false);
    }
  }

  async function onSubmit(values: TourFormValues) {
    setSaving(true);
    setError("");

    const payload = {
      ...values,
      gallery: values.gallery.filter(Boolean),
      translations: {
        ru: {
          ...values.translations.ru,
          translationStatus: "MANUAL" as const,
          posterTemplateData: {
            ...values.translations.ru.posterTemplateData,
            posterUrls: posterUrlsByLang.ru.filter(Boolean)
          }
        },
        kz: {
          ...values.translations.kz,
          translationStatus:
            values.translations.kz.translationStatus === "AUTO_GENERATED" ? "AUTO_EDITED" : values.translations.kz.translationStatus,
          posterTemplateData: {
            ...values.translations.kz.posterTemplateData,
            posterUrls: posterUrlsByLang.kz.filter(Boolean)
          }
        },
        en: {
          ...values.translations.en,
          translationStatus:
            values.translations.en.translationStatus === "AUTO_GENERATED" ? "AUTO_EDITED" : values.translations.en.translationStatus,
          posterTemplateData: {
            ...values.translations.en.posterTemplateData,
            posterUrls: posterUrlsByLang.en.filter(Boolean)
          }
        }
      }
    };

    const missingLangs = (["ru", "kz", "en"] as const).filter((lng) => (posterUrlsByLang[lng].filter(Boolean).length === 0));
    if (values.status === "PUBLISHED" && missingLangs.length > 0) {
      const accepted = window.confirm(ui.publishWithoutPosters);
      if (!accepted) {
        setSaving(false);
        return;
      }
    }

    const url = initial ? `/api/admin/tours/${initial.id}` : "/api/admin/tours";
    const method = initial ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(data?.message || "Failed to save tour");
      setSaving(false);
      return;
    }

    router.push("/admin/tours");
    router.refresh();
  }

  function renderPosterColumn(language: "en" | "ru" | "kz", title: string) {
    const urls = posterUrlsByLang[language];
    return (
      <div className="space-y-2 rounded-xl border border-white/20 bg-black/20 p-3">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        {urls.length === 0 ? <p className="text-xs text-white/60">{ui.noPosters}</p> : null}
        {urls.map((url, index) => (
          <div key={`${language}-${index}`} className="space-y-2 rounded-lg border border-white/15 bg-white/5 p-2">
            <div className="flex gap-2">
              <input
                value={url}
                onChange={(event) => setPosterUrl(language, index, event.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/30 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              />
              <button
                type="button"
                onClick={() => removePoster(language, index)}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
              >
                {ui.remove}
              </button>
            </div>
            {url ? <img src={url} alt={`${language}-poster-${index + 1}`} className="w-full rounded-lg object-cover" /> : null}
          </div>
        ))}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addPoster(language)}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
          >
            {ui.addPoster}
          </button>
          <button
            type="button"
            onClick={() => uploadRefs[language].current?.click()}
            className="rounded-lg bg-white/20 px-3 py-2 text-xs font-semibold text-white"
          >
            {ui.upload}
          </button>
          <input
            ref={uploadRefs[language]}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void onUploadPoster(language, undefined, event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <section className="rounded-2xl border border-white/20 bg-white/8 p-4">
        <h2 className="text-base font-bold text-white">{ui.setupTitle}</h2>
        <p className="mt-1 text-sm text-white/70">{ui.setupHint}</p>
      </section>

      {error ? <p className="rounded-xl bg-red-500/20 p-3 text-sm text-red-100">{error}</p> : null}

      {form.watch("status") === "PUBLISHED" &&
      (posterUrlsByLang.ru.filter(Boolean).length === 0 ||
        posterUrlsByLang.kz.filter(Boolean).length === 0 ||
        posterUrlsByLang.en.filter(Boolean).length === 0) ? (
        <p className="rounded-xl bg-yellow-500/20 p-3 text-sm text-yellow-100">{ui.postersWarning}</p>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionBasics}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={ui.slug} {...form.register("slug")} />
          <Select
            label={ui.status}
            {...form.register("status")}
            options={[
              { value: "DRAFT", label: ui.statusDraft },
              { value: "PUBLISHED", label: ui.statusPublished }
            ]}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionMedia}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={ui.coverImage} {...form.register("coverImage")} />
          <Input
            label={ui.gallery}
            defaultValue={mappedInitial.gallery.join(", ")}
            onChange={(event) => {
              const value = event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
              form.setValue("gallery", value);
            }}
          />
          <Input label={ui.price} type="number" {...form.register("price", { valueAsNumber: true })} />
          <Input label={ui.studentLimit} type="number" {...form.register("studentLimit", { valueAsNumber: true })} />
          <Input label={ui.duration} {...form.register("duration")} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionSchedule}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={ui.meetingTime} {...form.register("meetingTime")} />
          <Input label={ui.tourDate} type="date" {...form.register("tourDate")} />
          <Input label={ui.place} {...form.register("place")} />
          <Input label={ui.location} {...form.register("location")} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionTranslations}</h3>
          <button
            type="button"
            onClick={onTranslate}
            disabled={translating}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {translating ? ui.translating : ui.translateBtn}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/20 bg-black/20 p-3">
            <h4 className="mb-2 text-sm font-bold uppercase text-white">RU</h4>
            <Input label={ui.title} {...form.register("translations.ru.title")} />
            <Input label={ui.description} {...form.register("translations.ru.description")} />
          </div>
          <div className="rounded-xl border border-white/20 bg-black/20 p-3">
            <h4 className="mb-2 text-sm font-bold uppercase text-white">KZ</h4>
            <Input label={ui.title} {...form.register("translations.kz.title")} />
            <Input label={ui.description} {...form.register("translations.kz.description")} />
          </div>
          <div className="rounded-xl border border-white/20 bg-black/20 p-3">
            <h4 className="mb-2 text-sm font-bold uppercase text-white">EN</h4>
            <Input label={ui.title} {...form.register("translations.en.title")} />
            <Input label={ui.description} {...form.register("translations.en.description")} />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionPosters}</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {renderPosterColumn("en", ui.englishPoster)}
          {renderPosterColumn("ru", ui.russianPoster)}
          {renderPosterColumn("kz", ui.kazakhPoster)}
        </div>
      </section>

      <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border border-white/25 bg-black/35 p-3 backdrop-blur-md">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#8d1111] px-5 py-2 font-semibold text-white disabled:opacity-60"
        >
          {saving ? ui.saving : ui.saveTour}
        </button>
      </div>
    </form>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

function Input({ label, ...props }: InputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white outline-none disabled:opacity-50"
      />
    </label>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ value: string; label: string }>;
};

function Select({ label, options, ...props }: SelectProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
